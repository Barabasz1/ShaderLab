import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "@/styles/global.css";
import keycloak from "@/auth/keycloak";

const router = createRouter({
  routeTree,
  context: {
    auth: keycloak,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

keycloak
  .init({
    onLoad: "check-sso",
    pkceMethod: "S256",
  })
  .then((authenticated) => {
    console.log("Keycloak init success, authenticated:", authenticated); // ← add this
    const rootEl = document.getElementById("root");
    console.log("Root element:", rootEl); // ← and this
    ReactDOM.createRoot(document.getElementById("root")!).render(
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>,
    );
  })
  .catch((error) => {
    console.error("Keycloak initialization failed", error);
  });
