import { sqliteTable, integer, real, text } from "drizzle-orm/sqlite-core";

export const molecules = sqliteTable("molecules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  filename: text("filename").notNull(),
  uploadedAt: text("uploaded_at").notNull(),
  comment: text("comment"),
  method: text("method"),
  zpveCorrection: real("zpve_correction"),
  freeEnergyCorrection: real("free_energy_correction"),
  zpveEnergy: real("zpve_energy"),
  freeEnergy: real("free_energy"),
  totalEntropy: real("total_entropy"),
  structureSvg: text("structure_svg"),
});

export const atoms = sqliteTable("atoms", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  moleculeId: integer("molecule_id")
    .notNull()
    .references(() => molecules.id, { onDelete: "cascade" }),
  atomicNumber: integer("atomic_number").notNull(),
  x: real("x").notNull(),
  y: real("y").notNull(),
  z: real("z").notNull(),
  atomIndex: integer("atom_index").notNull(),
});

export type Molecule = typeof molecules.$inferSelect;
export type MoleculeRow = Omit<Molecule, "structureSvg">;
export type MoleculeDetail = Molecule & {
  atomCoords: (typeof atoms.$inferSelect)[];
};
export type AtomCoord = typeof atoms.$inferSelect;
