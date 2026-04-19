import * as React from "react";
import Link from "next/link";
import { createColumnHelper, FilterFn } from "@tanstack/react-table";
import { rankItem } from "@tanstack/match-sorter-utils";
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import { MoleculeRow } from "@/app/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── Fuzzy filter (exported for the main table) ──────────────────────────────
export const fuzzyFilter: FilterFn<MoleculeRow> = (
  row,
  columnId,
  value,
  addMeta,
) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

// ─── Number formatter ─────────────────────────────────────────────────────────
function fmt(value: number | null, decimals = 5): string {
  if (value === null || value === undefined) return "—";
  return value.toFixed(decimals);
}

// ─── Column helper & UI Components ────────────────────────────────────────────
const col = createColumnHelper<MoleculeRow>();

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc")
    return <ArrowUp className="ml-1.5 h-3.5 w-3.5 shrink-0 text-primary" />;
  if (sorted === "desc")
    return <ArrowDown className="ml-1.5 h-3.5 w-3.5 shrink-0 text-primary" />;
  return (
    <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 shrink-0 opacity-30 group-hover:opacity-60 transition-opacity" />
  );
}

function SortableHeader({
  label,
  sorted,
  onSort,
  className,
}: {
  label: string;
  sorted: false | "asc" | "desc";
  onSort: (event?: unknown) => void;
  className?: string;
}) {
  return (
    <button
      onClick={onSort}
      className={cn(
        "group flex items-start text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors text-left",
        sorted && "text-foreground",
        className,
      )}
    >
      <span className="leading-tight">{label}</span>
      <SortIcon sorted={sorted} />
    </button>
  );
}

// ─── Column definitions ───────────────────────────────────────────────────────
export const columns = [
  col.accessor("filename", {
    size: 140,
    minSize: 120,
    maxSize: 180,
    header: ({ column }) => (
      <SortableHeader
        label="Filename"
        sorted={column.getIsSorted()}
        onSort={column.getToggleSortingHandler()!}
      />
    ),
    cell: (info) => (
      <span className="font-mono text-xs font-medium text-foreground leading-tight">
        {info.getValue()}
      </span>
    ),
    filterFn: fuzzyFilter,
  }),

  col.accessor("method", {
    size: 560,
    minSize: 560,
    maxSize: 600,
    header: () => (
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground leading-tight">
        Method
      </span>
    ),
    cell: (info) => {
      const v = info.getValue();
      return v ? (
        <Badge
          variant="secondary"
          className="font-mono text-[16px] font-normal h-auto whitespace-normal text-left leading-tight"
        >
          {v}
        </Badge>
      ) : (
        <span className="text-muted-foreground/50">—</span>
      );
    },
  }),

  col.accessor("comment", {
    size: 340,
    minSize: 320,
    maxSize: 360,
    header: () => (
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground leading-tight">
        Comment
      </span>
    ),
    cell: (info) => {
      const v = info.getValue();
      return v ? (
        <span className="text-xs text-muted-foreground leading-tight">{v}</span>
      ) : (
        <span className="text-muted-foreground/40 text-xs">—</span>
      );
    },
    filterFn: fuzzyFilter,
  }),

  col.accessor("zpveCorrection", {
    size: 75,
    minSize: 70,
    maxSize: 90,
    header: ({ column }) => (
      <SortableHeader
        label="ZPVE Correction"
        sorted={column.getIsSorted()}
        onSort={column.getToggleSortingHandler()!}
        className="justify-end"
      />
    ),
    cell: (info) => (
      <span className="font-mono text-xs tabular-nums text-right block">
        {fmt(info.getValue())}
      </span>
    ),
  }),

  col.accessor("freeEnergyCorrection", {
    size: 85,
    minSize: 75,
    maxSize: 100,
    header: ({ column }) => (
      <SortableHeader
        label="Free Energy Correction"
        sorted={column.getIsSorted()}
        onSort={column.getToggleSortingHandler()!}
        className="justify-end"
      />
    ),
    cell: (info) => (
      <span className="font-mono text-xs tabular-nums text-right block">
        {fmt(info.getValue())}
      </span>
    ),
  }),

  col.accessor("zpveEnergy", {
    size: 80,
    minSize: 70,
    maxSize: 95,
    header: ({ column }) => (
      <SortableHeader
        label="ZPVE Energy"
        sorted={column.getIsSorted()}
        onSort={column.getToggleSortingHandler()!}
        className="justify-end"
      />
    ),
    cell: (info) => (
      <span className="font-mono text-xs tabular-nums text-right block">
        {fmt(info.getValue())}
      </span>
    ),
  }),

  col.accessor("freeEnergy", {
    size: 80,
    minSize: 70,
    maxSize: 95,
    header: ({ column }) => (
      <SortableHeader
        label="Free Energy"
        sorted={column.getIsSorted()}
        onSort={column.getToggleSortingHandler()!}
        className="justify-end"
      />
    ),
    cell: (info) => (
      <span className="font-mono text-xs tabular-nums text-right block">
        {fmt(info.getValue())}
      </span>
    ),
  }),

  col.accessor("totalEntropy", {
    size: 75,
    minSize: 70,
    maxSize: 90,
    header: ({ column }) => (
      <SortableHeader
        label="Total Entropy"
        sorted={column.getIsSorted()}
        onSort={column.getToggleSortingHandler()!}
        className="justify-end"
      />
    ),
    cell: (info) => (
      <span className="font-mono text-xs tabular-nums text-right block">
        {fmt(info.getValue(), 3)}
      </span>
    ),
  }),

  col.display({
    id: "details",
    size: 90,
    minSize: 80,
    maxSize: 110,
    header: () => (
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground leading-tight">
        Details
      </span>
    ),
    cell: ({ row }) => (
      <Link
        href={`/molecule/${row.original.id}`}
        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline underline-offset-4"
      >
        View
        <ExternalLink className="h-3 w-3" />
      </Link>
    ),
  }),
];
