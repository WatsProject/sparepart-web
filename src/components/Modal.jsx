// Jendela pop-up di atas halaman, dipakai untuk form tambah/ubah.
// "lebar" opsional, contoh: "max-w-2xl" untuk form yang lebih lebar.
export default function Modal({
  judul,
  onTutup,
  lebar = "max-w-lg",
  children,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className={`max-h-[90vh] w-full overflow-y-auto rounded-xl bg-white p-6 shadow-xl ${lebar}`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">{judul}</h3>
          <button
            onClick={onTutup}
            aria-label="Tutup"
            className="text-2xl leading-none text-slate-400 hover:text-slate-600"
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
