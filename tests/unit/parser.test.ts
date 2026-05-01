import { describe, expect, it } from "vitest";
import { parseMolecule } from "@/app/lib/parser";

const FULL_LOG_SAMPLE = `
 # B3LYP/6-31G(d)
 Opt Freq
 -
 -
 acetone optimization
 thermochemistry run
 -
 Zero-point correction=                           0.123456 (Hartree/Particle)
 Thermal correction to Gibbs Free Energy=         0.654321
 Sum of electronic and zero-point Energies=      -191.987654
 Sum of electronic and thermal Free Energies=    -192.123456
 filler line 1
 filler line 2
 filler line 3
 Total entropy data 0.000 42.321
 Standard orientation:
 ---------------------------------------------------------------------
 Center     Atomic      Atomic             Coordinates (Angstroms)
 Number     Number       Type             X           Y           Z
 ---------------------------------------------------------------------
 1          1           0        9.99999    9.99999    9.99999
 ---------------------------------------------------------------------
 Standard orientation:
 ---------------------------------------------------------------------
 Center     Atomic      Atomic             Coordinates (Angstroms)
 Number     Number       Type             X           Y           Z
 ---------------------------------------------------------------------
 1          6           0        0.000000   0.100000   0.200000
 2          1           0        1.000000   1.100000   1.200000
 ---------------------------------------------------------------------
`.trim();

const MINIMAL_LOG_SAMPLE = `
 random line
 no gaussian markers here
 `.trim();

describe("parseMolecule", () => {
  it("parses metadata, energies, entropy, and atom coordinates", () => {
    const parsed = parseMolecule(FULL_LOG_SAMPLE, "acetone.log");

    expect(parsed.filename).toBe("acetone.log");
    expect(parsed.uploadedAt).toEqual(expect.any(String));
    expect(new Date(parsed.uploadedAt).toString()).not.toBe("Invalid Date");

    expect(parsed.method).toBe("B3LYP/6-31G(d)Opt Freq");
    expect(parsed.comment).toBe("acetone optimizationthermochemistry run");

    expect(parsed.zpveCorrection).toBeCloseTo(0.123456);
    expect(parsed.freeEnergyCorrection).toBeCloseTo(0.654321);
    expect(parsed.zpveEnergy).toBeCloseTo(-191.987654);
    expect(parsed.freeEnergy).toBeCloseTo(-192.123456);
    expect(parsed.totalEntropy).toBeCloseTo(42.321);

    expect(parsed.atoms).toEqual([
      { atomIndex: 0, atomicNumber: 6, x: 0, y: 0.1, z: 0.2 },
      { atomIndex: 1, atomicNumber: 1, x: 1, y: 1.1, z: 1.2 },
    ]);
  });

  it("returns null/empty values when sections are missing", () => {
    const parsed = parseMolecule(MINIMAL_LOG_SAMPLE, "minimal.log");

    expect(parsed.method).toBe("");
    expect(parsed.comment).toBe("");
    expect(parsed.zpveCorrection).toBeNull();
    expect(parsed.freeEnergyCorrection).toBeNull();
    expect(parsed.zpveEnergy).toBeNull();
    expect(parsed.freeEnergy).toBeNull();
    expect(parsed.totalEntropy).toBeNull();
    expect(parsed.atoms).toEqual([]);
  });

  it("uses the last Standard orientation block in the file", () => {
    const parsed = parseMolecule(FULL_LOG_SAMPLE, "acetone.log");
    expect(parsed.atoms[0]).toEqual({
      atomIndex: 0,
      atomicNumber: 6,
      x: 0,
      y: 0.1,
      z: 0.2,
    });
  });
});
