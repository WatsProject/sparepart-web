import { request } from "./client.js";

export const sparepartsApi = {
  getAll: () => request("/spareparts"),
  create: (data) => request("/spareparts", { method: "POST", body: data }),
  update: (id, data) =>
    request(`/spareparts/${id}`, { method: "PUT", body: data }),
  remove: (id) => request(`/spareparts/${id}`, { method: "DELETE" }),
};
