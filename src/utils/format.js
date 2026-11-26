// Mengubah angka atau string "15000.00" menjadi "Rp 15.000"
export function formatRupiah(nilai) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(nilai));
}

// Mengubah tanggal dari backend menjadi "2026-11-02".
// Dibaca dengan zona waktu lokal supaya tanggalnya tidak bergeser sehari.
export function formatTanggal(tanggal) {
  return new Date(tanggal).toLocaleDateString("sv-SE");
}
