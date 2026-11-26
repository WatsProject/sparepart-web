import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Sparepart from "./pages/Sparepart.jsx";
import Kategori from "./pages/Kategori.jsx";
import Supplier from "./pages/Supplier.jsx";
import Transaksi from "./pages/Transaksi.jsx";
import Laporan from "./pages/Laporan.jsx";
import Pengguna from "./pages/Pengguna.jsx";
import Akun from "./pages/Akun.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Semua halaman di dalam blok ini wajib login */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/sparepart" element={<Sparepart />} />
              <Route path="/kategori" element={<Kategori />} />
              <Route path="/supplier" element={<Supplier />} />
              <Route
                path="/barang-masuk"
                element={<Transaksi key="in" jenis="in" />}
              />
              <Route
                path="/barang-keluar"
                element={<Transaksi key="out" jenis="out" />}
              />
              <Route path="/laporan" element={<Laporan />} />
              <Route path="/akun" element={<Akun />} />

              {/* Khusus admin */}
              <Route element={<ProtectedRoute roles={["admin"]} />}>
                <Route path="/pengguna" element={<Pengguna />} />
              </Route>
            </Route>
          </Route>

          {/* Alamat lain diarahkan ke dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
