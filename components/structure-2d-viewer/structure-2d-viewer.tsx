import { Loader2, ImageIcon } from "lucide-react";
import Image from "next/image";
import { requestToRDKit } from "@/app/actions/request-to-rdkit";
import { type AtomCoord } from "@/app/lib/db/schema";

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

// The skeleton shown while RDKit is fetching
export const StructureSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm flex flex-col items-center justify-center min-h-80 p-8">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin opacity-50" />
        <p className="text-sm font-medium animate-pulse">
          Generating 2D Structure...
        </p>
      </div>
    </div>
  );
};

export const Structure2DViewer = async ({
  moleculeId,
  atomCoords,
  filename,
  structureSvg,
}: {
  moleculeId: number;
  atomCoords: AtomCoord[];
  filename: string;
  structureSvg?: string | null;
}) => {
  const rdkitResponse = await requestToRDKit(
    moleculeId,
    atomCoords,
    structureSvg,
  );
  const svgDataUrl = rdkitResponse?.svg
    ? svgToDataUrl(rdkitResponse.svg)
    : null;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm flex flex-col items-center justify-center min-h-80 p-8">
      {svgDataUrl ? (
        <Image
          src={svgDataUrl}
          alt={`2D chemical structure of ${filename}`}
          width={800}
          height={400}
          unoptimized
          loading="lazy"
          className="w-full max-w-2xl h-auto max-h-100 object-contain"
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <ImageIcon className="h-8 w-8 opacity-50" />
          <p className="text-sm font-medium">No 2D structure available</p>
        </div>
      )}
    </div>
  );
};
