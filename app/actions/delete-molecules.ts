"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "../lib/db";
import { molecules } from "../lib/db/schema";

// Delete multiple molecules by IDs

export async function deleteMolecules(ids: number[]): Promise<void> {
  for (const id of ids) {
    await db.delete(molecules).where(eq(molecules.id, id));
  }
  revalidatePath("/");
}
