"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNumber } from "@/lib/format";

export interface TokenDatum {
  label: string;
  fullLabel?: string;
  input: number;
  output: number;
}

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as TokenDatum;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <div className="font-mono text-foreground">{d.fullLabel ?? d.label}</div>
      <div className="mt-1 space-y-0.5 text-muted-foreground">
        <div>
          input: <span className="text-signal-teal">{formatNumber(d.input)}</span>
        </div>
        <div>
          output: <span className="text-signal-violet">{formatNumber(d.output)}</span>
        </div>
        <div>
          total:{" "}
          <span className="text-foreground">{formatNumber(d.input + d.output)}</span>
        </div>
      </div>
    </div>
  );
}

export function TokenUsageChart({ data }: { data: TokenDatum[] }) {
  if (!data.length) return null;
  return (
    <ResponsiveContainer width="100%" height={240}>
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
          width={44}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--accent))" }} />
        <Legend
          wrapperStyle={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}
          iconType="circle"
          iconSize={8}
        />
        <Bar
          dataKey="input"
          stackId="tokens"
          name="Input tokens"
          fill="hsl(var(--signal-teal))"
          radius={[0, 0, 0, 0]}
          maxBarSize={36}
        />
        <Bar
          dataKey="output"
          stackId="tokens"
          name="Output tokens"
          fill="hsl(var(--signal-violet))"
          radius={[3, 3, 0, 0]}
          maxBarSize={36}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
