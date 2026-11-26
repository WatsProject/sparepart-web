import { NAMA_APP, NAMA_BENGKEL } from "../config/app.js";
import { useEffect, useRef } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { MENU } from "../config/menu.js";

// Kerangka semua halaman: sidebar di kiri, header di atas, isi halaman di tengah.
// Tinggi dikunci setinggi layar, sehingga hanya isi halaman yang bisa di-scroll.
export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const areaIsi = useRef(null);

  // Judul halaman diambil dari menu yang sedang aktif
  const judul = pathname.startsWith("/akun")
    ? "Akun saya"
    : (MENU.find((m) => pathname.startsWith(m.to))?.label ?? "");

  // Menu khusus admin disembunyikan untuk petugas
  const menuTampil = MENU.filter(
    (m) => !m.roles || m.roles.includes(user.role),
  );

  // Setiap pindah halaman, isi halaman kembali ke posisi paling atas
  useEffect(() => {
    areaIsi.current?.scrollTo(0, 0);
  }, [pathname]);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex h-screen overflow-hidden bg-page text-navy print:block print:h-auto print:overflow-visible">
      {/* Sidebar: tinggi penuh dan tidak ikut bergulir */}
      <aside className="w-60 shrink-0 overflow-y-auto bg-navy p-5 print:hidden">
        <h1 className="text-lg font-bold leading-tight text-white">{NAMA_BENGKEL}</h1>
        <p className="mt-1 text-xs text-slate-400">{NAMA_APP}</p>
        <div className="mt-3 h-0.5 bg-brand" />

        <nav className="mt-6 flex flex-col gap-1">
          {menuTampil.map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-brand text-navy"
                    : "text-slate-300 hover:bg-white/10"
                }`
              }
            >
              {m.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col print:block">
        {/* Header: tetap di atas */}
        <header className="flex shrink-0 items-center justify-between px-8 py-4 print:hidden">
          <h2 className="text-2xl font-bold">{judul}</h2>

          {/* Profil dan tombol Keluar di pojok kanan atas */}
          <div className="flex items-center gap-3">
            <Link
              to="/akun"
              title="Akun saya"
              className="flex items-center gap-3 rounded-md p-1 hover:bg-white"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand font-bold">
                {user.name[0].toUpperCase()}
              </div>
              <div className="leading-tight">
                <p className="text-sm font-bold">{user.name}</p>
                <p className="text-xs capitalize text-slate-500">{user.role}</p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-white"
            >
              Keluar
            </button>
          </div>
        </header>

        {/* Hanya bagian ini yang bisa di-scroll */}
        <main
          ref={areaIsi}
          className="flex-1 overflow-y-auto px-8 pb-8 print:overflow-visible print:px-0"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
