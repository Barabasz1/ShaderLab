import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async ({ context, location }) => {
    if (!context.auth.authenticated) {
      context.auth.login({ redirectUri: window.location.href + location.href });
      throw new Promise(() => {});
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return <Outlet />;
}
