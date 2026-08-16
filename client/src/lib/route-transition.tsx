"use client";

import { createContext, useContext, useTransition, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface RouteTransitionState {
  isPending: boolean;
  navigate: (href: string) => void;
  replace: (href: string) => void;
}

const RouteTransitionContext = createContext<RouteTransitionState>({
  isPending: false,
  navigate: () => {},
  replace: () => {},
});

// Wraps router.push/replace in React's useTransition so `isPending` stays
// true for as long as the current page is kept on screen while the next
// route's chunk loads and its initial render commits — that's exactly the
// window (click -> new page visible) where nothing else in the app gives the
// user any feedback. The destination page's own loading state (ProtectedRoute,
// per-page isLoading spinners) takes over from there.
export function RouteTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function navigate(href: string) {
    startTransition(() => {
      router.push(href);
    });
  }

  function replace(href: string) {
    startTransition(() => {
      router.replace(href);
    });
  }

  return (
    <RouteTransitionContext.Provider value={{ isPending, navigate, replace }}>
      <TopLoadingBar visible={isPending} />
      {children}
    </RouteTransitionContext.Provider>
  );
}

export function useRouteTransition() {
  return useContext(RouteTransitionContext);
}

function TopLoadingBar({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="fixed left-0 top-0 z-[100] h-0.5 w-full overflow-hidden bg-accent/20" role="status" aria-label="Loading page">
      <div className="h-full w-1/3 animate-route-loading bg-accent" />
    </div>
  );
}
