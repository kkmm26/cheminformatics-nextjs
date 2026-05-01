import { describe, expect, it } from "vitest";
import { isValidFile } from "@/components/file-upload/utils";

describe("isValidFile", () => {
  it("accepts files ending with .log", () => {
    const file = { name: "molecule.log" } as File;
    expect(isValidFile(file)).toBe(true);
  });

  it("rejects files that do not end with .log", () => {
    const txtFile = { name: "molecule.txt" } as File;
    const uppercaseExtFile = { name: "molecule.LOG" } as File;

    expect(isValidFile(txtFile)).toBe(false);
    expect(isValidFile(uppercaseExtFile)).toBe(false);
  });
});
