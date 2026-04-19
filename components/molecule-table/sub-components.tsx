import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SlidersHorizontal, Search, X, FlaskConical } from "lucide-react";

interface MethodFilterProps {
  methods: string[];
  activeMethods: string[];
  onToggle: (method: string) => void;
}

/** Pill-style toggle buttons for filtering by calculation method. */
export function MethodFilter({
  methods,
  activeMethods,
  onToggle,
}: MethodFilterProps) {
  if (methods.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Method:
      </span>
      {methods.map((method) => (
        <button
          key={method}
          onClick={() => onToggle(method)}
          className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[16px] font-mono transition-all",
            activeMethods.includes(method)
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-muted/40 text-muted-foreground hover:border-primary/60 hover:text-foreground",
          )}
        >
          {method}
        </button>
      ))}
    </div>
  );
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

/** Search input with icon and clear button. */
export function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <div className="relative flex-1 max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        placeholder="Search filename, method, comment…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 h-9 text-sm"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

interface ResultsCounterProps {
  filteredCount: number;
  totalCount: number;
  showClearButton: boolean;
  onClear: () => void;
}

interface EmptyStateProps {
  totalRows: number;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

/** Message shown when no rows are displayed (empty data or filtered out). */
export function EmptyState({
  totalRows,
  hasActiveFilters,
  onClearFilters,
}: EmptyStateProps) {
  return (
    <>
      <p className="text-sm text-muted-foreground">
        {totalRows === 0
          ? "No molecules yet. Upload a .log file above."
          : "No molecules match your search."}
      </p>
      {hasActiveFilters && totalRows > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={onClearFilters}
        >
          Clear filters
        </Button>
      )}
    </>
  );
}

/** Displays result count with optional clear filters button. */
export function ResultsCounter({
  filteredCount,
  totalCount,
  showClearButton,
  onClear,
}: ResultsCounterProps) {
  return (
    <div className="flex items-center gap-2 ml-auto text-xs text-muted-foreground">
      <FlaskConical className="h-3.5 w-3.5" />
      <span>
        {filteredCount === totalCount
          ? `${totalCount} molecule${totalCount !== 1 ? "s" : ""}`
          : `${filteredCount} of ${totalCount}`}
      </span>
      {showClearButton && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={onClear}
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}
