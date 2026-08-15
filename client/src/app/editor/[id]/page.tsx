"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { portfolioApi } from "@/lib/api";
import { Portfolio, PortfolioContent, TemplateId, normalizeContent } from "@/types/portfolio";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppHeader } from "@/components/AppHeader";
import { EditorForm } from "@/components/EditorForm";
import { PreviewPane } from "@/components/PreviewPane";
import { TemplateSwitcher } from "@/components/TemplateSwitcher";
import { ExportControls } from "@/components/ExportControls";
import { useAutosave } from "@/hooks/useAutosave";
import { Container } from "@/components/Container";
import { ArrowLeftIcon } from "@/components/icons";

function EditorContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const previewRef = useRef<HTMLIFrameElement>(null);

  const { data: portfolio, isLoading } = useQuery({
    queryKey: ["portfolio", id],
    queryFn: () => portfolioApi.get(id),
    // Autosave already keeps this query's cache in sync via setQueryData on
    // every successful save, so there's nothing to gain from a background
    // refetch — with the default staleTime (0), this query was refetching on
    // every remount (route re-entry, dev Strict Mode double-mount, Fast
    // Refresh), which is what caused the repeated GET requests.
    staleTime: Infinity,
  });

  const [title, setTitle] = useState("");
  const [template, setTemplate] = useState<TemplateId>("minimal-dev");
  const [content, setContent] = useState<PortfolioContent | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (portfolio && !hydrated) {
      setTitle(portfolio.title);
      setTemplate(portfolio.template);
      setContent(normalizeContent(portfolio.content));
      setHydrated(true);
    }
  }, [portfolio, hydrated]);

  const autosaveStatus = useAutosave(
    hydrated ? { title, template, content } : null,
    async (value) => {
      if (!value) return;
      const updated = await portfolioApi.update(id, value as any);
      queryClient.setQueryData(["portfolio", id], updated);
    }
  );

  if (isLoading || !content) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  const statusLabel: Record<string, string> = {
    idle: "",
    saving: "Saving…",
    saved: "All changes saved",
    error: "Failed to save",
  };

  return (
    <div className="flex min-h-screen flex-col bg-bg lg:h-screen lg:overflow-hidden">
      <AppHeader />
      <div className="shrink-0 border-b border-border bg-bg py-4">
        <Container className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-1.5 text-sm text-muted hover:text-text"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Dashboard
              </button>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-label="Portfolio title"
                className="min-w-0 rounded-md border border-transparent bg-transparent px-2 py-1 text-lg font-semibold text-text outline-none focus:border-border"
              />
              <span className="text-xs text-muted">{statusLabel[autosaveStatus]}</span>
            </div>
            <ExportControls portfolioId={id} />
          </div>
          <TemplateSwitcher value={template} onChange={setTemplate} />
        </Container>
      </div>

      <Container as="main" className="grid grid-cols-1 gap-6 py-6 lg:min-h-0 lg:flex-1 lg:grid-cols-2">
        <div className="scrollbar-thin rounded-lg border border-border bg-bg p-4 lg:h-full lg:overflow-y-auto">
          <EditorForm content={content} onChange={setContent} />
        </div>
        <div className="relative h-[500px] lg:h-full">
          <div className="absolute -left-3 top-0 hidden h-full w-px bg-border lg:block" aria-hidden="true" />
          <PreviewPane ref={previewRef} template={template} title={title} content={content} />
        </div>
      </Container>
    </div>
  );
}

export default function EditorPage() {
  return (
    <ProtectedRoute>
      <EditorContent />
    </ProtectedRoute>
  );
}
