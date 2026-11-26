// Membuat file CSV dari data lalu mengunduhnya.
// Pemisah memakai titik koma (;) supaya terbuka rapi di Excel berbahasa Indonesia.
export function unduhCsv(namaFile, judulKolom, baris) {
  // Setiap nilai dibungkus tanda kutip, tanda kutip di dalam nilai digandakan
  const bungkus = (nilai) => `"${String(nilai ?? "").replaceAll('"', '""')}"`;

  const isi = [judulKolom, ...baris]
    .map((b) => b.map(bungkus).join(";"))
    .join("\n");

  // "\uFEFF" membuat Excel membaca huruf dengan benar (UTF-8)
  const blob = new Blob(["\uFEFF" + isi], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const tautan = document.createElement("a");
  tautan.href = url;
  tautan.download = namaFile;
  tautan.click();

  URL.revokeObjectURL(url);
}
