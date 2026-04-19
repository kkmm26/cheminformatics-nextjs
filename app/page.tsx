import { FileUpload } from "@/components/file-upload/file-upload";
import { MoleculeTable } from "@/components/molecule-table/molecule-table";
import { getMolecules } from "@/app/actions/molecules";

export default async function Home() {
  const molecules = await getMolecules();

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <FileUpload />
        <MoleculeTable rows={molecules} />
      </main>
    </div>
  );
}
