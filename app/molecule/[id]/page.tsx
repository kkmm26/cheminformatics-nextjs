import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react"; // <-- Import Suspense
import { getMoleculeById } from "@/app/actions/get-molecules";
import { AtomCoordsTable } from "@/components/atom-coords-table";
import {
  Structure2DViewer,
  StructureSkeleton,
} from "@/components/structure-2d-viewer";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(value: number | null, decimals = 5): string {
  if (value === null || value === undefined) return "—";
  return value.toFixed(decimals);
}

function DataCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-4 bg-card shadow-sm">
      <p className="text-xs font-medium text-muted-foreground mb-1.5">
        {label}
      </p>
      <p className="font-mono text-sm text-foreground truncate">{value}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function MoleculeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const param = await params;

  const molecule = await getMoleculeById(parseInt(param.id));
  if (!molecule) notFound();

  return (
    <main className="container mx-auto px-4 py-8 space-y-8 max-w-6xl">
      {/* ── Back navigation ── */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to library
      </Link>

      {/* ── Page header ── */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold tracking-tight font-mono">
            {molecule.filename}
          </h1>
        </div>
      </div>

      {/* ── 2D Structure with Suspense ── */}
      <Suspense fallback={<StructureSkeleton />}>
        <Structure2DViewer
          moleculeId={molecule.id}
          atomCoords={molecule.atomCoords}
          filename={molecule.filename}
          structureSvg={molecule.structureSvg}
        />
      </Suspense>

      {/* ── Data cards grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <DataCard label="Filename" value={molecule.filename} />
        <DataCard label="Method" value={molecule.method ?? "—"} />
        <DataCard label="Comment" value={molecule.comment ?? "—"} />
        <DataCard
          label="ZPVE Correction (Hartree)"
          value={fmt(molecule.zpveCorrection)}
        />
        <DataCard
          label="Free Energy Correction (Hartree)"
          value={fmt(molecule.freeEnergyCorrection)}
        />
        <DataCard
          label="ZPVE Energy (Hartree)"
          value={fmt(molecule.zpveEnergy)}
        />
        <DataCard
          label="Free Energy (Hartree)"
          value={fmt(molecule.freeEnergy)}
        />
        <DataCard
          label="Total Entropy (cal/mol·K)"
          value={fmt(molecule.totalEntropy, 3)}
        />
      </div>

      {/* ── Atom coordinates ── */}
      <div className="space-y-4">
        <h2 className="text-xl tracking-tight font-semibold text-foreground">
          Atom Coordinates
        </h2>
        <div className="rounded-xl border-border overflow-hidden shadow-sm bg-card">
          <AtomCoordsTable atoms={molecule.atomCoords} />
        </div>
      </div>
    </main>
  );
}
