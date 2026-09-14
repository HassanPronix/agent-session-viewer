"use client";

import * as React from "react";
import { ChevronRight, Cpu, Timer } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ContentBlock } from "@/components/ContentBlock";
import type { Observation } from "@/lib/types";
import {
  formatLatency,
  formatNumber,
  shortId,
  typeBadgeVariant,
} from "@/lib/format";
import { cn } from "@/lib/utils";

export function ObservationItem({
  observation,
  defaultOpen = false,
}: {
  observation: Observation;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const tokens = observation.token_usage;

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="rounded-md border border-border/80 bg-secondary/20"
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-3 px-3 py-2 text-left"
        >
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-90"
            )}
          />
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="truncate text-[13px] font-medium text-foreground">
              {observation.name}
            </span>
            <Badge variant={typeBadgeVariant(observation.type)}>
              {observation.type}
            </Badge>
            {observation.model && (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Cpu className="h-3 w-3" />
                {observation.model}
              </span>
            )}
            <span className="hidden font-mono text-[11px] text-muted-foreground sm:inline">
              {shortId(observation.observation_id)}
            </span>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-3 text-[11px] text-muted-foreground">
            {tokens && tokens.total > 0 && (
              <span title="Total tokens">{formatNumber(tokens.total)} tok</span>
            )}
            <span className="inline-flex items-center gap-1 text-signal-amber">
              <Timer className="h-3 w-3" />
              {formatLatency(observation.latency)}
            </span>
          </div>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 border-t border-border/80 px-3 py-3">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-muted-foreground">
          <span>
            id: <span className="font-mono text-foreground/80">{observation.observation_id}</span>
          </span>
          {observation.parent_observation_id && (
            <span>
              parent:{" "}
              <span className="font-mono text-foreground/80">
                {shortId(observation.parent_observation_id, 10, 6)}
              </span>
            </span>
          )}
          {observation.provider && <span>provider: {observation.provider}</span>}
          {tokens && (
            <span>
              tokens: {formatNumber(tokens.input)} in / {formatNumber(tokens.output)} out
            </span>
          )}
        </div>

        <div>
          <div className="mb-1 text-[11px] font-medium text-muted-foreground">Input</div>
          <ContentBlock value={observation.input} emptyLabel="No input recorded" />
        </div>
        <div>
          <div className="mb-1 text-[11px] font-medium text-muted-foreground">Output</div>
          <ContentBlock value={observation.output} emptyLabel="No output recorded" />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
