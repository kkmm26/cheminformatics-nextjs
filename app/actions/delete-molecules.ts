"use server";
import { inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "../lib/db";
import { molecules } from "../lib/db/schema";

// Delete multiple molecules by IDs

export async function deleteMolecules(ids: number[]): Promise<void> {
  if (ids.length === 0) return;

  await db.transaction(async (tx) => {
    await tx.delete(molecules).where(inArray(molecules.id, ids));
  });

  revalidatePath("/");
}
