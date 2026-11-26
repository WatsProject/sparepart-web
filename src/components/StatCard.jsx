export default function StatCard({ angka, label }) {
  return (
    <div className="rounded-xl border border-slate-200 border-l-4 border-l-brand bg-white p-5">
      <p className="text-3xl font-bold">{angka}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}
