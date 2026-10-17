import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Header, Footer } from "@/components/site";
import { Toaster } from "@/components/ui/sonner";
import { AdsterraBanner } from "@/components/AdsterraBanner";
import { AuthProvider } from "@/hooks/useAuth";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-semibold">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">This page doesn't exist.</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full bg-gradient-brand px-5 py-2 text-sm font-semibold text-on-brand"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error("Root route error:", error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">This page didn't load</h1>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "TOPIT — Prepare Smarter. Score Better." },
      { name: "description", content: "Board exam preparation ecosystem for Class 9–12." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://topit.akhand2152.workers.dev" },
      { property: "og:site_name", content: "TOPIT" },
      { property: "og:title", content: "TOPIT — Prepare Smarter. Score Better." },
      {
        property: "og:description",
        content: "Board exam preparation ecosystem for Class 9–12.",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:domain", content: "topit.akhand2152.workers.dev" },
      { name: "twitter:url", content: "https://topit.akhand2152.workers.dev" },
    ],
    links: [
      { rel: "canonical", href: "https://topit.akhand2152.workers.dev" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="bg-page min-h-screen">
          <div className="pointer-events-none fixed inset-0 overflow-hidden">
            <div className="absolute -top-32 -left-24 size-[420px] rounded-full bg-brand/25 blur-[110px]" />
            <div className="absolute top-40 -right-28 size-[460px] rounded-full bg-sky/25 blur-[120px]" />
            <div className="absolute bottom-0 left-1/3 size-[380px] rounded-full bg-brand2/20 blur-[120px]" />
          </div>
          <Header />
          <Outlet />
          <Toaster />
          <div className="relative z-10 px-4 pt-6">
            <AdsterraBanner />
          </div>
          <Footer />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}
