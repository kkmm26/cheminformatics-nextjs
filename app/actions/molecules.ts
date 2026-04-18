"use server";

import { molecules, type Molecule } from "@/app/lib/db/schema";
import { db } from "@/app/lib/db";

export async function getMolecules(): Promise<Molecule[]> {
  return db.select().from(molecules);
}
