import { SchoolFooter } from "@/components/SchoolFooter";
import { SchoolHeader } from "@/components/SchoolHeader";
import { Toaster } from "@/components/ui/sonner";
import AdminPage from "@/pages/AdminPage";
import HomePage from "@/pages/HomePage";
import ResultsPage from "@/pages/ResultsPage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

// ── Root layout ───────────────────────────────────────────────────────────
const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col bg-background">
      <SchoolHeader />
      <Outlet />
      <SchoolFooter />
      <Toaster richColors position="top-right" />
    </div>
  ),
});

// ── Routes ────────────────────────────────────────────────────────────────
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const resultsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/results",
  component: ResultsPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

// ── Router ────────────────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([homeRoute, resultsRoute, adminRoute]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
