// Kotak merah untuk pesan error. Tidak tampil kalau tidak ada pesan.
export default function Alert({ children }) {
  if (!children) {
    return null;
  }

  return (
    <div className="mb-4 rounded-md bg-red-100 px-3 py-2 text-sm text-red-600">
      {children}
    </div>
  );
}
