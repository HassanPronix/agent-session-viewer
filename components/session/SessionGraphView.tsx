"use client";

import * as React from "react";
import { Waypoints } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ObservationGraph } from "@/components/graph/ObservationGraph";
import type { Session } from "@/lib/types";
import { formatLatency, shortId } from "@/lib/format";

export function SessionGraphView({ session }: { session: Session }) {
  const tracesWithObs = React.useMemo(
    () => session.traces.filter((t) => (t.observations ?? []).length > 0),
    [session]
  );

  const [activeId, setActiveId] = React.useState<string | undefined>(
    tracesWithObs[0]?.trace_id
  );

  // Keep the selected trace valid if the session (and therefore the trace
  // list) changes after a new search.
  React.useEffect(() => {
    if (!tracesWithObs.some((t) => t.trace_id === activeId)) {
      setActiveId(tracesWithObs[0]?.trace_id);
    }
  }, [tracesWithObs, activeId]);

  if (tracesWithObs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
        <Waypoints className="h-6 w-6 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium text-foreground">
          No observations to graph
        </p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          Enable &quot;Include observations&quot; above and search again to see
          each trace&apos;s execution graph here.
        </p>
      </div>
    );
  }

  const active =
    tracesWithObs.find((t) => t.trace_id === activeId) ?? tracesWithObs[0];

  return (
    <div className="space-y-3">
      {tracesWithObs.length > 1 && (
        <Tabs value={active.trace_id} onValueChange={setActiveId}>
          <TabsList className="h-auto flex-wrap gap-1 bg-transparent p-0">
            {tracesWithObs.map((t, i) => (
              <TabsTrigger
                key={t.trace_id}
                value={t.trace_id}
                className="h-8 rounded-md border border-border bg-secondary/60 px-3 data-[state=active]:border-primary/50 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                Trace {i + 1}
                <span className="ml-1.5 font-mono text-[10px] text-muted-foreground">
                  {shortId(t.trace_id, 6, 4)}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        <span>
          {active.observations!.length} observation
          {active.observations!.length === 1 ? "" : "s"}
        </span>
        <span>
          trace latency: <span className="text-signal-amber">{formatLatency(active.latency)}</span>
        </span>
        <span className="font-mono">{active.trace_id}</span>
      </div>

      <ObservationGraph trace={active} />

      <p className="text-[11px] text-muted-foreground">
        Nodes are arranged left→right by call depth, following each
        observation&apos;s <code className="font-mono">parent_observation_id</code>.
        Scroll to zoom, drag to pan.
      </p>
    </div>
  );
}
