"use client";

import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  RowSelectionState,
} from "@tanstack/react-table";
import { MoleculeRow } from "@/app/lib/db/schema";
import { deleteMolecules } from "@/app/actions/delete-molecules";
import { columns, fuzzyFilter } from "./columns";
import { toast } from "sonner";
interface UseMoleculeTableReturn {
  table: ReturnType<typeof useReactTable<MoleculeRow>>;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  uniqueMethods: string[];
  activeMethods: string[];
  toggleMethodFilter: (method: string) => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
  filteredCount: number;
  selectedCount: number;
  handleDeleteSelected: () => Promise<void>;
}

/**
 * Hook to manage molecule table state, filtering, and tanstack table instance.
 * Encapsulates sorting, global search, method-based multi-select filtering,
 * and row selection for bulk actions.
 */
export function useMoleculeTable(rows: MoleculeRow[]): UseMoleculeTableReturn {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  // Derive unique methods from data for filter pill UI
  const uniqueMethods = React.useMemo(() => {
    const methods = new Set<string>();
    for (const row of rows) {
      if (row.method) methods.add(row.method);
    }
    return Array.from(methods).sort();
  }, [rows]);

  // Extract active method filters from columnFilters state (single source of truth)
  const activeMethods = React.useMemo(() => {
    const methodFilter = columnFilters.find((f) => f.id === "method");
    return (methodFilter?.value as string[]) || [];
  }, [columnFilters]);

  const hasActiveFilters = globalFilter.length > 0 || activeMethods.length > 0;

  /**
   * Toggle a method in the multi-select filter.
   * Adds the method if not present, removes if already selected.
   * Cleans up the filter entry when no methods remain selected.
   */
  const toggleMethodFilter = React.useCallback((method: string) => {
    setColumnFilters((prev) => {
      const methodFilter = prev.find((f) => f.id === "method");
      const current = (methodFilter?.value as string[]) || [];

      const next = current.includes(method)
        ? current.filter((m) => m !== method)
        : [...current, method];

      const otherFilters = prev.filter((f) => f.id !== "method");

      // Remove method filter entirely if empty to keep state clean
      if (next.length === 0) return otherFilters;

      return [...otherFilters, { id: "method", value: next }];
    });
  }, []);

  const clearAllFilters = React.useCallback(() => {
    setGlobalFilter("");
    setColumnFilters([]);
  }, []);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, globalFilter, columnFilters, rowSelection },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: fuzzyFilter,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const filteredCount = table.getFilteredRowModel().rows.length;
  const selectedCount = Object.keys(rowSelection).length;

  const handleDeleteSelected = React.useCallback(async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    if (selectedRows.length === 0) return;

    const isConfirmed = window.confirm(
      `Are you sure you want to delete ${selectedRows.length} molecule(s)?`,
    );

    if (!isConfirmed) return;

    const ids = selectedRows.map((row) => row.original.id);

    try {
      await deleteMolecules(ids);

      setRowSelection({});
      toast.success(`Successfully deleted ${selectedRows.length} molecules.`);
    } catch (error) {
      console.error("Failed to delete molecules:", error);
      toast.error("Failed to delete molecules. Please try again.");
    }
  }, [table]);

  return {
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
  };
}
