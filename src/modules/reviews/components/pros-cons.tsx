import { CircleCheck, CircleMinus } from "lucide-react";

export function ProsCons({ pros, cons, title }: { pros: string[]; cons: string[]; title?: string }) {
  return (
    <div className="space-y-3">
      {title && <h3 className="font-heading text-base font-medium">{title}</h3>}
      <div className="grid gap-4 sm:grid-cols-2">
        <section aria-label="Pros" className="rounded-lg border bg-card p-4">
          <h4 className="mb-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">Pros</h4>
          <ul className="space-y-2 text-sm">
            {pros.map((p) => (
              <li key={p} className="flex gap-2">
                <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
                {p}
              </li>
            ))}
          </ul>
        </section>
        <section aria-label="Cons" className="rounded-lg border bg-card p-4">
          <h4 className="mb-2 text-sm font-semibold text-rose-700 dark:text-rose-400">Cons</h4>
          <ul className="space-y-2 text-sm">
            {cons.map((c) => (
              <li key={c} className="flex gap-2">
                <CircleMinus className="mt-0.5 size-4 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden />
                {c}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
