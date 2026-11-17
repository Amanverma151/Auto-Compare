"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatPrice } from "@/lib/format";
import type { TcoBreakdown } from "../utils";

export interface TcoChartDatum extends Pick<TcoBreakdown, "depreciation" | "energy" | "maintenance" | "insurance" | "total"> {
  name: string;
}

const SERIES = [
  { key: "depreciation", label: "Depreciation", color: "var(--chart-1)" },
  { key: "energy", label: "Fuel / energy", color: "var(--chart-2)" },
  { key: "maintenance", label: "Maintenance", color: "var(--chart-3)" },
  { key: "insurance", label: "Insurance", color: "var(--chart-4)" },
] as const;

const compact = (v: number) => new Intl.NumberFormat("en-US", { notation: "compact", style: "currency", currency: "USD" }).format(v);

export function TcoChart({ data }: { data: TcoChartDatum[] }) {
  return (
    <figure className="w-full">
      <div className="h-80 w-full" role="img" aria-label="Stacked cost of ownership breakdown per vehicle">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} interval={0} />
            <YAxis tickFormatter={compact} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} width={56} />
            <Tooltip
              formatter={(value) => formatPrice(Number(value))}
              cursor={{ fill: "var(--muted)" }}
              contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--popover-foreground)" }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {SERIES.map((s, i) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.label}
                stackId="tco"
                fill={s.color}
                radius={i === SERIES.length - 1 ? [4, 4, 0, 0] : 0}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="sr-only">
        {data.map((d) => `${d.name}: total ${formatPrice(d.total)}`).join("; ")}
      </figcaption>
    </figure>
  );
}
