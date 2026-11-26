import { request } from "./client.js";

export const stockTransactionsApi = {
  getAll: () => request("/stock-transactions"),
  // jenis: "in" (barang masuk) atau "out" (barang keluar)
  getByJenis: (jenis) => request(`/stock-transactions/${jenis}`),
  create: (data) =>
    request("/stock-transactions", { method: "POST", body: data }),
  update: (id, data) =>
    request(`/stock-transactions/${id}`, { method: "PUT", body: data }),
  remove: (id) => request(`/stock-transactions/${id}`, { method: "DELETE" }),
};
