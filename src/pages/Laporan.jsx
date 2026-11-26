import { NAMA_APP, NAMA_BENGKEL } from "../config/app.js";
import { useEffect, useState } from "react";
import { sparepartsApi } from "../api/spareparts.js";
import { stockTransactionsApi } from "../api/stockTransactions.js";
import StatCard from "../components/StatCard.jsx";
import Alert from "../components/Alert.jsx";
import { StatusBadge } from "../components/Badge.jsx";
import { formatRupiah, formatTanggal } from "../utils/format.js";
import { unduhCsv } from "../utils/csv.js";

// Label status untuk file CSV (di layar dipakai StatusBadge)
const LABEL_STATUS = {
  aman: "Aman",
  "hampir habis": "Stok Minimum",
  habis: "Stok Habis",
};

// Tabel laporan: di layar hanya menampilkan beberapa baris pertama,
// tapi saat dicetak semua baris ikut tercetak.
function TabelLaporan({ kolom, data, batas = 5, pesanKosong }) {
  const [semua, setSemua] = useState(false);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              {kolom.map((k) => (
                <th key={k.judul} className="pb-2 pr-4 font-semibold">
                  {k.judul}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((baris, i) => (
              <tr
                key={baris.id}
                className={`border-t border-slate-100 ${
                  !semua && i >= batas ? "hidden print:table-row" : ""
                }`}
              >
                {kolom.map((k) => (
                  <td key={k.judul} className="py-3 pr-4">
                    {k.render(baris)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {data.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-500">
            {pesanKosong}
          </p>
        )}
      </div>

      {data.length > batas && (
        <button
          onClick={() => setSemua(!semua)}
          className="mt-3 text-sm font-medium text-slate-600 hover:text-navy print:hidden"
        >
          {semua
            ? "Tampilkan lebih sedikit"
            : `Lihat semua ${data.length} data`}
        </button>
      )}
    </div>
  );
}

// Satu bagian laporan: judul, tombol unduh, lalu isinya
function Bagian({ judul, catatan, onUnduh, children }) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold">{judul}</h3>
          {catatan && <p className="text-xs text-slate-500">{catatan}</p>}
        </div>
        <button
          onClick={onUnduh}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-white print:hidden"
        >
          Unduh CSV
        </button>
      </div>

      {children}
    </section>
  );
}

export default function Laporan() {
  const [spareparts, setSpareparts] = useState([]);
  const [transaksiMasuk, setTransaksiMasuk] = useState([]);
  const [transaksiKeluar, setTransaksiKeluar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dari, setDari] = useState("");
  const [sampai, setSampai] = useState("");

  // Ambil data sekali, saat halaman dibuka
  useEffect(() => {
    async function ambilData() {
      try {
        const [sp, masuk, keluar] = await Promise.all([
          sparepartsApi.getAll(),
          stockTransactionsApi.getByJenis("in"),
          stockTransactionsApi.getByJenis("out"),
        ]);

        setSpareparts(sp.data);
        setTransaksiMasuk(masuk.data);
        setTransaksiKeluar(keluar.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    ambilData();
  }, []);

  if (loading) {
    return <p className="text-slate-500">Memuat data...</p>;
  }

  // Sparepart dicari lewat id (untuk menampilkan satuan, misalnya "pcs")
  const petaSparepart = Object.fromEntries(spareparts.map((s) => [s.id, s]));
  const satuan = (t) => petaSparepart[t.sparepart_id]?.unit ?? "";

  // Urut dari tanggal terbaru, lalu saring sesuai rentang tanggal
  const dalamRentang = (daftar) =>
    [...daftar]
      .sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id)
      .filter((t) => {
        const tgl = formatTanggal(t.date);
        return (!dari || tgl >= dari) && (!sampai || tgl <= sampai);
      });

  const masuk = dalamRentang(transaksiMasuk);
  const keluar = dalamRentang(transaksiKeluar);

  // Laporan stok diurutkan berdasarkan nama
  const stok = [...spareparts].sort((a, b) => a.name.localeCompare(b.name));

  // Angka ringkasan dihitung di sini
  const totalStok = stok.reduce((n, s) => n + s.stock, 0);
  const nilaiStok = stok.reduce((n, s) => n + s.stock * Number(s.buy_price), 0);
  const perluPesan = stok.filter((s) => s.status !== "aman").length;
  const unitMasuk = masuk.reduce((n, t) => n + t.quantity, 0);
  const nilaiMasuk = masuk.reduce(
    (n, t) => n + t.quantity * Number(t.buy_price),
    0,
  );
  const unitKeluar = keluar.reduce((n, t) => n + t.quantity, 0);

  const kolomStok = [
    { judul: "Kode", render: (s) => s.kode },
    {
      judul: "Nama",
      render: (s) => <span className="font-medium">{s.name}</span>,
    },
    { judul: "Kategori", render: (s) => s.category_name ?? "-" },
    { judul: "Stok", render: (s) => s.stock },
    { judul: "Stok minimum", render: (s) => s.min_stock },
    { judul: "Harga beli", render: (s) => formatRupiah(s.buy_price) },
    {
      judul: "Nilai stok",
      render: (s) => formatRupiah(s.stock * Number(s.buy_price)),
    },
    { judul: "Status", render: (s) => <StatusBadge status={s.status} /> },
  ];

  const kolomMasuk = [
    { judul: "Tanggal", render: (t) => formatTanggal(t.date) },
    { judul: "Kode", render: (t) => t.sparepart_kode },
    {
      judul: "Sparepart",
      render: (t) => <span className="font-medium">{t.sparepart_name}</span>,
    },
    { judul: "Supplier", render: (t) => t.supplier_name ?? "-" },
    {
      judul: "Jumlah",
      render: (t) => (
        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
          {t.quantity} {satuan(t)}
        </span>
      ),
    },
    { judul: "Harga beli", render: (t) => formatRupiah(t.buy_price) },
    {
      judul: "Total",
      render: (t) => formatRupiah(t.quantity * Number(t.buy_price)),
    },
    { judul: "Dicatat oleh", render: (t) => t.user_name ?? "-" },
  ];

  const kolomKeluar = [
    { judul: "Tanggal", render: (t) => formatTanggal(t.date) },
    { judul: "Kode", render: (t) => t.sparepart_kode },
    {
      judul: "Sparepart",
      render: (t) => <span className="font-medium">{t.sparepart_name}</span>,
    },
    {
      judul: "Jumlah",
      render: (t) => (
        <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-600">
          {t.quantity} {satuan(t)}
        </span>
      ),
    },
    { judul: "Catatan", render: (t) => t.notes || "-" },
    { judul: "Dicatat oleh", render: (t) => t.user_name ?? "-" },
  ];

  // Unduh CSV: angka ditulis polos (bukan "Rp ...") supaya bisa dihitung di Excel
  function unduhStok() {
    unduhCsv(
      "laporan-stok-sparepart.csv",
      [
        "Kode",
        "Nama",
        "Kategori",
        "Stok",
        "Stok minimum",
        "Harga beli",
        "Nilai stok",
        "Status",
      ],
      stok.map((s) => [
        s.kode,
        s.name,
        s.category_name ?? "",
        s.stock,
        s.min_stock,
        Number(s.buy_price),
        s.stock * Number(s.buy_price),
        LABEL_STATUS[s.status],
      ]),
    );
  }

  function unduhMasuk() {
    unduhCsv(
      "laporan-barang-masuk.csv",
      [
        "Tanggal",
        "Kode",
        "Sparepart",
        "Supplier",
        "Jumlah",
        "Satuan",
        "Harga beli",
        "Total",
        "Dicatat oleh",
      ],
      masuk.map((t) => [
        formatTanggal(t.date),
        t.sparepart_kode,
        t.sparepart_name,
        t.supplier_name ?? "",
        t.quantity,
        satuan(t),
        Number(t.buy_price),
        t.quantity * Number(t.buy_price),
        t.user_name ?? "",
      ]),
    );
  }

  function unduhKeluar() {
    unduhCsv(
      "laporan-barang-keluar.csv",
      [
        "Tanggal",
        "Kode",
        "Sparepart",
        "Jumlah",
        "Satuan",
        "Catatan",
        "Dicatat oleh",
      ],
      keluar.map((t) => [
        formatTanggal(t.date),
        t.sparepart_kode,
        t.sparepart_name,
        t.quantity,
        satuan(t),
        t.notes ?? "",
        t.user_name ?? "",
      ]),
    );
  }

  return (
    <div>
      {/* Judul ini hanya muncul saat dicetak */}
      <div className="mb-4 hidden print:block">
        <h1 className="text-2xl font-bold">{NAMA_BENGKEL}</h1>
        <p className="text-lg font-semibold">Laporan {NAMA_APP}</p>
        <p className="text-sm">
          Dicetak: {new Date().toLocaleDateString("sv-SE")} | Periode transaksi:{" "}
          {dari || "awal"} s/d {sampai || "sekarang"}
        </p>
      </div>

      <p className="mb-6 text-sm text-slate-500 print:hidden">
        Ringkasan stok dan transaksi
      </p>

      <Alert>{error}</Alert>

      {/* Toolbar: filter tanggal dan tombol cetak (tidak ikut tercetak) */}
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 print:hidden">
        <div className="flex flex-wrap items-end gap-3">
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
          <p className="pb-2 text-xs text-slate-500">
            Berlaku untuk barang masuk dan barang keluar
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="rounded-md bg-brand px-4 py-2 text-sm font-bold text-navy hover:brightness-95"
        >
          Cetak laporan
        </button>
      </div>

      {/* Bagian 1: stok sparepart (kondisi saat ini, tidak terpengaruh filter tanggal) */}
      <Bagian
        judul="Stok sparepart"
        catatan="Kondisi per hari ini"
        onUnduh={unduhStok}
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard angka={stok.length} label="Jenis sparepart" />
          <StatCard angka={totalStok} label="Total stok" />
          <StatCard angka={formatRupiah(nilaiStok)} label="Total nilai stok" />
          <StatCard angka={perluPesan} label="Perlu dipesan ulang" />
        </div>
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
          <TabelLaporan
            kolom={kolomStok}
            data={stok}
            pesanKosong="Belum ada sparepart."
          />
        </div>
      </Bagian>

      {/* Bagian 2: barang masuk */}
      <Bagian judul="Barang masuk" onUnduh={unduhMasuk}>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard angka={masuk.length} label="Total transaksi" />
          <StatCard angka={unitMasuk} label="Total unit masuk" />
          <StatCard
            angka={formatRupiah(nilaiMasuk)}
            label="Total nilai pembelian"
          />
        </div>
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
          <TabelLaporan
            kolom={kolomMasuk}
            data={masuk}
            batas={3}
            pesanKosong="Tidak ada transaksi barang masuk pada periode ini."
          />
        </div>
      </Bagian>

      {/* Bagian 3: barang keluar */}
      <Bagian judul="Barang keluar" onUnduh={unduhKeluar}>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard angka={keluar.length} label="Total transaksi" />
          <StatCard angka={unitKeluar} label="Total unit keluar" />
        </div>
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
          <TabelLaporan
            kolom={kolomKeluar}
            data={keluar}
            batas={3}
            pesanKosong="Tidak ada transaksi barang keluar pada periode ini."
          />
        </div>
      </Bagian>
    </div>
  );
}
