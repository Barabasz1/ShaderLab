import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "@/styles/global.css";
import keycloak from "@/lib/keycloak";

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
    pkceMethod: "S256",
    checkLoginIframe: false,
  })
  .then(() => {
    ReactDOM.createRoot(document.getElementById("root")!).render(
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>,
    );
  })
  .catch((error) => {
    console.error("Keycloak initialization failed", error);
  });
