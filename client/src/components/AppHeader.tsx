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
      <Container className="flex items-center justify-between py-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-text">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-xs text-white">P</span>
          Portfolio Builder
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user && <span className="hidden text-sm text-muted sm:inline">{user.name || user.email}</span>}
          {user && (
            <Button variant="secondary" onClick={() => setConfirmingLogout(true)}>
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
