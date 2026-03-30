import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import Layout from "./components/Layout";
import Analysis from "./pages/Analysis";
import Dashboard from "./pages/Dashboard";
import Goals from "./pages/Goals";
import Investments from "./pages/Investments";
import LoginPage from "./pages/LoginPage";
import Markets from "./pages/Markets";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster />
    </>
  ),
});

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "layout",
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/",
  component: Dashboard,
});

const investmentsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/investments",
  component: Investments,
});

const analysisRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/analysis",
  component: Analysis,
});

const goalsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/goals",
  component: Goals,
});

const marketsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/markets",
  component: Markets,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    indexRoute,
    investmentsRoute,
    analysisRoute,
    goalsRoute,
    marketsRoute,
  ]),
  loginRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
