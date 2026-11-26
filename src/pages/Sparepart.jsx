import { useCallback, useEffect, useState } from "react";
import { sparepartsApi } from "../api/spareparts.js";
import { categoriesApi } from "../api/categories.js";
import { suppliersApi } from "../api/suppliers.js";
import { useAuth } from "../context/AuthContext.jsx";
import StatCard from "../components/StatCard.jsx";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import Alert from "../components/Alert.jsx";
import { StatusBadge } from "../components/Badge.jsx";
import { formatRupiah } from "../utils/format.js";

const gayaInput =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/40 disabled:bg-slate-100 disabled:text-slate-500";

// Mengubah "15000.00" (string dari backend) menjadi "15000" untuk diisi ke input
const angkaAwal = (nilai) =>
  nilai === undefined || nilai === null ? "" : String(Number(nilai));

// Satu bidang form: label, isian, dan teks bantuan kecil
function Bidang({ label, wajib, bantuan, children }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">
        {label} {wajib && <span className="text-red-600">*</span>}
      </label>
      {children}
      {bantuan && <p className="mt-1 text-xs text-slate-500">{bantuan}</p>}
    </div>
  );
}

// Form tambah/ubah sparepart. "awal" berisi data lama saat mengubah (kosong saat menambah).
function FormSparepart({ awal, kategori, suppliers, onSimpan, onBatal }) {
  const mengubah = Boolean(awal);

  // Semua isian disimpan dalam satu objek; nama field sama dengan yang dikirim ke backend
  const [isi, setIsi] = useState({
    kode: awal?.kode ?? "",
    name: awal?.name ?? "",
    brand: awal?.brand ?? "",
    unit: awal?.unit ?? "pcs",
    category_id: awal?.category_id ?? "",
    supplier_id: awal?.supplier_id ?? "",
    buy_price: angkaAwal(awal?.buy_price),
    sell_price: angkaAwal(awal?.sell_price),
    stock: angkaAwal(awal?.stock),
    min_stock: angkaAwal(awal?.min_stock),
    description: awal?.description ?? "",
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

    // Isian form berupa teks; backend butuh angka, dan null untuk kategori/supplier kosong
    const data = {
      kode: isi.kode,
      name: isi.name,
      brand: isi.brand,
      unit: isi.unit || "pcs",
      category_id: isi.category_id === "" ? null : Number(isi.category_id),
      supplier_id: isi.supplier_id === "" ? null : Number(isi.supplier_id),
      buy_price: Number(isi.buy_price || 0),
      sell_price: Number(isi.sell_price || 0),
      stock: Number(isi.stock || 0),
      min_stock: Number(isi.min_stock || 0),
      description: isi.description,
    };

    try {
      await onSimpan(data);
    } catch (err) {
      // Pesan dari backend, misalnya "Kode sparepart sudah digunakan"
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert>{error}</Alert>

      <div className="grid gap-4 sm:grid-cols-2">
        <Bidang label="Kode" wajib>
          <input
            type="text"
            name="kode"
            value={isi.kode}
            onChange={ubahIsi}
            className={gayaInput}
          />
        </Bidang>

        <Bidang label="Nama" wajib>
          <input
            type="text"
            name="name"
            value={isi.name}
            onChange={ubahIsi}
            className={gayaInput}
          />
        </Bidang>

        <Bidang label="Merek">
          <input
            type="text"
            name="brand"
            value={isi.brand}
            onChange={ubahIsi}
            className={gayaInput}
          />
        </Bidang>

        <Bidang label="Satuan">
          <input
            type="text"
            name="unit"
            value={isi.unit}
            onChange={ubahIsi}
            className={gayaInput}
          />
        </Bidang>

        <Bidang label="Kategori">
          <select
            name="category_id"
            value={isi.category_id}
            onChange={ubahIsi}
            className={gayaInput}
          >
            <option value="">Tanpa kategori</option>
            {kategori.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name}
              </option>
            ))}
          </select>
        </Bidang>

        <Bidang label="Supplier">
          <select
            name="supplier_id"
            value={isi.supplier_id}
            onChange={ubahIsi}
            className={gayaInput}
          >
            <option value="">Tanpa supplier</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Bidang>

        <Bidang label="Harga beli">
          <input
            type="number"
            min="0"
            name="buy_price"
            value={isi.buy_price}
            onChange={ubahIsi}
            placeholder="0"
            className={gayaInput}
          />
        </Bidang>

        <Bidang label="Harga jual">
          <input
            type="number"
            min="0"
            name="sell_price"
            value={isi.sell_price}
            onChange={ubahIsi}
            placeholder="0"
            className={gayaInput}
          />
        </Bidang>

        <Bidang
          label={mengubah ? "Stok" : "Stok awal"}
          bantuan={
            mengubah
              ? "Stok diubah lewat menu Barang masuk dan Barang keluar."
              : undefined
          }
        >
          <input
            type="number"
            min="0"
            name="stock"
            value={isi.stock}
            onChange={ubahIsi}
            disabled={mengubah}
            placeholder="0"
            className={gayaInput}
          />
        </Bidang>

        <Bidang label="Stok minimum">
          <input
            type="number"
            min="0"
            name="min_stock"
            value={isi.min_stock}
            onChange={ubahIsi}
            placeholder="0"
            className={gayaInput}
          />
        </Bidang>
      </div>

      <Bidang label="Deskripsi">
        <textarea
          rows={3}
          name="description"
          value={isi.description}
          onChange={ubahIsi}
          className={gayaInput}
        />
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

export default function Sparepart() {
  const { user } = useAuth();
  const adalahAdmin = user.role === "admin";

  const [spareparts, setSpareparts] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cari, setCari] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [formTerbuka, setFormTerbuka] = useState(false);
  const [dipilih, setDipilih] = useState(null); // sparepart yang sedang diubah (null = tambah baru)
  const [akanDihapus, setAkanDihapus] = useState(null);
  const [menghapus, setMenghapus] = useState(false);

  // Ambil sparepart, kategori, dan supplier (dua yang terakhir untuk filter dan dropdown form)
  const ambilData = useCallback(async () => {
    try {
      const [sp, kt, sup] = await Promise.all([
        sparepartsApi.getAll(),
        categoriesApi.getAll(),
        suppliersApi.getAll(),
      ]);

      setSpareparts(sp.data);
      setKategori(kt.data);
      setSuppliers(sup.data);
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
      await sparepartsApi.update(dipilih.id, data);
    } else {
      await sparepartsApi.create(data);
    }

    tutupForm();
    await ambilData();
  }

  async function hapus() {
    setMenghapus(true);

    try {
      await sparepartsApi.remove(akanDihapus.id);
      setAkanDihapus(null);
      await ambilData();
    } catch (err) {
      // Misalnya sparepart yang sudah punya transaksi: "Data tidak bisa dihapus ..."
      setAkanDihapus(null);
      setError(err.message);
    } finally {
      setMenghapus(false);
    }
  }

  // Angka ringkasan dihitung di sini
  const totalStok = spareparts.reduce((jumlah, s) => jumlah + s.stock, 0);
  const perluPesan = spareparts.filter((s) => s.status !== "aman").length;

  // Pencarian (nama atau kode) dan dua filter dilakukan di sini (data sudah lengkap)
  const hasil = spareparts.filter((s) => {
    const cocokCari = `${s.name} ${s.kode}`
      .toLowerCase()
      .includes(cari.toLowerCase());
    const cocokKategori =
      filterKategori === "" || String(s.category_id) === filterKategori;
    const cocokStatus = filterStatus === "" || s.status === filterStatus;

    return cocokCari && cocokKategori && cocokStatus;
  });

  const kolom = [
    { judul: "Kode", render: (s) => s.kode },
    {
      judul: "Nama",
      render: (s) => <span className="font-medium">{s.name}</span>,
    },
    { judul: "Merek", render: (s) => s.brand || "-" },
    { judul: "Kategori", render: (s) => s.category_name ?? "-" },
    { judul: "Supplier", render: (s) => s.supplier_name ?? "-" },
    { judul: "Harga beli", render: (s) => formatRupiah(s.buy_price) },
    { judul: "Harga jual", render: (s) => formatRupiah(s.sell_price) },
    {
      judul: "Stok",
      render: (s) => `${s.stock} / min ${s.min_stock}`,
    },
    { judul: "Status", render: (s) => <StatusBadge status={s.status} /> },
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
          Kelola data sparepart, harga, dan stok
        </p>

        {adalahAdmin && (
          <button
            onClick={bukaTambah}
            className="rounded-md bg-brand px-4 py-2 text-sm font-bold text-navy hover:brightness-95"
          >
            + Tambah sparepart
          </button>
        )}
      </div>

      <Alert>{error}</Alert>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard angka={spareparts.length} label="Jenis sparepart" />
        <StatCard angka={totalStok} label="Total stok tersedia" />
        <StatCard angka={perluPesan} label="Perlu dipesan ulang" />
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex flex-wrap gap-3">
          <input
            type="text"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari nama atau kode..."
            className="w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/40"
          />

          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand"
          >
            <option value="">Semua kategori</option>
            {kategori.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand"
          >
            <option value="">Semua status</option>
            <option value="aman">Aman</option>
            <option value="hampir habis">Stok Minimum</option>
            <option value="habis">Stok Habis</option>
          </select>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Memuat data...</p>
        ) : (
          <DataTable
            key={`${cari}|${filterKategori}|${filterStatus}`}
            kolom={kolom}
            data={hasil}
            perHalaman={10}
            pesanKosong="Tidak ada sparepart yang cocok."
          />
        )}
      </section>

      {formTerbuka && (
        <Modal
          judul={dipilih ? "Ubah sparepart" : "Tambah sparepart"}
          lebar="max-w-2xl"
          onTutup={tutupForm}
        >
          <FormSparepart
            awal={dipilih}
            kategori={kategori}
            suppliers={suppliers}
            onSimpan={simpan}
            onBatal={tutupForm}
          />
        </Modal>
      )}

      {akanDihapus && (
        <ConfirmDialog
          judul="Hapus sparepart?"
          pesan="Sparepart yang dihapus tidak dapat dikembalikan. Sparepart yang sudah memiliki transaksi stok tidak dapat dihapus."
          loading={menghapus}
          onBatal={() => setAkanDihapus(null)}
          onKonfirmasi={hapus}
        />
      )}
    </div>
  );
}
