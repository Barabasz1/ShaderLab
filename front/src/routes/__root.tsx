import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import type Keycloak from "keycloak-js";

interface RouterContext {
  auth: Keycloak;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  notFoundComponent: () => (
    <div>
      <h1>404 — Page Not Found</h1>
      <a href="/">Go home</a>
    </div>
  ),
  component: () => (
    <div>
      <main>
        <Outlet />
      </main>
    </div>
  ),
});
