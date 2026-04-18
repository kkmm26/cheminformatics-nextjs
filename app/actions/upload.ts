"use server";

import { revalidatePath } from "next/cache";
import { parseMolecule } from "@/app/lib/parser";
import { db } from "@/app/lib/db";
import { molecules, atoms } from "@/app/lib/db/schema";

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

  try {
    const fileContent = await file.text();
    const parsed = parseMolecule(fileContent, file.name);

    const [molecule] = await db
      .insert(molecules)
      .values({
        filename: parsed.filename,
        uploadedAt: parsed.uploadedAt,
        comment: parsed.comment,
        method: parsed.method,
        zpveCorrection: parsed.zpveCorrection,
        freeEnergyCorrection: parsed.freeEnergyCorrection,
        zpveEnergy: parsed.zpveEnergy,
        freeEnergy: parsed.freeEnergy,
        totalEntropy: parsed.totalEntropy,
        logPath: `/data/${file.name}`,
      })
      .returning({ id: molecules.id, filename: molecules.filename });

    if (parsed.atoms.length > 0) {
      await db.insert(atoms).values(
        parsed.atoms.map((atom) => ({
          moleculeId: molecule.id,
          atomicNumber: atom.atomicNumber,
          x: atom.x,
          y: atom.y,
          z: atom.z,
          atomIndex: atom.atomIndex,
        })),
      );
    }

    revalidatePath("/");

    return {
      success: true,
      moleculeId: String(molecule.id),
      moleculeName: molecule.filename.replace(".log", ""),
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to upload molecule",
    };
  }
}
