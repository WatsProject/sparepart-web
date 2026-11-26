import { useState } from "react";
import { usersApi } from "../api/users.js";
import { useAuth } from "../context/AuthContext.jsx";
import Alert from "../components/Alert.jsx";
import Bidang from "../components/Bidang.jsx";
import { gayaInput } from "../utils/gaya.js";

export default function Akun() {
  const { user, perbaruiUser } = useAuth();

  // Isian awal diambil dari data login saat ini
  const [isi, setIsi] = useState({
    name: user.name,
    username: user.username,
    password: "",
    konfirmasi: "",
  });
  const [tampilkanPassword, setTampilkanPassword] = useState(false);
  const [error, setError] = useState("");
  const [sukses, setSukses] = useState("");
  const [loading, setLoading] = useState(false);

  // Dipakai semua input: nilai disimpan sesuai atribut name pada input-nya
  function ubahIsi(e) {
    setIsi({ ...isi, [e.target.name]: e.target.value });
    setSukses("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSukses("");

    // Dicek di sini: password baru dan konfirmasinya harus sama
    if (isi.password !== isi.konfirmasi) {
      setError("Konfirmasi password tidak cocok");
      return;
    }

    setLoading(true);

    // Role tidak dikirim, jadi role tidak berubah.
    // Password kosong tidak dikirim, artinya password lama tetap dipakai.
    const data = { name: isi.name, username: isi.username };

    if (isi.password) {
      data.password = isi.password;
    }

    try {
      await usersApi.update(user.id, data);

      // Nama di pojok kanan atas ikut berubah
      perbaruiUser({ name: isi.name, username: isi.username });

      setIsi({ ...isi, password: "", konfirmasi: "" });
      setSukses("Akun berhasil diperbarui.");
    } catch (err) {
      // Pesan dari backend, misalnya "Username sudah digunakan"
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const jenisInput = tampilkanPassword ? "text" : "password";

  return (
    <div className="max-w-lg rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-bold">Data akun</h3>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            user.role === "admin"
              ? "bg-navy text-white"
              : "bg-slate-200 text-slate-700"
          }`}
        >
          {user.role === "admin" ? "Admin" : "Petugas"}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Alert>{error}</Alert>

        {sukses && (
          <div className="mb-4 rounded-md bg-green-100 px-3 py-2 text-sm text-green-700">
            {sukses}
          </div>
        )}

        <Bidang label="Nama lengkap" wajib>
          <input
            type="text"
            name="name"
            value={isi.name}
            onChange={ubahIsi}
            className={gayaInput}
          />
        </Bidang>

        <Bidang label="Username" wajib>
          <input
            type="text"
            name="username"
            value={isi.username}
            onChange={ubahIsi}
            className={gayaInput}
          />
        </Bidang>

        <Bidang
          label="Password baru"
          bantuan="Kosongkan jika tidak ingin mengubah password"
        >
          <input
            type={jenisInput}
            name="password"
            value={isi.password}
            onChange={ubahIsi}
            className={gayaInput}
          />
        </Bidang>

        <Bidang label="Konfirmasi password baru">
          <input
            type={jenisInput}
            name="konfirmasi"
            value={isi.konfirmasi}
            onChange={ubahIsi}
            className={gayaInput}
          />
        </Bidang>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={tampilkanPassword}
            onChange={(e) => setTampilkanPassword(e.target.checked)}
          />
          Tampilkan password
        </label>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-brand px-4 py-2 text-sm font-bold text-navy hover:brightness-95 disabled:opacity-60"
          >
            {loading ? "Menyimpan..." : "Simpan perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
