import { Loader2, ImageIcon } from "lucide-react";
import { requestToRDKit } from "@/app/actions/request-to-rdkit";
import { type AtomCoord } from "@/app/lib/db/schema";

// The skeleton shown while RDKit is fetching
export const StructureSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm flex flex-col items-center justify-center min-h-[320px] p-8">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin opacity-50" />
        <p className="text-sm font-medium animate-pulse">
          Generating 2D Structure...
        </p>
      </div>
    </div>
  );
};

// The isolated component that handles the delay
export const Structure2DViewer = async ({
  atomCoords,
  filename,
}: {
  atomCoords: AtomCoord[];
  filename: string;
}) => {
  const rdkitResponse = await requestToRDKit(atomCoords);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm flex flex-col items-center justify-center min-h-[320px] p-8">
      {rdkitResponse?.svg ? (
        <div
          className="w-full max-w-2xl flex items-center justify-center [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-h-[400px] text-foreground"
          dangerouslySetInnerHTML={{ __html: rdkitResponse.svg }}
          role="img"
          aria-label={`2D chemical structure of ${filename}`}
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
