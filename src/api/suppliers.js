import { request } from "./client.js";

export const suppliersApi = {
  getAll: () => request("/suppliers"),
  create: (data) => request("/suppliers", { method: "POST", body: data }),
  update: (id, data) =>
    request(`/suppliers/${id}`, { method: "PUT", body: data }),
  remove: (id) => request(`/suppliers/${id}`, { method: "DELETE" }),
};
