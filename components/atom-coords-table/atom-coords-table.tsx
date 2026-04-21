"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { AtomCoord } from "@/app/lib/db/schema";
import { cn } from "@/lib/utils";
import { CPK, getElementSymbol } from "../../lib/chemistry";

function ElementBadge({ element }: { element: string }) {
  const color = CPK[element] ?? { bg: "bg-muted", text: "text-foreground" };
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-bold leading-none",
        color.bg,
        color.text,
      )}
    >
      {element}
    </span>
  );
}

// ─── Column definitions ───────────────────────────────────────────────────────
const col = createColumnHelper<AtomCoord>();

const columns = [
  col.accessor("atomIndex", {
    header: "#",
    cell: (info) => (
      <span className="font-mono text-xs text-muted-foreground tabular-nums text-left block">
        {info.getValue()}
      </span>
    ),
    size: 48,
  }),
  col.accessor("atomicNumber", {
    header: "Element",
    cell: (info) => {
      const atomicNumber = info.getValue();
      const element = getElementSymbol(atomicNumber);
      return (
        <div className="flex items-center justify-end gap-2">
          <ElementBadge element={element} />
        </div>
      );
    },
  }),
  col.accessor("x", {
    header: "X (Å)",
    cell: (info) => (
      <span className="font-mono text-xs tabular-nums text-right block">
        {info.getValue().toFixed(5)}
      </span>
    ),
  }),
  col.accessor("y", {
    header: "Y (Å)",
    cell: (info) => (
      <span className="font-mono text-xs tabular-nums text-right block">
        {info.getValue().toFixed(5)}
      </span>
    ),
  }),
  col.accessor("z", {
    header: "Z (Å)",
    cell: (info) => (
      <span className="font-mono text-xs tabular-nums text-right block">
        {info.getValue().toFixed(5)}
      </span>
    ),
  }),
];

// ─── Component ────────────────────────────────────────────────────────────────
export function AtomCoordsTable({ atoms }: { atoms: AtomCoord[] }) {
  const table = useReactTable({
    data: atoms,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Atom element composition summary
  const summary = React.useMemo(() => {
    const counts: Record<string, number> = {};
    atoms.forEach(({ atomicNumber }) => {
      const element = getElementSymbol(atomicNumber);
      counts[element] = (counts[element] ?? 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [atoms]);

  return (
    <div className="space-y-3">
      {/* Composition summary */}
      <div className="flex flex-wrap items-center gap-2">
        {summary.map(([el, count]) => (
          <div key={el} className="flex items-center gap-1.5">
            <ElementBadge element={el} />
            <span className="text-xs text-muted-foreground font-mono">
              ×{count}
            </span>
          </div>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">
          {atoms.length} atom{atoms.length !== 1 ? "s" : ""} total
        </span>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-border bg-muted/40">
                {hg.headers.map((header, idx) => (
                  <th
                    key={header.id}
                    className={cn(
                      "px-4 py-2.5 first:pl-5 last:pr-5 text-muted-foreground",
                      idx === 0 ? "text-left" : "text-right",
                    )}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border">
            {table.getRowModel().rows.map((row, i) => (
              <tr
                key={row.id}
                className={cn(
                  "transition-colors hover:bg-muted/30",
                  i % 2 === 0 ? "bg-background" : "bg-muted/10",
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-2.5 first:pl-5 last:pr-5"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
