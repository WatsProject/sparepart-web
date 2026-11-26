import { useCallback, useEffect, useState } from "react";
import { usersApi } from "../api/users.js";
import { useAuth } from "../context/AuthContext.jsx";
import StatCard from "../components/StatCard.jsx";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import Alert from "../components/Alert.jsx";
import Bidang from "../components/Bidang.jsx";
import { gayaInput } from "../utils/gaya.js";
import { formatTanggal } from "../utils/format.js";

// Form tambah/ubah pengguna. "awal" berisi data lama saat mengubah (kosong saat menambah).
// "akunSendiri" true kalau yang diubah adalah akun admin yang sedang login.
function FormPengguna({ awal, akunSendiri, onSimpan, onBatal }) {
  const mengubah = Boolean(awal);

  const [isi, setIsi] = useState({
    name: awal?.name ?? "",
    username: awal?.username ?? "",
    password: "",
    role: awal?.role ?? "petugas",
  });
  const [tampilkanPassword, setTampilkanPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Dipakai semua input: nilai disimpan sesuai atribut name pada input-nya
  function ubahIsi(e) {
    setIsi({ ...isi, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const data = { name: isi.name, username: isi.username, role: isi.role };

    // Password kosong tidak dikirim: saat mengubah, artinya password lama tetap dipakai
    if (isi.password) {
      data.password = isi.password;
    }

    try {
      await onSimpan(data);
    } catch (err) {
      // Pesan dari backend, misalnya "Username sudah digunakan"
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert>{error}</Alert>

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
        label="Password"
        wajib={!mengubah}
        bantuan={
          mengubah ? "Kosongkan jika tidak ingin mengubah password" : undefined
        }
      >
        <div className="relative">
          <input
            type={tampilkanPassword ? "text" : "password"}
            name="password"
            value={isi.password}
            onChange={ubahIsi}
            className={`${gayaInput} pr-24`}
          />
          <button
            type="button"
            onClick={() => setTampilkanPassword(!tampilkanPassword)}
            className="absolute inset-y-0 right-3 text-xs font-medium text-slate-500"
          >
            {tampilkanPassword ? "Sembunyikan" : "Tampilkan"}
          </button>
        </div>
      </Bidang>

      <Bidang
        label="Role"
        bantuan={
          akunSendiri ? "Role akun sendiri tidak dapat diubah." : undefined
        }
      >
        <select
          name="role"
          value={isi.role}
          onChange={ubahIsi}
          disabled={akunSendiri}
          className={gayaInput}
        >
          <option value="petugas">Petugas</option>
          <option value="admin">Admin</option>
        </select>
      </Bidang>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onBatal}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-brand px-4 py-2 text-sm font-bold text-navy hover:brightness-95 disabled:opacity-60"
        >
          {loading ? "Menyimpan..." : mengubah ? "Simpan perubahan" : "Simpan"}
        </button>
      </div>
    </form>
  );
}

export default function Pengguna() {
  const { user, perbaruiUser } = useAuth();

  const [daftarUser, setDaftarUser] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cari, setCari] = useState("");

  const [formTerbuka, setFormTerbuka] = useState(false);
  const [dipilih, setDipilih] = useState(null); // pengguna yang sedang diubah (null = tambah baru)
  const [akanDihapus, setAkanDihapus] = useState(null);
  const [menghapus, setMenghapus] = useState(false);

  const ambilData = useCallback(async () => {
    try {
      const hasil = await usersApi.getAll();
      setDaftarUser(hasil.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    ambilData();
  }, [ambilData]);

  function bukaTambah() {
    setDipilih(null);
    setFormTerbuka(true);
  }

  function bukaUbah(u) {
    setDipilih(u);
    setFormTerbuka(true);
  }

  function tutupForm() {
    setFormTerbuka(false);
    setDipilih(null);
  }

  // Dipanggil form saat tombol Simpan ditekan. Kalau gagal, error dilempar ke form.
  async function simpan(data) {
    if (dipilih) {
      await usersApi.update(dipilih.id, data);

      // Kalau yang diubah akun sendiri, nama di pojok kanan atas ikut diperbarui
      if (dipilih.id === user.id) {
        perbaruiUser({ name: data.name, username: data.username });
      }
    } else {
      await usersApi.create(data);
    }

    tutupForm();
    await ambilData();
  }

  async function hapus() {
    setMenghapus(true);

    try {
      await usersApi.remove(akanDihapus.id);
      setAkanDihapus(null);
      await ambilData();
    } catch (err) {
      setAkanDihapus(null);
      setError(err.message);
    } finally {
      setMenghapus(false);
    }
  }

  // Angka ringkasan dihitung di sini
  const jumlahAdmin = daftarUser.filter((u) => u.role === "admin").length;
  const jumlahPetugas = daftarUser.filter((u) => u.role === "petugas").length;

  // Pencarian (nama atau username) dilakukan di sini (data sudah lengkap)
  const hasilCari = daftarUser.filter((u) =>
    `${u.name} ${u.username}`.toLowerCase().includes(cari.toLowerCase()),
  );

  const kolom = [
    { judul: "No", render: (_, nomor) => nomor },
    {
      judul: "Nama",
      render: (u) => (
        <span className="font-medium">
          {u.name}
          {u.id === user.id && (
            <span className="ml-2 rounded bg-brand-soft px-1.5 py-0.5 text-xs font-semibold text-slate-600">
              Anda
            </span>
          )}
        </span>
      ),
    },
    { judul: "Username", render: (u) => u.username },
    {
      judul: "Role",
      render: (u) => (
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            u.role === "admin"
              ? "bg-navy text-white"
              : "bg-slate-200 text-slate-700"
          }`}
        >
          {u.role === "admin" ? "Admin" : "Petugas"}
        </span>
      ),
    },
    { judul: "Dibuat", render: (u) => formatTanggal(u.created_at) },
    {
      judul: "Aksi",
      render: (u) => (
        <div className="flex gap-3 text-sm font-medium">
          <button
            onClick={() => bukaUbah(u)}
            className="text-slate-600 hover:text-navy"
          >
            Ubah
          </button>
          {/* Akun sendiri tidak boleh dihapus */}
          <button
            onClick={() => setAkanDihapus(u)}
            disabled={u.id === user.id}
            className="text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Hapus
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">Kelola akun admin dan petugas</p>

        <button
          onClick={bukaTambah}
          className="rounded-md bg-brand px-4 py-2 text-sm font-bold text-navy hover:brightness-95"
        >
          + Tambah pengguna
        </button>
      </div>

      <Alert>{error}</Alert>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard angka={daftarUser.length} label="Total pengguna" />
        <StatCard angka={jumlahAdmin} label="Admin" />
        <StatCard angka={jumlahPetugas} label="Petugas" />
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <input
          type="text"
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          placeholder="Cari nama atau username..."
          className="mb-4 w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/40"
        />

        {loading ? (
          <p className="text-sm text-slate-500">Memuat data...</p>
        ) : (
          <DataTable
            key={cari}
            kolom={kolom}
            data={hasilCari}
            perHalaman={10}
            pesanKosong="Belum ada pengguna."
          />
        )}
      </section>

      {formTerbuka && (
        <Modal
          judul={dipilih ? "Ubah pengguna" : "Tambah pengguna"}
          onTutup={tutupForm}
        >
          <FormPengguna
            awal={dipilih}
            akunSendiri={dipilih?.id === user.id}
            onSimpan={simpan}
            onBatal={tutupForm}
          />
        </Modal>
      )}

      {akanDihapus && (
        <ConfirmDialog
          judul="Hapus pengguna?"
          pesan="Pengguna yang dihapus tidak dapat dikembalikan. Riwayat transaksi yang dicatat pengguna ini tetap tersimpan tanpa nama pencatat."
          loading={menghapus}
          onBatal={() => setAkanDihapus(null)}
          onKonfirmasi={hapus}
        />
      )}
    </div>
  );
}
