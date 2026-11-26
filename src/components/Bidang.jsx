// Satu bidang form: label, isian, dan teks bantuan kecil di bawahnya
export default function Bidang({ label, wajib, bantuan, children }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">
        {label} {wajib && <span className="text-red-600">*</span>}
      </label>
      {children}
      {bantuan && <p className="mt-1 text-xs text-slate-500">{bantuan}</p>}
    </div>
  );
}
