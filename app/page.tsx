import { FileUpload } from "@/components/file-upload/file-upload";
import { Table } from "@/components/table/table";
import { getMolecules } from "@/app/actions/molecules";

export default async function Home() {
  const molecules = await getMolecules();

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <FileUpload />
        <Table molecules={molecules} />
      </main>
    </div>
  );
}
