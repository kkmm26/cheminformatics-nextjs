import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const revalidatePathMock = vi.fn();
  const whereMock = vi.fn();
  const deleteMock = vi.fn(() => ({ where: whereMock }));
  const transactionMock = vi.fn(
    (cb: (tx: { delete: typeof deleteMock }) => void) => cb({ delete: deleteMock }),
  );

  return { revalidatePathMock, whereMock, deleteMock, transactionMock };
});

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePathMock,
}));

vi.mock("@/app/lib/db", () => ({
  db: {
    transaction: mocks.transactionMock,
  },
}));

import { deleteMolecules } from "@/app/actions/delete-molecules";

describe("deleteMolecules integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does nothing when id list is empty", async () => {
    await deleteMolecules([]);

    expect(mocks.transactionMock).not.toHaveBeenCalled();
    expect(mocks.revalidatePathMock).not.toHaveBeenCalled();
  });

  it("runs transaction delete and revalidates home path", async () => {
    await deleteMolecules([1, 2, 3]);

    expect(mocks.transactionMock).toHaveBeenCalledOnce();
    expect(mocks.deleteMock).toHaveBeenCalledOnce();
    expect(mocks.whereMock).toHaveBeenCalledOnce();
    expect(mocks.revalidatePathMock).toHaveBeenCalledWith("/");
  });
});
