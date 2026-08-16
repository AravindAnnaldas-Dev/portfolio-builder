"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
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
import { useRouteTransition } from "@/lib/route-transition";

function EditorContent() {
  const { id } = useParams<{ id: string }>();
  const { navigate } = useRouteTransition();
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
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");

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
      <div className="shrink-0 border-b border-border bg-bg py-3 sm:py-4">
        <Container className="flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2 sm:flex-1 sm:gap-3">
              <button
                onClick={() => navigate("/dashboard")}
                aria-label="Back to dashboard"
                className="flex shrink-0 items-center gap-1.5 text-sm text-muted hover:text-text"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span>Dashboard</span>
              </button>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-label="Portfolio title"
                className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-right text-base font-semibold text-text outline-none focus:border-border sm:text-lg"
              />
              <span className="hidden shrink-0 text-xs text-muted sm:inline" role="status">
                {statusLabel[autosaveStatus]}
              </span>
            </div>
            <ExportControls portfolioId={id} className="w-full sm:w-auto" />
          </div>
          <TemplateSwitcher
            value={template}
            onChange={(t) => {
              setTemplate(t);
              setMobileTab("preview");
            }}
          />
        </Container>
      </div>

      <Container as="main" className="flex flex-1 flex-col gap-3 py-4 sm:gap-4 sm:py-6 lg:min-h-0">
        <div
          role="tablist"
          aria-label="Editor view"
          className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-surface p-1 lg:hidden"
        >
          <button
            role="tab"
            aria-selected={mobileTab === "edit"}
            onClick={() => setMobileTab("edit")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mobileTab === "edit" ? "bg-accent text-white" : "text-muted hover:text-text"
            }`}
          >
            Edit content
          </button>
          <button
            role="tab"
            aria-selected={mobileTab === "preview"}
            onClick={() => setMobileTab("preview")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mobileTab === "preview" ? "bg-accent text-white" : "text-muted hover:text-text"
            }`}
          >
            Preview
          </button>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-6 lg:min-h-0 lg:grid-cols-2">
          <div
            className={`scrollbar-thin rounded-lg border border-border bg-bg p-3 sm:p-4 lg:block lg:h-full lg:overflow-y-auto ${
              mobileTab === "edit" ? "" : "hidden"
            }`}
          >
            <EditorForm content={content} onChange={setContent} />
          </div>
          <div
            className={`relative h-[calc(100vh-15rem)] min-h-[360px] sm:h-[500px] lg:block lg:h-full ${
              mobileTab === "preview" ? "" : "hidden"
            }`}
          >
            <div className="absolute -left-3 top-0 hidden h-full w-px bg-border lg:block" aria-hidden="true" />
            <PreviewPane ref={previewRef} template={template} title={title} content={content} />
          </div>
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
