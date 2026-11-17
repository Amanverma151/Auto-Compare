"use client";

import { useId, useState, useTransition } from "react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { formatNumber, formatPrice, units } from "@/lib/format";
import { calculateTco, TcoChart, type TcoVehicle } from "@/modules/ownership-cost";
import { CarSearch } from "@/modules/search";

export interface CalculatorVehicle extends TcoVehicle {
  slug: string;
  title: string;
  shortTitle: string;
}

const MAX = 4;

/** Interactive TCO calculator. Selected cars live in the URL (`?ids=`), inputs are local. */
export function TcoCalculator({ vehicles }: { vehicles: CalculatorVehicle[] }) {
  const ids = useId();
  const [pending, startTransition] = useTransition();
  const [, setSlugs] = useQueryState(
    "ids",
    parseAsArrayOf(parseAsString, ",").withDefault([]).withOptions({ shallow: false, startTransition }),
  );
  const [years, setYears] = useState(5);
  const [distance, setDistance] = useState(12_000);
  const [fuelPrice, setFuelPrice] = useState(3.5);
  const [electricityPrice, setElectricityPrice] = useState(0.16);

  const inputs = {
    years,
    distancePerYearKm: units.toKm(distance),
    fuelPricePerLiter: units.toPricePerLiter(fuelPrice),
    electricityPricePerKwh: electricityPrice,
  };

  const rows = vehicles.map((v) => ({ v, tco: calculateTco(v, inputs) }));
  const chartData = rows.flatMap(({ v, tco }) => (tco ? [{ name: v.shortTitle, ...tco }] : []));
  const cheapest = Math.min(...rows.map((r) => r.tco?.total ?? Infinity));
  const current = vehicles.map((v) => v.slug);

  const numberInput = (value: number, set: (n: number) => void, min: number, max: number) => ({
    type: "number" as const,
    inputMode: "decimal" as const,
    step: "0.01",
    min,
    max,
    value: Number.isFinite(value) ? value : "",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const n = Number(e.target.value);
      if (Number.isFinite(n)) set(Math.min(max, Math.max(min, n)));
    },
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <section aria-labelledby={`${ids}-inputs`} className="space-y-6 rounded-2xl border bg-card p-5">
        <h2 id={`${ids}-inputs`} className="text-sm font-semibold">
          Your driving
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <Label htmlFor={`${ids}-years`}>Ownership period</Label>
            <span className="font-medium">{years} years</span>
          </div>
          <Slider id={`${ids}-years`} min={1} max={10} step={1} value={[years]} onValueChange={([v]) => setYears(v ?? 5)} aria-label="Ownership period in years" />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <Label htmlFor={`${ids}-distance`}>Distance per year</Label>
            <span className="font-medium">
              {formatNumber(distance)} {units.distanceLabel()}
            </span>
          </div>
          <Slider
            id={`${ids}-distance`}
            min={3_000}
            max={30_000}
            step={500}
            value={[distance]}
            onValueChange={([v]) => setDistance(v ?? 12_000)}
            aria-label={`Distance per year in ${units.distanceLabel()}`}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor={`${ids}-fuel`} className="text-xs">
              Fuel price ({units.fuelPriceLabel()})
            </Label>
            <Input id={`${ids}-fuel`} {...numberInput(fuelPrice, setFuelPrice, 0, 20)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${ids}-elec`} className="text-xs">
              Electricity ($/kWh)
            </Label>
            <Input id={`${ids}-elec`} {...numberInput(electricityPrice, setElectricityPrice, 0, 2)} />
          </div>
        </div>

        <div className="space-y-2 border-t pt-5">
          <h3 className="text-sm font-semibold">Cars ({vehicles.length}/{MAX})</h3>
          <ul className="space-y-1.5">
            {vehicles.map((v) => (
              <li key={v.slug} className="flex items-center justify-between gap-2 rounded-lg bg-muted/60 px-3 py-1.5 text-sm">
                <span className="truncate">{v.title}</span>
                <button
                  type="button"
                  className="rounded-full p-1 text-muted-foreground hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  aria-label={`Remove ${v.title}`}
                  onClick={() => setSlugs(current.filter((s) => s !== v.slug))}
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
          {vehicles.length < MAX && (
            <CarSearch
              placeholder="Add a car…"
              excludeSlugs={current}
              onSelect={(r) => setSlugs([...current, r.variantSlug].slice(0, MAX))}
            />
          )}
          {pending && (
            <p className="flex items-center gap-2 text-xs text-muted-foreground" role="status">
              <Loader2 className="size-3.5 animate-spin" aria-hidden /> Updating…
            </p>
          )}
        </div>
      </section>

      <section aria-label="Results" className="space-y-6">
        {chartData.length > 0 ? (
          <div className="rounded-2xl border bg-card p-5">
            <h2 className="mb-1 text-sm font-semibold">Estimated {years}-year cost of ownership</h2>
            <p className="mb-4 text-xs text-muted-foreground">Depreciation, fuel or charging, scheduled maintenance and insurance.</p>
            <TcoChart data={chartData} />
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">Add a car to see its cost of ownership.</p>
        )}

        {rows.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border bg-card">
            <table className="w-full text-sm">
              <caption className="sr-only">Cost of ownership breakdown</caption>
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th scope="col" className="px-4 py-3 font-medium">Car</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Depreciation</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Fuel / energy</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Maintenance</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Insurance</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Total</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Per year</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ v, tco }) => (
                  <tr key={v.slug} className="border-b last:border-0">
                    <th scope="row" className="px-4 py-3 text-left font-medium">{v.title}</th>
                    {tco ? (
                      <>
                        <td className="px-4 py-3 text-right tabular-nums">{formatPrice(tco.depreciation)}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{formatPrice(tco.energy)}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{formatPrice(tco.maintenance)}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{formatPrice(tco.insurance)}</td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums">
                          {formatPrice(tco.total)}
                          {tco.total === cheapest && rows.length > 1 && (
                            <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Lowest
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">{formatPrice(tco.perYear)}</td>
                      </>
                    ) : (
                      <td colSpan={6} className="px-4 py-3 text-right text-muted-foreground">Not enough data</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
