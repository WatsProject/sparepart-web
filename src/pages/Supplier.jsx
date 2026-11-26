import { useCallback, useEffect, useState } from "react";
import { suppliersApi } from "../api/suppliers.js";
import { sparepartsApi } from "../api/spareparts.js";
import { stockTransactionsApi } from "../api/stockTransactions.js";
import { useAuth } from "../context/AuthContext.jsx";
import StatCard from "../components/StatCard.jsx";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import Alert from "../components/Alert.jsx";
import { formatTanggal } from "../utils/format.js";

const gayaInput =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/40";

// Form tambah/ubah supplier. "awal" berisi data lama saat mengubah (kosong saat menambah).
function FormSupplier({ awal, onSimpan, onBatal }) {
  // Semua isian disimpan dalam satu objek; nama field sama dengan yang dikirim ke backend
  const [isi, setIsi] = useState({
    name: awal?.name ?? "",
    address: awal?.address ?? "",
    phone: awal?.phone ?? "",
    contact: awal?.contact ?? "",
  });
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

    try {
      await onSimpan(isi);
    } catch (err) {
      // Pesan dari backend, misalnya "Nama supplier harus diisi"
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert>{error}</Alert>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Nama supplier <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={isi.name}
          onChange={ubahIsi}
          className={gayaInput}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Alamat</label>
        <textarea
          rows={3}
          name="address"
          value={isi.address}
          onChange={ubahIsi}
          className={gayaInput}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Telepon</label>
          <input
            type="text"
            name="phone"
            value={isi.phone}
            onChange={ubahIsi}
            className={gayaInput}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Kontak</label>
          <input
            type="text"
            name="contact"
            value={isi.contact}
            onChange={ubahIsi}
            placeholder="Nama kontak"
            className={gayaInput}
          />
        </div>
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

export default function Supplier() {
  const { user } = useAuth();
  const adalahAdmin = user.role === "admin";

  const [suppliers, setSuppliers] = useState([]);
  const [spareparts, setSpareparts] = useState([]);
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cari, setCari] = useState("");

  const [formTerbuka, setFormTerbuka] = useState(false);
  const [dipilih, setDipilih] = useState(null); // supplier yang sedang diubah (null = tambah baru)
  const [akanDihapus, setAkanDihapus] = useState(null);
  const [menghapus, setMenghapus] = useState(false);

  // Ambil supplier, sparepart, dan transaksi (dua yang terakhir untuk angka ringkasan)
  const ambilData = useCallback(async () => {
    try {
      const [sup, sp, tr] = await Promise.all([
        suppliersApi.getAll(),
        sparepartsApi.getAll(),
        stockTransactionsApi.getAll(),
      ]);

      setSuppliers(sup.data);
      setSpareparts(sp.data);
      setTransaksi(tr.data);
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

  function bukaUbah(s) {
    setDipilih(s);
    setFormTerbuka(true);
  }

  function tutupForm() {
    setFormTerbuka(false);
    setDipilih(null);
  }

  // Dipanggil form saat tombol Simpan ditekan. Kalau gagal, error dilempar ke form.
  async function simpan(data) {
    if (dipilih) {
      await suppliersApi.update(dipilih.id, data);
    } else {
      await suppliersApi.create(data);
    }

    tutupForm();
    await ambilData();
  }

  async function hapus() {
    setMenghapus(true);

    try {
      await suppliersApi.remove(akanDihapus.id);
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
  const sparepartTerhubung = spareparts.filter(
    (s) => s.supplier_id !== null,
  ).length;

  const bulanIni = new Date().toLocaleDateString("sv-SE").slice(0, 7); // contoh: "2026-11"
  const masukBulanIni = transaksi.filter(
    (t) => t.type === "in" && formatTanggal(t.date).slice(0, 7) === bulanIni,
  ).length;

  // Pencarian dilakukan di sini (data sudah lengkap)
  const hasilCari = suppliers.filter((s) =>
    s.name.toLowerCase().includes(cari.toLowerCase()),
  );

  const kolom = [
    { judul: "No", render: (_, nomor) => nomor },
    {
      judul: "Nama",
      render: (s) => <span className="font-medium">{s.name}</span>,
    },
    { judul: "Alamat", render: (s) => s.address || "-" },
    { judul: "Telepon", render: (s) => s.phone || "-" },
    { judul: "Kontak", render: (s) => s.contact || "-" },
  ];

  // Kolom Aksi hanya untuk admin (petugas hanya boleh melihat)
  if (adalahAdmin) {
    kolom.push({
      judul: "Aksi",
      render: (s) => (
        <div className="flex gap-3 text-sm font-medium">
          <button
            onClick={() => bukaUbah(s)}
            className="text-slate-600 hover:text-navy"
          >
            Ubah
          </button>
          <button
            onClick={() => setAkanDihapus(s)}
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
          Kelola data dan informasi pemasok sparepart
        </p>

        {adalahAdmin && (
          <button
            onClick={bukaTambah}
            className="rounded-md bg-brand px-4 py-2 text-sm font-bold text-navy hover:brightness-95"
          >
            + Tambah supplier
          </button>
        )}
      </div>

      <Alert>{error}</Alert>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard angka={suppliers.length} label="Total supplier" />
        <StatCard angka={sparepartTerhubung} label="Sparepart terhubung" />
        <StatCard angka={masukBulanIni} label="Transaksi masuk bulan ini" />
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <input
          type="text"
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          placeholder="Cari nama supplier..."
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
            pesanKosong="Belum ada supplier."
          />
        )}
      </section>

      {formTerbuka && (
        <Modal
          judul={dipilih ? "Ubah supplier" : "Tambah supplier"}
          onTutup={tutupForm}
        >
          <FormSupplier awal={dipilih} onSimpan={simpan} onBatal={tutupForm} />
        </Modal>
      )}

      {akanDihapus && (
        <ConfirmDialog
          judul="Hapus supplier?"
          pesan="Supplier yang dihapus tidak dapat dikembalikan. Sparepart dan transaksi yang terkait akan kehilangan informasi supplier."
          loading={menghapus}
          onBatal={() => setAkanDihapus(null)}
          onKonfirmasi={hapus}
        />
      )}
    </div>
  );
}
