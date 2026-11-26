import { request } from "./client.js";

export const authApi = {
  login: (username, password) =>
    request("/auth/login", { method: "POST", body: { username, password } }),
};
