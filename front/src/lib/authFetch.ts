import keycloak from "@/lib/keycloak";

export const refreshToken = async () => {
  try {
    await keycloak.updateToken(30);
  } catch {
    keycloak.login();
    throw new Error("Session expired");
  }
};

export const authFetch = async (input: RequestInfo, init?: RequestInit) => {
  await refreshToken();
  return fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${keycloak.token}`,
      ...init?.headers,
    },
  });
};
