import { NAMA_APP, NAMA_BENGKEL } from "../config/app.js";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { user, login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [tampilkanPassword, setTampilkanPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Kalau sudah login, tidak perlu melihat halaman login lagi
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username, password);
      // Setelah berhasil, data user terisi dan halaman otomatis berpindah
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-[45%_55%]">
      {/* Sisi kiri: judul aplikasi */}
      <div className="hidden flex-col justify-center bg-navy p-12 md:flex">
        <h1 className="text-4xl font-bold text-white">{NAMA_BENGKEL}</h1>
        <div className="mt-4 h-1 w-24 bg-brand" />
        <p className="mt-6 text-lg text-slate-300">
          Sistem {NAMA_APP}. Kelola stok dengan mudah dan akurat.
        </p>
      </div>

      {/* Sisi kanan: form login */}
      <div className="flex items-center justify-center bg-page p-6">
        <div className="w-full max-w-105 rounded-xl border border-slate-200 bg-white p-8">
          <h2 className="text-2xl font-bold text-navy">Masuk</h2>
          <p className="mt-1 text-sm text-slate-500">
            Silakan masuk dengan akun Anda.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-md bg-red-100 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-navy">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/40"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-navy">
                Password
              </label>
              <div className="relative">
                <input
                  type={tampilkanPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 pr-24 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/40"
                />
                <button
                  type="button"
                  onClick={() => setTampilkanPassword(!tampilkanPassword)}
                  className="absolute inset-y-0 right-3 text-xs font-medium text-slate-500"
                >
                  {tampilkanPassword ? "Sembunyikan" : "Tampilkan"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-brand py-2.5 text-sm font-bold text-navy hover:brightness-95 disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-500">
            Belum punya akun? Hubungi admin.
          </p>
        </div>
      </div>
    </div>
  );
}
