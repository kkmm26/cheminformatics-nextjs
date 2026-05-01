import { beforeEach, describe, expect, it, vi } from "vitest";
import { atoms, molecules } from "@/app/lib/db/schema";

const mocks = vi.hoisted(() => {
  const revalidatePathMock = vi.fn();
  const parseMoleculeMock = vi.fn();
  const selectLimitMock = vi.fn();
  const selectWhereMock = vi.fn(() => ({ limit: selectLimitMock }));
  const selectFromMock = vi.fn(() => ({ where: selectWhereMock }));
  const selectMock = vi.fn(() => ({ from: selectFromMock }));
  const moleculeReturningMock = vi.fn();
  const moleculeValuesMock = vi.fn(() => ({ returning: moleculeReturningMock }));
  const atomValuesMock = vi.fn();
  const insertMock = vi.fn((table: unknown) => {
    if (table === molecules) return { values: moleculeValuesMock };
    if (table === atoms) return { values: atomValuesMock };
    return { values: vi.fn() };
  });

  return {
    revalidatePathMock,
    parseMoleculeMock,
    selectLimitMock,
    selectWhereMock,
    selectFromMock,
    selectMock,
    moleculeReturningMock,
    moleculeValuesMock,
    atomValuesMock,
    insertMock,
  };
});

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePathMock,
}));

vi.mock("@/app/lib/parser", () => ({
  parseMolecule: mocks.parseMoleculeMock,
}));

vi.mock("@/app/lib/db", () => ({
  db: {
    select: mocks.selectMock,
    insert: mocks.insertMock,
  },
}));

import { uploadFile } from "@/app/actions/upload-file";

describe("uploadFile integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.selectLimitMock.mockResolvedValue([]);
    mocks.moleculeReturningMock.mockResolvedValue([
      { id: 7, filename: "allylalcohol.log" },
    ]);
    mocks.atomValuesMock.mockResolvedValue(undefined);
    mocks.parseMoleculeMock.mockReturnValue({
      filename: "allylalcohol.log",
      uploadedAt: "2026-01-01T00:00:00.000Z",
      method: "opt freq",
      comment: "fixture",
      zpveCorrection: 0.082796,
      freeEnergyCorrection: 0.055427,
      zpveEnergy: -192.995077,
      freeEnergy: -193.022445,
      totalEntropy: 70.44,
      atoms: [
        { atomIndex: 0, atomicNumber: 6, x: 0, y: 0.1, z: 0.2 },
        { atomIndex: 1, atomicNumber: 1, x: 1, y: 1.1, z: 1.2 },
      ],
    });
  });

  it("rejects duplicate filename before insert", async () => {
    mocks.selectLimitMock.mockResolvedValueOnce([{ id: 1 }]);

    const formData = new FormData();
    formData.append("file", new File(["dummy"], "allylalcohol.log"));

    const result = await uploadFile(formData);

    expect(result).toEqual({
      success: false,
      error:
        "A file with this name already exists. Please rename the file before uploading.",
    });
    expect(mocks.insertMock).not.toHaveBeenCalled();
    expect(mocks.revalidatePathMock).not.toHaveBeenCalled();
  });

  it("inserts molecule and atoms, then revalidates home path", async () => {
    const formData = new FormData();
    formData.append("file", new File(["fixture-log"], "allylalcohol.log"));

    const result = await uploadFile(formData);

    expect(result).toEqual({
      success: true,
      moleculeId: "7",
      fileName: "allylalcohol",
    });

    expect(mocks.parseMoleculeMock).toHaveBeenCalledWith(
      "fixture-log",
      "allylalcohol.log",
    );
    expect(mocks.insertMock).toHaveBeenCalledTimes(2);
    expect(mocks.moleculeValuesMock).toHaveBeenCalledOnce();
    expect(mocks.moleculeReturningMock).toHaveBeenCalledOnce();
    expect(mocks.atomValuesMock).toHaveBeenCalledOnce();
    expect(mocks.revalidatePathMock).toHaveBeenCalledWith("/");
  });

  it("returns parser errors as failure response", async () => {
    mocks.parseMoleculeMock.mockImplementationOnce(() => {
      throw new Error("Malformed Gaussian output");
    });

    const formData = new FormData();
    formData.append("file", new File(["bad-content"], "broken.log"));

    const result = await uploadFile(formData);

    expect(result).toEqual({
      success: false,
      error: "Malformed Gaussian output",
    });
    expect(mocks.revalidatePathMock).not.toHaveBeenCalled();
  });
});
