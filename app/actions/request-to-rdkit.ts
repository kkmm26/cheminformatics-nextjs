import { toXYZ } from "@/lib/chemistry";
import { AtomCoord } from "@/app/lib/db/schema";

export interface RDKitResponse {
  svg: string;
  mol_block: string;
  success: boolean;
}

export async function requestToRDKit(
  atomCoords: AtomCoord[],
): Promise<RDKitResponse> {
  const xyz = toXYZ(atomCoords);

  const res = await fetch(
    "https://cheminformatics-rdkit.onrender.com/api/convert-xyz",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        xyz_data: xyz,
      }),
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Failed to convert XYZ data");
  }

  return res.json() as Promise<RDKitResponse>;
}
