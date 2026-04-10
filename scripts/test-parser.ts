import { parseMolecule } from "../app/lib/parser";
import fs from "fs";
import path from "path";

const files = [
  "1propenol_cis.log",
  "1propenol_tautts.log",
  "1propenol_trans.log",
  "allylalcohol.log",
  "propionaldehyde_gauche.log",
  "propionaldehyde_scis.log",
  "propionaldehyde_stransts.log",
  "propyleneoxide.log",
]; // 8 files

const fileName = files[1];

const filePath = path.join(__dirname, `../sample-gussian/C3H6O/${fileName}`);
const fileContent = fs.readFileSync(filePath, "utf8");

const result = parseMolecule(fileContent, fileName);

console.log("=== METADATA ===");
console.log("Method:", result.method);
console.log("Comment:", result.comment);

console.log("\n=== ENERGIES ===");
console.log("ZPVE Correction:", result.zpveCorrection);
console.log("Free Energy Correction:", result.freeEnergyCorrection);
console.log("ZPVE Energy:", result.zpveEnergy);
console.log("Free Energy:", result.freeEnergy);
console.log("Total Entropy:", result.totalEntropy);

console.log("\n=== ATOMS ===");
console.log(`Total atoms: ${result.atoms.length}`);
console.log("First 3 atoms:", result.atoms.slice(0, 3));
