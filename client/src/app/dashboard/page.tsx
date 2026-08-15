"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { portfolioApi } from "@/lib/api";
import { emptyContent } from "@/types/portfolio";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppHeader } from "@/components/AppHeader";
import { PortfolioThumbnail } from "@/components/PortfolioThumbnail";
import { Button } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Container } from "@/components/Container";

function DashboardContent() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string } | null>(null);

  const { data: portfolios, isLoading } = useQuery({
    queryKey: ["portfolios"],
    queryFn: portfolioApi.list,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      portfolioApi.create({ title: "Untitled Portfolio", template: "minimal-dev", content: emptyContent() }),
    onSuccess: (portfolio) => router.push(`/editor/${portfolio.id}`),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => portfolioApi.duplicate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["portfolios"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => portfolioApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
      setPendingDelete(null);
    },
  });

  return (
    <div className="min-h-screen bg-bg">
      <AppHeader />
      <Container as="main" className="py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-text">Your portfolios</h1>
            <p className="mt-1 text-sm text-muted">Create, edit, and export your portfolio sites.</p>
          </div>
          <Button
            loading={createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            + New portfolio
          </Button>
        </div>

        {isLoading && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-lg border border-border bg-surface p-4">
                <div className="aspect-[4/3] w-full rounded-md bg-border/50" />
                <div className="mt-3 h-4 w-2/3 rounded bg-border/50" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && portfolios?.length === 0 && (
          <div className="mt-16 flex flex-col items-center gap-3 text-center">
            <p className="text-lg font-medium text-text">No portfolios yet</p>
            <p className="max-w-sm text-sm text-muted">
              Create your first portfolio to start editing and previewing it live.
            </p>
          </div>
        )}

        {!isLoading && portfolios && portfolios.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {portfolios.map((p) => (
              <div
                key={p.id}
                className="group rounded-lg border border-border bg-surface p-4 transition-shadow hover:shadow-md"
              >
                <button onClick={() => router.push(`/editor/${p.id}`)} className="block w-full text-left">
                  <PortfolioThumbnail portfolio={p} />
                  <h3 className="mt-3 truncate text-sm font-medium text-text">{p.title}</h3>
                  <p className="text-xs capitalize text-muted">{p.template.replace("-", " ")}</p>
                </button>
                <div className="mt-3 flex gap-2">
                  <Button variant="secondary" className="flex-1" onClick={() => duplicateMutation.mutate(p.id)}>
                    Duplicate
                  </Button>
                  <Button variant="danger" onClick={() => setPendingDelete({ id: p.id, title: p.title })}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>

      <ConfirmDialog
        open={!!pendingDelete}
        title={`Delete "${pendingDelete?.title}"?`}
        description="This can't be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
