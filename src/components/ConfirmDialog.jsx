import Modal from "./Modal.jsx";

// Dialog konfirmasi, dipakai sebelum menghapus data.
export default function ConfirmDialog({
  judul,
  pesan,
  loading,
  onBatal,
  onKonfirmasi,
}) {
  return (
    <Modal judul={judul} onTutup={onBatal}>
      <p className="text-sm text-slate-600">{pesan}</p>

      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={onBatal}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
        >
          Batal
        </button>
        <button
          onClick={onKonfirmasi}
          disabled={loading}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
        >
          {loading ? "Menghapus..." : "Hapus"}
        </button>
      </div>
    </Modal>
  );
}
