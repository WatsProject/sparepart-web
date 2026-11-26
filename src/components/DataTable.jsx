import { useState } from "react";

// Tabel serba guna dengan nomor halaman.
// - kolom: daftar kolom, contoh { judul: "Nama", render: (baris, nomor) => baris.name }
// - data: seluruh data. Dipotong per halaman di sini, karena backend mengirim semuanya.
// Tips: beri prop key={kataPencarian} dari luar supaya halaman kembali ke 1 saat mencari.
export default function DataTable({
  kolom,
  data,
  perHalaman = 10,
  pesanKosong = "Belum ada data.",
}) {
  const [halaman, setHalaman] = useState(1);

  const jumlahHalaman = Math.max(1, Math.ceil(data.length / perHalaman));

  // Kalau data berkurang (misalnya setelah dihapus), halaman tidak boleh melewati batas
  const halamanAktif = Math.min(halaman, jumlahHalaman);
  const awal = (halamanAktif - 1) * perHalaman;
  const tampil = data.slice(awal, awal + perHalaman);

  // Tampilkan paling banyak 5 nomor halaman di sekitar halaman yang aktif
  const akhir = Math.min(jumlahHalaman, Math.max(1, halamanAktif - 2) + 4);
  const mulai = Math.max(1, akhir - 4);
  const nomorHalaman = [];
  for (let i = mulai; i <= akhir; i++) {
    nomorHalaman.push(i);
  }

  const gayaTombol = "h-8 min-w-8 rounded-md px-2 text-sm";

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
            {tampil.map((baris, i) => (
              <tr key={baris.id} className="border-t border-slate-100">
                {kolom.map((k) => (
                  <td key={k.judul} className="py-3 pr-4">
                    {k.render(baris, awal + i + 1)}
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

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
        <p>
          {data.length === 0
            ? "Tidak ada data"
            : `Menampilkan ${awal + 1}-${awal + tampil.length} dari ${data.length} data`}
        </p>

        {jumlahHalaman > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setHalaman(halamanAktif - 1)}
              disabled={halamanAktif === 1}
              className={`${gayaTombol} hover:bg-slate-100 disabled:opacity-40`}
            >
              ‹
            </button>

            {nomorHalaman.map((n) => (
              <button
                key={n}
                onClick={() => setHalaman(n)}
                className={`${gayaTombol} ${
                  n === halamanAktif
                    ? "bg-brand font-bold text-navy"
                    : "hover:bg-slate-100"
                }`}
              >
                {n}
              </button>
            ))}

            <button
              onClick={() => setHalaman(halamanAktif + 1)}
              disabled={halamanAktif === jumlahHalaman}
              className={`${gayaTombol} hover:bg-slate-100 disabled:opacity-40`}
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
