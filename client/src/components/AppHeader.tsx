"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Container } from "@/components/Container";

export function AppHeader() {
  const { user, logout } = useAuth();
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-bg/80 backdrop-blur">
      <Container className="flex items-center justify-between gap-3 py-3 sm:py-4">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-2 text-sm font-semibold text-text">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent text-xs text-white">P</span>
          <span className="truncate">Portfolio Builder</span>
        </Link>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {user && <span className="hidden max-w-[10rem] truncate text-sm text-muted md:inline">{user.name || user.email}</span>}
          {user && (
            <Button variant="secondary" className="px-2.5 sm:px-4" onClick={() => setConfirmingLogout(true)}>
              Log out
            </Button>
          )}
        </div>
      </Container>

      <ConfirmDialog
        open={confirmingLogout}
        title="Log out?"
        description="You'll need to sign in again to access your portfolios."
        confirmLabel="Log out"
        variant="danger"
        onConfirm={() => {
          setConfirmingLogout(false);
          logout();
        }}
        onCancel={() => setConfirmingLogout(false)}
      />
    </header>
  );
}
