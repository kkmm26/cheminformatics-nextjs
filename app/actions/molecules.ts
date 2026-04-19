"use server";

import { molecules, type MoleculeRow } from "@/app/lib/db/schema";
import { db } from "@/app/lib/db";
import { desc } from "drizzle-orm";

export async function getMolecules(): Promise<MoleculeRow[]> {
  return db
    .select({
      id: molecules.id,
      filename: molecules.filename,
      method: molecules.method,
      comment: molecules.comment,
      zpveCorrection: molecules.zpveCorrection,
      freeEnergyCorrection: molecules.freeEnergyCorrection,
      zpveEnergy: molecules.zpveEnergy,
      freeEnergy: molecules.freeEnergy,
      totalEntropy: molecules.totalEntropy,
      uploadedAt: molecules.uploadedAt,
    })
    .from(molecules)
    .orderBy(desc(molecules.uploadedAt));
}
