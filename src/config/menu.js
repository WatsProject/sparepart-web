// Daftar menu sidebar. Menu dengan "roles" hanya tampil untuk role tersebut.
export const MENU = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/sparepart", label: "Sparepart" },
  { to: "/kategori", label: "Kategori" },
  { to: "/supplier", label: "Supplier" },
  { to: "/barang-masuk", label: "Barang masuk" },
  { to: "/barang-keluar", label: "Barang keluar" },
  { to: "/laporan", label: "Laporan" },
  { to: "/pengguna", label: "Pengguna", roles: ["admin"] },
];
