export default function StatCard({
  title,
  value,
  hint,
  tone = "teal",
}: {
  title: string;
  value: any;
  hint?: string;
  tone?: "teal" | "cyan" | "amber" | "rose";
}) {
  const toneClass = {
    teal: "bg-teal-500",
    cyan: "bg-cyan-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
  }[tone];

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase text-slate-500 dark:text-gray-300">
          {title}
        </div>
        <div className="break-words text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
          {value}
        </div>
        {hint && <div className="text-xs text-slate-500">{hint}</div>}
      </div>
      <div className={`mt-1 h-10 w-2 rounded-full ${toneClass}`} />
    </div>
  );
}
