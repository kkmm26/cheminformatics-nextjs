import { Molecule } from "@/app/lib/db/schema";

export function Table({ molecules }: { molecules: Molecule[] }) {
  return <div>total molecules: {molecules.length}</div>;
}
