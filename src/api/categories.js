import { request } from "./client.js";

export const categoriesApi = {
  getAll: () => request("/categories"),
  create: (data) => request("/categories", { method: "POST", body: data }),
  update: (id, data) =>
    request(`/categories/${id}`, { method: "PUT", body: data }),
  remove: (id) => request(`/categories/${id}`, { method: "DELETE" }),
};
