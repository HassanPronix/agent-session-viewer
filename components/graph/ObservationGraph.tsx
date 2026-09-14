"use client";

import * as React from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";

import { buildTraceGraph } from "@/lib/graph";
import type { Trace } from "@/lib/types";
import { GraphNode } from "./GraphNode";

const nodeTypes = { graphNode: GraphNode };

export function ObservationGraph({ trace }: { trace: Trace }) {
  const { nodes, edges } = React.useMemo(() => buildTraceGraph(trace), [trace]);

  if (!trace.observations || trace.observations.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-md border border-dashed border-border text-xs italic text-muted-foreground">
        No observations to graph for this trace.
      </div>
    );
  }

  return (
    <div className="h-[340px] w-full rounded-md border border-border bg-background/40">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
          minZoom={0.3}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="hsl(var(--border))" />
          <Controls showInteractive={false} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
