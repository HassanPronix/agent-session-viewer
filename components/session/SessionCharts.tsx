"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LatencyChart, type LatencyDatum } from "@/components/charts/LatencyChart";
import { TokenUsageChart, type TokenDatum } from "@/components/charts/TokenUsageChart";
import type { Session } from "@/lib/types";
import { shortId } from "@/lib/format";

export function SessionCharts({ session }: { session: Session }) {
  const traceLatency: LatencyDatum[] = React.useMemo(
    () =>
      session.traces.map((t, i) => ({
        label: `T${i + 1}`,
        fullLabel: t.trace_id,
        latency: t.latency ?? 0,
      })),
    [session]
  );

  const tokenData: TokenDatum[] = React.useMemo(() => {
    const rows: TokenDatum[] = [];
    session.traces.forEach((t, ti) => {
      (t.observations ?? []).forEach((o, oi) => {
        if (!o.token_usage || o.token_usage.total === 0) return;
        rows.push({
          label: `T${ti + 1}.${oi + 1}`,
          fullLabel: `${o.name} (${shortId(o.observation_id)})`,
          input: o.token_usage.input ?? 0,
          output: o.token_usage.output ?? 0,
        });
      });
    });
    return rows;
  }, [session]);

  const hasLatency = traceLatency.some((d) => d.latency > 0);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Trace latency</CardTitle>
          <CardDescription>Wall-clock time per trace in this session</CardDescription>
        </CardHeader>
        <CardContent>
          {hasLatency ? (
            <LatencyChart data={traceLatency} />
          ) : (
            <p className="py-10 text-center text-xs italic text-muted-foreground">
              No latency data on any trace.
            </p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Token usage</CardTitle>
          <CardDescription>Input / output tokens per generation observation</CardDescription>
        </CardHeader>
        <CardContent>
          {tokenData.length > 0 ? (
            <TokenUsageChart data={tokenData} />
          ) : (
            <p className="py-10 text-center text-xs italic text-muted-foreground">
              No observations with recorded token usage.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
