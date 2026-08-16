"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouteTransition } from "@/lib/route-transition";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { replace } = useRouteTransition();

  useEffect(() => {
    if (!loading && !user) replace("/login");
  }, [user, loading, replace]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
