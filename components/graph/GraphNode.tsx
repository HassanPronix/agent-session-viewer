"use client";

import * as React from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Badge } from "@/components/ui/badge";
import { formatLatency, shortId, typeBadgeVariant } from "@/lib/format";
import type { TraceGraphNodeData } from "@/lib/graph";
import { cn } from "@/lib/utils";

function GraphNodeInner({ data }: NodeProps<TraceGraphNodeData>) {
  const isTrace = data.kind === "trace";

  return (
    <div
      className={cn(
        "w-[210px] rounded-md border bg-card px-3 py-2 shadow-sm",
        isTrace ? "border-primary/50" : "border-border"
      )}
    >
      {!isTrace && (
        <Handle
          type="target"
          position={Position.Left}
          className="!h-2 !w-2 !border-none !bg-border"
        />
      )}
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "truncate text-xs font-semibold",
            isTrace ? "text-primary" : "text-foreground"
          )}
          title={data.label}
        >
          {data.label}
        </span>
        {!isTrace && (
          <Badge variant={typeBadgeVariant(data.type)} className="shrink-0 px-1.5 py-0 text-[9px]">
            {data.type}
          </Badge>
        )}
      </div>
      <div className="mt-1 truncate font-mono text-[10px] text-muted-foreground" title={data.sublabel}>
        {shortId(data.sublabel, 10, 4)}
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{data.model ?? "\u00A0"}</span>
        <span className="text-signal-amber">{formatLatency(data.latency)}</span>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !border-none !bg-border"
      />
    </div>
  );
}

export const GraphNode = React.memo(GraphNodeInner);
