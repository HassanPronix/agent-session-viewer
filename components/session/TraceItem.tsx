"use client";

import * as React from "react";
import { ChevronRight, Layers, Timer } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentBlock } from "@/components/ContentBlock";
import { ObservationItem } from "./ObservationItem";
import { ObservationGraph } from "@/components/graph/ObservationGraph";
import type { Trace } from "@/lib/types";
import { formatLatency, formatTimestamp, shortId } from "@/lib/format";
import { cn } from "@/lib/utils";

export function TraceItem({
  trace,
  index,
  defaultOpen = false,
}: {
  trace: Trace;
  index: number;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const observations = trace.observations ?? [];

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="rounded-lg border border-border bg-card"
    >
      <CollapsibleTrigger asChild>
        <button type="button" className="flex w-full items-center gap-3 px-4 py-3 text-left">
          <ChevronRight
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-90"
            )}
          />
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <span className="truncate text-[13px] font-medium text-foreground">
                Trace {shortId(trace.trace_id, 10, 6)}
              </span>
              {trace.environment && (
                <Badge variant="outline">{trace.environment}</Badge>
              )}
              {trace.source && <Badge variant="secondary">{trace.source}</Badge>}
              {observations.length > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Layers className="h-3 w-3" />
                  {observations.length} observation{observations.length === 1 ? "" : "s"}
                </span>
              )}
            </div>
            <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
              {typeof trace.input === "string" ? trace.input : "Structured input"}
            </p>
          </div>
          <div className="ml-auto flex shrink-0 flex-col items-end gap-0.5 text-[11px] text-muted-foreground">
            <span>{formatTimestamp(trace.timestamp)}</span>
            <span className="inline-flex items-center gap-1 text-signal-amber">
              <Timer className="h-3 w-3" />
              {formatLatency(trace.latency)}
            </span>
          </div>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="border-t border-border px-4 py-4">
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            {observations.length > 0 && (
              <TabsTrigger value="graph">Execution graph</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="mb-1 text-[11px] font-medium text-muted-foreground">
                  Trace input
                </div>
                <ContentBlock value={trace.input} emptyLabel="No input recorded" />
              </div>
              <div>
                <div className="mb-1 text-[11px] font-medium text-muted-foreground">
                  Trace output
                </div>
                <ContentBlock value={trace.output} emptyLabel="No output recorded" />
              </div>
            </div>

            {observations.length > 0 && (
              <div>
                <div className="mb-2 text-[11px] font-medium text-muted-foreground">
                  Observations ({observations.length})
                </div>
                <div className="space-y-2">
                  {observations.map((obs) => (
                    <ObservationItem key={obs.observation_id} observation={obs} />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {observations.length > 0 && (
            <TabsContent value="graph">
              <ObservationGraph trace={trace} />
            </TabsContent>
          )}
        </Tabs>
      </CollapsibleContent>
    </Collapsible>
  );
}
