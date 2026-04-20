"use server";

import {
  molecules,
  type MoleculeRow,
  type MoleculeDetail,
  atoms,
} from "@/app/lib/db/schema";
import { db } from "@/app/lib/db";
import { desc, eq } from "drizzle-orm";

// Get all molecules for table rows (no atomcoords)
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

export async function getMoleculeById(
  id: number,
): Promise<MoleculeDetail | null> {
  const molecule = await db
    .select()
    .from(molecules)
    .where(eq(molecules.id, id))
    .limit(1)
    .then((rows) => rows[0] || null);

  if (!molecule) return null;

  const atomCoords = await db
    .select()
    .from(atoms)
    .where(eq(atoms.moleculeId, id))
    .orderBy(atoms.atomIndex);

  return { ...molecule, atomCoords };
}
