"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { portfolioApi } from "@/lib/api";

type Status = "idle" | "loading" | "success" | "error";

export function ExportControls({ portfolioId }: { portfolioId: string }) {
  const [zipStatus, setZipStatus] = useState<Status>("idle");

  async function exportZip() {
    setZipStatus("loading");
    try {
      const res = await fetch(portfolioApi.exportZipUrl(portfolioId), {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `portfolio-${portfolioId}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setZipStatus("success");
      setTimeout(() => setZipStatus("idle"), 2500);
    } catch {
      setZipStatus("error");
      setTimeout(() => setZipStatus("idle"), 2500);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button onClick={exportZip} loading={zipStatus === "loading"}>
        {zipStatus === "success" ? "Downloaded ✓" : zipStatus === "error" ? "Failed — retry" : "Export as Website (ZIP)"}
      </Button>
    </div>
  );
}
