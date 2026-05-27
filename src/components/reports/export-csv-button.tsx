"use client";

import { useTransition } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { exportMovementsCSV } from "@/lib/actions/export";

export function ExportCsvButton() {
  const [isPending, startTransition] = useTransition();

  const handleExport = () => {
    startTransition(async () => {
      const result = await exportMovementsCSV();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      // Trigger download client-side
      const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("CSV descargado");
    });
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isPending}
      variant="outline"
      size="sm"
    >
      <Download className="h-4 w-4" />
      {isPending ? "Generando..." : "Exportar CSV"}
    </Button>
  );
}
