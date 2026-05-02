import { toXYZ } from "@/lib/chemistry";
import { AtomCoord } from "@/app/lib/db/schema";
import { db } from "@/app/lib/db";
import { molecules } from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";

export interface RDKitResponse {
  svg: string;
  // Currently not used by the UI, so it is intentionally left as-is for now.
  mol_block: string;
  success: boolean;
}

const MAX_RETRIES = 5; // increase retries for cold starts
const INITIAL_TIMEOUT = 60000; // 60s initial — cold boot can take 30-50s
const RETRY_DELAY = 3000;

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Ping the server first to wake it up
export async function pingToWakeUp(apiUrl: string): Promise<void> {
  try {
    await fetchWithTimeout(apiUrl, { method: "GET", cache: "no-store" }, 5000);
  } catch {}
}

async function fetchRDKitWithRetry(
  apiUrl: string,
  xyz: string,
  retries = MAX_RETRIES,
): Promise<Response> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // On first attempt, send a wake-up ping concurrently
      if (attempt === 0) {
        await pingToWakeUp(apiUrl);
      }

      // Each retry gives more time: 60s, 75s, 90s, 105s, 120s
      const timeoutMs = INITIAL_TIMEOUT + attempt * 15000;

      const res = await fetchWithTimeout(
        apiUrl,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ xyz_data: xyz }),
          cache: "no-store",
        },
        timeoutMs,
      );

      return res;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      const isAbort = lastError.name === "AbortError";
      const isNetwork =
        lastError.message.includes("fetch failed") ||
        lastError.message.includes("ECONNREFUSED");

      // Only retry on timeout/network errors, not on 4xx etc.
      if (!isAbort && !isNetwork) throw lastError;
      if (attempt === retries) break;

      const delay = RETRY_DELAY * Math.pow(2, attempt);
      console.warn(
        `RDKit attempt ${attempt + 1} failed (${lastError.message}), retrying in ${delay}ms...`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw (
    lastError ??
    new Error("Failed to connect to RDKit API after multiple attempts")
  );
}

export async function requestToRDKit(
  moleculeId: number,
  atomCoords: AtomCoord[],
  structureSvg?: string | null,
): Promise<RDKitResponse> {
  // 1. Return cached SVG if available
  if (structureSvg) {
    return {
      svg: structureSvg,
      mol_block: "",
      success: true,
    };
  }

  // 2. Prepare Data
  const xyz = toXYZ(atomCoords);
  const apiUrl = process.env.RDKIT_API_URL;

  if (!apiUrl) {
    throw new Error("RDKIT_API_URL is not configured.");
  }

  // 3. Fetch with Retry Logic
  const res = await fetchRDKitWithRetry(apiUrl, xyz);

  if (!res.ok) {
    // Handle specific HTTP errors from the RDKit API
    const errorData = await res.json().catch(() => ({})); // catch in case response isn't valid JSON
    throw new Error(errorData.detail || "Failed to convert XYZ data");
  }

  // 4. Parse Response
  const rdkitResponse = (await res.json()) as RDKitResponse;

  if (!rdkitResponse.success) {
    throw new Error("RDKit did not return a successful response.");
  }

  // 5. Update Database
  if (rdkitResponse.svg) {
    await db
      .update(molecules)
      .set({ structureSvg: rdkitResponse.svg })
      .where(eq(molecules.id, moleculeId));
  }

  return rdkitResponse;
}
