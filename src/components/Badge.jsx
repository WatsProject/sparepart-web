// Nilai status dari backend: "aman", "hampir habis", "habis".
// Di sini dipetakan ke label dan warna yang tampil di layar.
const STATUS = {
  aman: { label: "Aman", warna: "bg-green-100 text-green-700" },
  "hampir habis": {
    label: "Stok Minimum",
    warna: "bg-yellow-100 text-yellow-700",
  },
  habis: { label: "Stok Habis", warna: "bg-red-100 text-red-600" },
};

export function StatusBadge({ status }) {
  const { label, warna } = STATUS[status] ?? STATUS.aman;

  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${warna}`}
    >
      {label}
    </span>
  );
}

// Jenis transaksi dari backend: "in" (masuk) atau "out" (keluar)
export function JenisBadge({ type }) {
  const masuk = type === "in";

  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        masuk ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-600"
      }`}
    >
      {masuk ? "Masuk" : "Keluar"}
    </span>
  );
}
