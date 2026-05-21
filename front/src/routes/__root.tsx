import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import type Keycloak from "keycloak-js";

interface RouterContext {
  auth: Keycloak;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <div>
      <main>
        <Outlet />
      </main>
    </div>
  ),
});
