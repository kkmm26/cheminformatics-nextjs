import type { AtomInsert, MoleculeInsert } from "@/app/lib/db/schema";

export type Atom = Pick<
  AtomInsert,
  "atomIndex" | "atomicNumber" | "x" | "y" | "z"
>;

export type ParsedMolecule = Pick<
  MoleculeInsert,
  | "filename"
  | "uploadedAt"
  | "method"
  | "comment"
  | "zpveCorrection"
  | "freeEnergyCorrection"
  | "zpveEnergy"
  | "freeEnergy"
  | "totalEntropy"
> & {
  atoms: Atom[];
};

/**
 * Extracts the method section (lines prefixed by '#') and comment section
 * (the first block after a '-' separator) from a Gaussian output.
 */
function parseMetadata(lines: string[]): { method: string; comment: string } {
  let method = "";
  let comment = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!method && line.startsWith("#")) {
      method = line.substring(1).trim();
      let j = 1;
      while (!lines[i + j]?.trim().startsWith("-")) {
        method += lines[i + j].substring(1).trim();
        j++;
      }
      i += j;
    }

    if (method && !comment && line.startsWith("-")) {
      comment = lines[i + 1]?.trim() ?? "";
      let j = 2;
      while (!lines[i + j]?.trim().startsWith("-")) {
        comment += lines[i + j].trim();
        j++;
      }
      i += j - 1;
    }

    if (method && comment) break;
  }

  return { method, comment };
}

/** Reads the last zero-point correction value from the file. */
function parseZpveCorrection(lines: string[]): number | null {
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (line.includes("Zero-point correction")) {
      const raw = line.split("=")[1]?.split("(")[0]?.trim();
      return raw ? parseFloat(raw) : null;
    }
  }
  return null;
}

/** Reads the last Gibbs free-energy correction value from the file. */
function parseFreeEnergyCorrection(lines: string[]): number | null {
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (line.includes("Thermal correction to Gibbs Free Energy")) {
      const raw = line.split("=")[1]?.trim();
      return raw ? parseFloat(raw) : null;
    }
  }
  return null;
}

/** Reads the last "electronic + zero-point" total energy value. */
function parseZpveEnergy(lines: string[]): number | null {
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (line.includes("Sum of electronic and zero-point Energies")) {
      const raw = line.split("=")[1]?.trim();
      return raw ? parseFloat(raw) : null;
    }
  }
  return null;
}

/**
 * Reads final free energy and total entropy.
 * Entropy is expected on a fixed-offset line in the Gaussian summary block.
 */
function parseFreeEnergyAndEntropy(lines: string[]): {
  freeEnergy: number | null;
  totalEntropy: number | null;
} {
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (line.includes("Sum of electronic and thermal Free Energies")) {
      const freeEnergyRaw = line.split("=")[1]?.trim();
      const freeEnergy = freeEnergyRaw ? parseFloat(freeEnergyRaw) : null;

      // total entropy is 4 lines below the free energy line
      const entropyLine = lines[i + 4]?.trim();
      const entropyRaw = entropyLine?.split(/\s+/).pop();
      const totalEntropy = entropyRaw ? parseFloat(entropyRaw) : null;

      return { freeEnergy, totalEntropy };
    }
  }
  return { freeEnergy: null, totalEntropy: null };
}

/**
 * Parses atom coordinates from the final "Standard orientation" table.
 * The final table is used because it corresponds to the converged geometry.
 */
function parseAtomCoords(lines: string[]): Atom[] {
  const atoms: Atom[] = [];

  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (line.includes("Standard orientation")) {
      let j = i + 5;
      let atomIndex = 0;
      while (!lines[j]?.trim().startsWith("--")) {
        const cols = lines[j].trim().split(/\s+/);
        atoms.push({
          atomIndex,
          atomicNumber: parseInt(cols[1]),
          x: parseFloat(cols[3]),
          y: parseFloat(cols[4]),
          z: parseFloat(cols[5]),
        });
        atomIndex++;
        j++;
      }
      break;
    }
  }

  return atoms;
}

/** Parses a Gaussian `.log` file into the molecule shape used for persistence. */
export function parseMolecule(
  fileContent: string,
  filename: string,
): ParsedMolecule {
  const lines = fileContent.split("\n");

  const { method, comment } = parseMetadata(lines);
  const { freeEnergy, totalEntropy } = parseFreeEnergyAndEntropy(lines);

  return {
    filename,
    uploadedAt: new Date().toISOString(),
    method,
    comment,
    zpveCorrection: parseZpveCorrection(lines),
    freeEnergyCorrection: parseFreeEnergyCorrection(lines),
    zpveEnergy: parseZpveEnergy(lines),
    freeEnergy,
    totalEntropy,
    atoms: parseAtomCoords(lines),
  };
}
