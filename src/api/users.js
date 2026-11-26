import { request } from "./client.js";

export const usersApi = {
  getAll: () => request("/users"),
  create: (data) => request("/auth/register", { method: "POST", body: data }),
  update: (id, data) => request(`/users/${id}`, { method: "PUT", body: data }),
  remove: (id) => request(`/users/${id}`, { method: "DELETE" }),
};
