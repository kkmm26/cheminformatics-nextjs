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

export async function requestToRDKit(
  moleculeId: number,
  atomCoords: AtomCoord[],
  structureSvg?: string | null,
): Promise<RDKitResponse> {
  if (structureSvg) {
    return {
      svg: structureSvg,
      mol_block: "",
      success: true,
    };
  }

  const xyz = toXYZ(atomCoords);
  const apiUrl = process.env.RDKIT_API_URL;

  if (!apiUrl) {
    throw new Error("RDKIT_API_URL is not configured.");
  }

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      xyz_data: xyz,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Failed to convert XYZ data");
  }

  const rdkitResponse = (await res.json()) as RDKitResponse;

  if (!rdkitResponse.success) {
    throw new Error("RDKit did not return a successful response.");
  }

  if (rdkitResponse.svg) {
    await db
      .update(molecules)
      .set({ structureSvg: rdkitResponse.svg })
      .where(eq(molecules.id, moleculeId));
  }

  return rdkitResponse;
}
