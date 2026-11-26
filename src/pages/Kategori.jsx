import { useCallback, useEffect, useState } from "react";
import { categoriesApi } from "../api/categories.js";
import { sparepartsApi } from "../api/spareparts.js";
import { useAuth } from "../context/AuthContext.jsx";
import StatCard from "../components/StatCard.jsx";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import Alert from "../components/Alert.jsx";

// Form tambah/ubah kategori. "awal" berisi data lama saat mengubah (kosong saat menambah).
function FormKategori({ awal, onSimpan, onBatal }) {
  const [name, setName] = useState(awal?.name ?? "");
  const [description, setDescription] = useState(awal?.description ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onSimpan({ name, description });
    } catch (err) {
      // Pesan dari backend, misalnya "Nama kategori harus diisi"
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert>{error}</Alert>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Nama kategori <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/40"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Deskripsi</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/40"
        />
      </div>

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
          {loading ? "Menyimpan..." : awal ? "Simpan perubahan" : "Simpan"}
        </button>
      </div>
    </form>
  );
}

export default function Kategori() {
  const { user } = useAuth();
  const adalahAdmin = user.role === "admin";

  const [kategori, setKategori] = useState([]);
  const [spareparts, setSpareparts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cari, setCari] = useState("");

  const [formTerbuka, setFormTerbuka] = useState(false);
  const [dipilih, setDipilih] = useState(null); // kategori yang sedang diubah (null = tambah baru)
  const [akanDihapus, setAkanDihapus] = useState(null);
  const [menghapus, setMenghapus] = useState(false);

  // Ambil kategori dan sparepart (sparepart dipakai untuk menghitung jumlah per kategori)
  const ambilData = useCallback(async () => {
    try {
      const [kt, sp] = await Promise.all([
        categoriesApi.getAll(),
        sparepartsApi.getAll(),
      ]);

      setKategori(kt.data);
      setSpareparts(sp.data);
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

  function bukaUbah(k) {
    setDipilih(k);
    setFormTerbuka(true);
  }

  function tutupForm() {
    setFormTerbuka(false);
    setDipilih(null);
  }

  // Dipanggil form saat tombol Simpan ditekan. Kalau gagal, error dilempar ke form.
  async function simpan(data) {
    if (dipilih) {
      await categoriesApi.update(dipilih.id, data);
    } else {
      await categoriesApi.create(data);
    }

    tutupForm();
    await ambilData();
  }

  async function hapus() {
    setMenghapus(true);

    try {
      await categoriesApi.remove(akanDihapus.id);
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
  const jumlahPerKategori = (id) =>
    spareparts.filter((s) => s.category_id === id).length;
  const tanpaKategori = spareparts.filter((s) => s.category_id === null).length;
  const terhubung = spareparts.length - tanpaKategori;

  // Pencarian dilakukan di sini (data sudah lengkap)
  const hasilCari = kategori.filter((k) =>
    k.name.toLowerCase().includes(cari.toLowerCase()),
  );

  const kolom = [
    { judul: "No", render: (_, nomor) => nomor },
    {
      judul: "Nama",
      render: (k) => <span className="font-medium">{k.name}</span>,
    },
    { judul: "Deskripsi", render: (k) => k.description || "-" },
    {
      judul: "Jumlah sparepart",
      render: (k) => (
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
          {jumlahPerKategori(k.id)} item
        </span>
      ),
    },
  ];

  // Kolom Aksi hanya untuk admin (petugas hanya boleh melihat)
  if (adalahAdmin) {
    kolom.push({
      judul: "Aksi",
      render: (k) => (
        <div className="flex gap-3 text-sm font-medium">
          <button
            onClick={() => bukaUbah(k)}
            className="text-slate-600 hover:text-navy"
          >
            Ubah
          </button>
          <button
            onClick={() => setAkanDihapus(k)}
            className="text-red-600 hover:text-red-700"
          >
            Hapus
          </button>
        </div>
      ),
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          Kelola klasifikasi dan pengelompokan sparepart
        </p>

        {adalahAdmin && (
          <button
            onClick={bukaTambah}
            className="rounded-md bg-brand px-4 py-2 text-sm font-bold text-navy hover:brightness-95"
          >
            + Tambah kategori
          </button>
        )}
      </div>

      <Alert>{error}</Alert>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard angka={kategori.length} label="Total kategori" />
        <StatCard angka={terhubung} label="Sparepart terhubung" />
        <StatCard angka={tanpaKategori} label="Sparepart tanpa kategori" />
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <input
          type="text"
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          placeholder="Cari nama kategori..."
          className="mb-4 w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/40"
        />

        {loading ? (
          <p className="text-sm text-slate-500">Memuat data...</p>
        ) : (
          <DataTable
            key={cari}
            kolom={kolom}
            data={hasilCari}
            perHalaman={5}
            pesanKosong="Belum ada kategori."
          />
        )}
      </section>

      {formTerbuka && (
        <Modal
          judul={dipilih ? "Ubah kategori" : "Tambah kategori"}
          onTutup={tutupForm}
        >
          <FormKategori awal={dipilih} onSimpan={simpan} onBatal={tutupForm} />
        </Modal>
      )}

      {akanDihapus && (
        <ConfirmDialog
          judul="Hapus kategori?"
          pesan="Kategori yang dihapus tidak dapat dikembalikan. Sparepart dalam kategori ini akan menjadi tanpa kategori."
          loading={menghapus}
          onBatal={() => setAkanDihapus(null)}
          onKonfirmasi={hapus}
        />
      )}
    </div>
  );
}
