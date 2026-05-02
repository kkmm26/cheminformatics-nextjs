"use server";
import { inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "../lib/db";
import { molecules } from "../lib/db/schema";

/**
 * Deletes the selected molecules in a single transaction and revalidates
 * the home route so the list reflects the change.
 */
export async function deleteMolecules(ids: number[]): Promise<void> {
  if (ids.length === 0) return;

  await db.delete(molecules).where(inArray(molecules.id, ids));

  revalidatePath("/");
}
