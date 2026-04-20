"use client";

import { flexRender } from "@tanstack/react-table";
import { FlaskConical } from "lucide-react";
import { MoleculeRow } from "@/app/lib/db/schema";
import { cn } from "@/lib/utils";
import { columns } from "./columns";
import { useMoleculeTable } from "./use-molecule-table";
import {
  MethodFilter,
  SearchInput,
  ResultsCounter,
  EmptyState,
  DeleteSelectedButton,
} from "./sub-components";

interface MoleculeTableProps {
  rows?: MoleculeRow[];
}

export function MoleculeTable({ rows = [] }: MoleculeTableProps) {
  const {
    table,
    globalFilter,
    setGlobalFilter,
    uniqueMethods,
    activeMethods,
    toggleMethodFilter,
    clearAllFilters,
    hasActiveFilters,
    filteredCount,
    selectedCount,
    handleDeleteSelected,
  } = useMoleculeTable(rows);

  return (
    <div className="space-y-4">
      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <SearchInput value={globalFilter} onChange={setGlobalFilter} />
          <DeleteSelectedButton
            selectedCount={selectedCount}
            onDelete={handleDeleteSelected}
          />
          <ResultsCounter
            filteredCount={filteredCount}
            totalCount={rows.length}
            showClearButton={hasActiveFilters}
            onClear={clearAllFilters}
          />
        </div>

        <MethodFilter
          methods={uniqueMethods}
          activeMethods={activeMethods}
          onToggle={toggleMethodFilter}
        />
      </div>

      {/* ── Table ── */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-border bg-muted/40">
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left first:pl-5 last:pr-5"
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
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-5 py-12 text-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <FlaskConical className="h-8 w-8 text-muted-foreground/30" />
                      <EmptyState
                        totalRows={rows.length}
                        hasActiveFilters={hasActiveFilters}
                        onClearFilters={clearAllFilters}
                      />
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row, i) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "transition-colors hover:bg-muted/30",
                      row.getIsSelected() && "bg-primary/5",
                      !row.getIsSelected() &&
                        (i % 2 === 0 ? "bg-background" : "bg-muted/10"),
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-3 first:pl-5 last:pr-5"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
