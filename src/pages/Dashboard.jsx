import { useEffect, useState } from "react";
import { sparepartsApi } from "../api/spareparts.js";
import { stockTransactionsApi } from "../api/stockTransactions.js";
import StatCard from "../components/StatCard.jsx";
import { StatusBadge, JenisBadge } from "../components/Badge.jsx";
import { formatTanggal } from "../utils/format.js";

export default function Dashboard() {
  const [spareparts, setSpareparts] = useState([]);
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Ambil data sparepart dan transaksi sekali, saat halaman dibuka
  useEffect(() => {
    async function ambilData() {
      try {
        const [sp, tr] = await Promise.all([
          sparepartsApi.getAll(),
          stockTransactionsApi.getAll(),
        ]);

        setSpareparts(sp.data);
        setTransaksi(tr.data);
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

  if (error) {
    return (
      <div className="rounded-md bg-red-100 px-4 py-3 text-sm text-red-600">
        {error}
      </div>
    );
  }

  // Semua angka di dashboard dihitung di sini dari data yang diambil
  const totalStok = spareparts.reduce((jumlah, s) => jumlah + s.stock, 0);
  const jumlahMasuk = transaksi.filter((t) => t.type === "in").length;
  const jumlahKeluar = transaksi.filter((t) => t.type === "out").length;

  // Sparepart yang stoknya menipis atau habis
  const perluPesan = spareparts.filter((s) => s.status !== "aman");

  // 5 transaksi terbaru: urut dari tanggal terbaru
  const terbaru = [...transaksi]
    .sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id)
    .slice(0, 5);

  return (
    <div>
      <p className="mb-6 text-sm text-slate-500">
        Ringkasan stok dan transaksi terbaru
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard angka={spareparts.length} label="Jenis sparepart" />
        <StatCard angka={totalStok} label="Total stok tersedia" />
        <StatCard angka={jumlahMasuk} label="Transaksi masuk" />
        <StatCard angka={jumlahKeluar} label="Transaksi keluar" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Tabel 1: sparepart yang perlu dipesan ulang */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <h3 className="px-5 pt-5 text-lg font-bold">
            Perlu dipesan ulang ({perluPesan.length})
          </h3>

          <div className="overflow-x-auto p-5">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="pb-2 font-semibold">Sparepart</th>
                  <th className="pb-2 font-semibold">Stok</th>
                  <th className="pb-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {perluPesan.map((s) => (
                  <tr key={s.id} className="border-t border-slate-100">
                    <td className="py-3">{s.name}</td>
                    <td className="py-3">
                      {s.stock} / min {s.min_stock}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={s.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {perluPesan.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-500">
                Semua stok aman.
              </p>
            )}
          </div>
        </section>

        {/* Tabel 2: transaksi terbaru */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <h3 className="px-5 pt-5 text-lg font-bold">Transaksi terbaru</h3>

          <div className="overflow-x-auto p-5">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="pb-2 font-semibold">Tanggal</th>
                  <th className="pb-2 font-semibold">Sparepart</th>
                  <th className="pb-2 font-semibold">Jenis</th>
                  <th className="pb-2 font-semibold">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {terbaru.map((t) => (
                  <tr key={t.id} className="border-t border-slate-100">
                    <td className="py-3">{formatTanggal(t.date)}</td>
                    <td className="py-3">{t.sparepart_name}</td>
                    <td className="py-3">
                      <JenisBadge type={t.type} />
                    </td>
                    <td className="py-3">{t.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {terbaru.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-500">
                Belum ada transaksi.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
