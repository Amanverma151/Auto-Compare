"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface PerformanceDatum {
  name: string;
  powerHp: number;
  torque: number;
}

/** Side-by-side horsepower and torque bars. Torque is pre-converted to the display unit. */
export function PerformanceChart({ data, torqueUnit }: { data: PerformanceDatum[]; torqueUnit: string }) {
  return (
    <figure className="w-full">
      <div className="h-72 w-full" role="img" aria-label={`Horsepower and torque (${torqueUnit}) for ${data.map((d) => d.name).join(", ")}`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} interval={0} />
            <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} width={40} />
            <Tooltip
              cursor={{ fill: "var(--muted)" }}
              contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--popover-foreground)" }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="powerHp" name="Horsepower (hp)" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="torque" name={`Torque (${torqueUnit})`} fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="sr-only">
        {data.map((d) => `${d.name}: ${d.powerHp} hp, ${d.torque} ${torqueUnit}`).join("; ")}
      </figcaption>
    </figure>
  );
}
