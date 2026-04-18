"use server";

import { revalidatePath } from "next/cache";

export type UploadResult =
  | { success: true; moleculeId: string; moleculeName: string }
  | { success: false; error: string };

export async function uploadMolecule(
  formData: FormData,
): Promise<UploadResult> {
  const file = formData.get("file") as File | null;

  if (!file) {
    return { success: false, error: "No file provided." };
  }

  if (!file.name.endsWith(".log")) {
    return { success: false, error: "Only Gaussian .log files are supported." };
  }

  // TODO: Replace with real parser + Drizzle insert
  // await new Promise((r) => setTimeout(r, 1500));
  revalidatePath("/");

  return {
    success: true,
    moleculeId: crypto.randomUUID(),
    moleculeName: file.name.replace(".log", ""),
  };
}
