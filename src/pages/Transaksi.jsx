import { useCallback, useEffect, useState } from "react";
import { stockTransactionsApi } from "../api/stockTransactions.js";
import { sparepartsApi } from "../api/spareparts.js";
import { suppliersApi } from "../api/suppliers.js";
import StatCard from "../components/StatCard.jsx";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import Alert from "../components/Alert.jsx";
import Bidang from "../components/Bidang.jsx";
import { gayaInput } from "../utils/gaya.js";
import { formatRupiah, formatTanggal } from "../utils/format.js";

// Form catat/ubah transaksi. "awal" berisi data lama saat mengubah (kosong saat mencatat baru).
// jenis "in" = barang masuk (ada supplier dan harga beli), "out" = barang keluar.
function FormTransaksi({
  jenis,
  awal,
  spareparts,
  suppliers,
  onSimpan,
  onBatal,
}) {
  const masuk = jenis === "in";
  const mengubah = Boolean(awal);

  // Semua isian disimpan dalam satu objek; tanggal bawaan adalah hari ini
  const [isi, setIsi] = useState({
    date: awal
      ? formatTanggal(awal.date)
      : new Date().toLocaleDateString("sv-SE"),
    sparepartId: awal?.sparepart_id ?? "",
    supplierId: awal?.supplier_id ?? "",
    quantity: awal ? String(awal.quantity) : "",
    buyPrice: awal ? String(Number(awal.buy_price)) : "",
    notes: awal?.notes ?? "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Dipakai semua input: nilai disimpan sesuai atribut name pada input-nya
  function ubahIsi(e) {
    setIsi({ ...isi, [e.target.name]: e.target.value });
  }

  // Sparepart yang sedang dipilih (untuk menampilkan info stok)
  const terpilih = spareparts.find(
    (s) => String(s.id) === String(isi.sparepartId),
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Isian form berupa teks; backend butuh angka. Supplier dan harga beli hanya untuk barang masuk.
    const data = {
      date: isi.date,
      type: jenis,
      sparepartId: isi.sparepartId === "" ? null : Number(isi.sparepartId),
      supplierId:
        masuk && isi.supplierId !== "" ? Number(isi.supplierId) : null,
      quantity: Number(isi.quantity || 0),
      buyPrice: masuk ? Number(isi.buyPrice || 0) : 0,
      notes: isi.notes,
    };

    try {
      await onSimpan(data);
    } catch (err) {
      // Pesan dari backend, misalnya "Supplier harus dipilih untuk barang masuk"
      // atau "Stok Busi Motor tidak mencukupi. Stok tersedia: 0"
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert>{error}</Alert>

      <div className="grid gap-4 sm:grid-cols-2">
        <Bidang label="Tanggal" wajib>
          <input
            type="date"
            name="date"
            value={isi.date}
            onChange={ubahIsi}
            className={gayaInput}
          />
        </Bidang>

        {masuk && (
          <Bidang label="Supplier" wajib>
            <select
              name="supplierId"
              value={isi.supplierId}
              onChange={ubahIsi}
              className={gayaInput}
            >
              <option value="">Pilih supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Bidang>
        )}

        <Bidang label="Sparepart" wajib>
          <select
            name="sparepartId"
            value={isi.sparepartId}
            onChange={ubahIsi}
            className={gayaInput}
          >
            <option value="">Pilih sparepart</option>
            {spareparts.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} (stok {s.stock})
              </option>
            ))}
          </select>
        </Bidang>

        <Bidang
          label="Jumlah"
          wajib
          bantuan={
            !masuk && terpilih
              ? `Stok tersedia: ${terpilih.stock} ${terpilih.unit}`
              : undefined
          }
        >
          <input
            type="number"
            min="1"
            name="quantity"
            value={isi.quantity}
            onChange={ubahIsi}
            placeholder="0"
            className={gayaInput}
          />
        </Bidang>

        {masuk && (
          <Bidang label="Harga beli">
            <div className="flex">
              <span className="flex items-center rounded-l-md border border-r-0 border-slate-300 bg-slate-50 px-3 text-sm text-slate-500">
                Rp
              </span>
              <input
                type="number"
                min="0"
                name="buyPrice"
                value={isi.buyPrice}
                onChange={ubahIsi}
                placeholder="0"
                className={`${gayaInput} rounded-l-none`}
              />
            </div>
          </Bidang>
        )}
      </div>

      <Bidang label="Catatan">
        <textarea
          rows={3}
          name="notes"
          value={isi.notes}
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

export default function Transaksi({ jenis }) {
  const masuk = jenis === "in";
  const nama = masuk ? "barang masuk" : "barang keluar";

  const [transaksi, setTransaksi] = useState([]);
  const [spareparts, setSpareparts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cari, setCari] = useState("");
  const [dari, setDari] = useState("");
  const [sampai, setSampai] = useState("");

  const [formTerbuka, setFormTerbuka] = useState(false);
  const [dipilih, setDipilih] = useState(null); // transaksi yang sedang diubah (null = catat baru)
  const [akanDihapus, setAkanDihapus] = useState(null);
  const [menghapus, setMenghapus] = useState(false);

  // Ambil transaksi (sesuai jenis), sparepart, dan supplier (dua yang terakhir untuk dropdown form)
  const ambilData = useCallback(async () => {
    try {
      const [tr, sp, sup] = await Promise.all([
        stockTransactionsApi.getByJenis(jenis),
        sparepartsApi.getAll(),
        suppliersApi.getAll(),
      ]);

      setTransaksi(tr.data);
      setSpareparts(sp.data);
      setSuppliers(sup.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [jenis]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    ambilData();
  }, [ambilData]);

  function bukaTambah() {
    setDipilih(null);
    setFormTerbuka(true);
  }

  function bukaUbah(t) {
    setDipilih(t);
    setFormTerbuka(true);
  }

  function tutupForm() {
    setFormTerbuka(false);
    setDipilih(null);
  }

  // Dipanggil form saat tombol Simpan ditekan. Kalau gagal, error dilempar ke form.
  async function simpan(data) {
    if (dipilih) {
      await stockTransactionsApi.update(dipilih.id, data);
    } else {
      await stockTransactionsApi.create(data);
    }

    tutupForm();
    await ambilData(); // stok sparepart ikut berubah di backend, jadi ambil ulang
  }

  async function hapus() {
    setMenghapus(true);

    try {
      await stockTransactionsApi.remove(akanDihapus.id);
      setAkanDihapus(null);
      await ambilData();
    } catch (err) {
      // Misalnya penghapusan membuat stok menjadi minus
      setAkanDihapus(null);
      setError(err.message);
    } finally {
      setMenghapus(false);
    }
  }

  // Sparepart dicari lewat id (untuk menampilkan satuan, misalnya "pcs")
  const petaSparepart = Object.fromEntries(spareparts.map((s) => [s.id, s]));

  // Urutkan dari tanggal terbaru, lalu saring berdasarkan rentang tanggal
  const urut = [...transaksi].sort(
    (a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id,
  );
  const dalamRentang = urut.filter((t) => {
    const tgl = formatTanggal(t.date);
    return (!dari || tgl >= dari) && (!sampai || tgl <= sampai);
  });

  // Pencarian (nama atau kode sparepart) dilakukan setelah filter tanggal
  const hasil = dalamRentang.filter((t) =>
    `${t.sparepart_name} ${t.sparepart_kode}`
      .toLowerCase()
      .includes(cari.toLowerCase()),
  );

  // Angka ringkasan mengikuti filter tanggal
  const totalUnit = dalamRentang.reduce((n, t) => n + t.quantity, 0);
  const totalNilai = dalamRentang.reduce(
    (n, t) => n + t.quantity * Number(t.buy_price),
    0,
  );

  const kolom = [
    { judul: "Tanggal", render: (t) => formatTanggal(t.date) },
    { judul: "Kode", render: (t) => t.sparepart_kode },
    {
      judul: "Sparepart",
      render: (t) => <span className="font-medium">{t.sparepart_name}</span>,
    },
  ];

  if (masuk) {
    kolom.push({ judul: "Supplier", render: (t) => t.supplier_name ?? "-" });
  }

  kolom.push({
    judul: "Jumlah",
    render: (t) => (
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          masuk
            ? "bg-green-100 text-green-700"
            : "bg-orange-100 text-orange-600"
        }`}
      >
        {t.quantity} {petaSparepart[t.sparepart_id]?.unit ?? ""}
      </span>
    ),
  });

  if (masuk) {
    kolom.push({
      judul: "Harga beli",
      render: (t) => formatRupiah(t.buy_price),
    });
  }

  kolom.push(
    { judul: "Catatan", render: (t) => t.notes || "-" },
    { judul: "Dicatat oleh", render: (t) => t.user_name ?? "-" },
    {
      judul: "Aksi",
      render: (t) => (
        <div className="flex gap-3 text-sm font-medium">
          <button
            onClick={() => bukaUbah(t)}
            className="text-slate-600 hover:text-navy"
          >
            Ubah
          </button>
          <button
            onClick={() => setAkanDihapus(t)}
            className="text-red-600 hover:text-red-700"
          >
            Hapus
          </button>
        </div>
      ),
    },
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          {masuk
            ? "Catatan penerimaan barang dari supplier"
            : "Catatan pengeluaran barang"}
        </p>

        <button
          onClick={bukaTambah}
          className="rounded-md bg-brand px-4 py-2 text-sm font-bold text-navy hover:brightness-95"
        >
          + Catat {nama}
        </button>
      </div>

      <Alert>{error}</Alert>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          angka={dalamRentang.length}
          label={`Total transaksi ${masuk ? "masuk" : "keluar"}`}
        />
        <StatCard
          angka={totalUnit}
          label={`Total unit ${masuk ? "masuk" : "keluar"}`}
        />
        {masuk && (
          <StatCard
            angka={formatRupiah(totalNilai)}
            label="Total nilai pembelian"
          />
        )}
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <input
            type="text"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari nama atau kode sparepart..."
            className="w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/40"
          />

          <div>
            <label className="mb-1 block text-xs text-slate-500">
              Dari tanggal
            </label>
            <input
              type="date"
              value={dari}
              onChange={(e) => setDari(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-500">
              Sampai tanggal
            </label>
            <input
              type="date"
              value={sampai}
              onChange={(e) => setSampai(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Memuat data...</p>
        ) : (
          <DataTable
            key={`${cari}|${dari}|${sampai}`}
            kolom={kolom}
            data={hasil}
            perHalaman={10}
            pesanKosong={`Belum ada transaksi ${nama}.`}
          />
        )}
      </section>

      {formTerbuka && (
        <Modal
          judul={dipilih ? `Ubah ${nama}` : `Catat ${nama}`}
          lebar="max-w-2xl"
          onTutup={tutupForm}
        >
          <FormTransaksi
            jenis={jenis}
            awal={dipilih}
            spareparts={spareparts}
            suppliers={suppliers}
            onSimpan={simpan}
            onBatal={tutupForm}
          />
        </Modal>
      )}

      {akanDihapus && (
        <ConfirmDialog
          judul="Hapus transaksi?"
          pesan={
            masuk
              ? "Menghapus transaksi ini akan mengurangi stok sparepart."
              : "Menghapus transaksi ini akan mengembalikan stok sparepart."
          }
          loading={menghapus}
          onBatal={() => setAkanDihapus(null)}
          onKonfirmasi={hapus}
        />
      )}
    </div>
  );
}
