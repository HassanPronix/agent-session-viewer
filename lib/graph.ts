import type { Edge, Node } from "reactflow";
import type { Observation, Trace } from "./types";

const COL_WIDTH = 250;
const ROW_HEIGHT = 92;

export interface TraceGraphNodeData {
  kind: "trace" | "observation";
  label: string;
  sublabel?: string;
  latency?: number | null;
  type?: string | null;
  model?: string | null;
  observation?: Observation;
}

/**
 * Lays out a trace's observations as a tree: the trace itself is the root
 * (depth 0, x = 0), and each observation sits one column to the right of its
 * parent_observation_id (or directly under the trace root if it has none, or
 * its parent isn't present in this trace's observation list). Vertical
 * position is computed bottom-up so parents center over their children.
 */
export function buildTraceGraph(trace: Trace): {
  nodes: Node<TraceGraphNodeData>[];
  edges: Edge[];
} {
  const observations = trace.observations ?? [];
  const rootId = `trace:${trace.trace_id}`;

  const idsInTrace = new Set(observations.map((o) => o.observation_id));
  const childrenMap = new Map<string, Observation[]>();

  for (const obs of observations) {
    const parentId =
      obs.parent_observation_id && idsInTrace.has(obs.parent_observation_id)
        ? obs.parent_observation_id
        : rootId;
    if (!childrenMap.has(parentId)) childrenMap.set(parentId, []);
    childrenMap.get(parentId)!.push(obs);
  }

  const edges: Edge[] = [];
  const positions = new Map<string, { x: number; y: number }>();
  let nextRow = 0;

  // Post-order DFS: leaves get the next free row; a parent's row is the
  // average of its children's rows, so the tree stays visually centered.
  function place(nodeId: string, depth: number): number {
    const children = childrenMap.get(nodeId) ?? [];

    if (children.length === 0) {
      const row = nextRow;
      nextRow += 1;
      if (nodeId !== rootId) {
        positions.set(nodeId, { x: depth * COL_WIDTH, y: row * ROW_HEIGHT });
      }
      return row;
    }

    const childRows = children.map((child) => {
      const row = place(child.observation_id, depth + 1);
      edges.push({
        id: `${nodeId}->${child.observation_id}`,
        source: nodeId,
        target: child.observation_id,
        type: "smoothstep",
        style: { stroke: "hsl(var(--border))", strokeWidth: 1.5 },
      });
      return row;
    });

    const row = childRows.reduce((a, b) => a + b, 0) / childRows.length;
    if (nodeId !== rootId) {
      positions.set(nodeId, { x: depth * COL_WIDTH, y: row * ROW_HEIGHT });
    }
    return row;
  }

  const rootRow = place(rootId, 0);

  const nodes: Node<TraceGraphNodeData>[] = [
    {
      id: rootId,
      position: { x: 0, y: rootRow * ROW_HEIGHT },
      data: {
        kind: "trace",
        label: "Trace",
        sublabel: trace.trace_id,
        latency: trace.latency,
      },
      type: "graphNode",
    },
    ...observations.map((obs) => ({
      id: obs.observation_id,
      position: positions.get(obs.observation_id) ?? { x: COL_WIDTH, y: 0 },
      data: {
        kind: "observation" as const,
        label: obs.name,
        sublabel: obs.observation_id,
        latency: obs.latency,
        type: obs.type,
        model: obs.model,
        observation: obs,
      },
      type: "graphNode",
    })),
  ];

  return { nodes, edges };
}
