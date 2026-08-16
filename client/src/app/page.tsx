"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouteTransition } from "@/lib/route-transition";

export default function Home() {
  const { user, loading } = useAuth();
  const { replace } = useRouteTransition();

  useEffect(() => {
    if (loading) return;
    replace(user ? "/dashboard" : "/login");
  }, [user, loading, replace]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
    </div>
  );
}
