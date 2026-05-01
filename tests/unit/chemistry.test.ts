import { describe, expect, it } from "vitest";
import { toXYZ } from "@/lib/chemistry";
import type { AtomCoord } from "@/app/lib/db/schema";

describe("toXYZ", () => {
  it("builds XYZ output with atom count header and sorted atom order", () => {
    const atoms = [
      {
        id: 2,
        moleculeId: 10,
        atomicNumber: 1,
        x: 1,
        y: 1.5,
        z: 2,
        atomIndex: 2,
      },
      {
        id: 1,
        moleculeId: 10,
        atomicNumber: 6,
        x: 0,
        y: 0.5,
        z: 1,
        atomIndex: 0,
      },
      {
        id: 3,
        moleculeId: 10,
        atomicNumber: 8,
        x: -1,
        y: -1.5,
        z: -2,
        atomIndex: 1,
      },
    ] satisfies AtomCoord[];

    const xyz = toXYZ(atoms);

    expect(xyz).toBe(
      [
        "3",
        "generated molecule",
        "C 0 0.5 1",
        "O -1 -1.5 -2",
        "H 1 1.5 2",
      ].join("\n"),
    );
  });
});
