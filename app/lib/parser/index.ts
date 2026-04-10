/**
 * Types
 */
export type Atom = {
  atomIndex: number;
  atomicNumber: number;
  x: number;
  y: number;
  z: number;
};

export type ParsedMolecule = {
  filename: string;
  uploadedAt: string;
  method: string;
  comment: string;
  zpveCorrection: number | null;
  freeEnergyCorrection: number | null;
  zpveEnergy: number | null;
  freeEnergy: number | null;
  totalEntropy: number | null;
  atoms: Atom[];
};

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
