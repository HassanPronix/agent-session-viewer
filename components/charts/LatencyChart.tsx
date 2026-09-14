"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatLatency } from "@/lib/format";

export interface LatencyDatum {
  label: string;
  latency: number;
  fullLabel?: string;
}

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as LatencyDatum;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <div className="font-mono text-foreground">{d.fullLabel ?? d.label}</div>
      <div className="mt-1 text-muted-foreground">
        latency: <span className="text-signal-amber">{formatLatency(d.latency)}</span>
      </div>
    </div>
  );
}

export function LatencyChart({ data }: { data: LatencyDatum[] }) {
  if (!data.length) return null;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: "hsl(var(--border))" }}
        />
        <YAxis
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={40}
          tickFormatter={(v) => `${v}s`}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--accent))" }} />
        <Bar dataKey="latency" fill="hsl(var(--signal-amber))" radius={[3, 3, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}
