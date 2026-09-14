export function formatTimestamp(ts?: string | null): string {
  if (!ts) return "—";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatLatency(seconds?: number | null): string {
  if (seconds === null || seconds === undefined) return "—";
  if (seconds < 1) return `${Math.round(seconds * 1000)}ms`;
  return `${seconds.toFixed(2)}s`;
}

export function shortId(id?: string | null, head = 8, tail = 4): string {
  if (!id) return "—";
  if (id.length <= head + tail + 3) return id;
  return `${id.slice(0, head)}…${id.slice(-tail)}`;
}

export function formatNumber(n?: number | null): string {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat().format(n);
}

// Deterministic color assignment for observation names/providers so the
// same label always gets the same signal color across the whole app.
const SIGNAL_ORDER = ["amber", "teal", "violet", "rose"] as const;
export type SignalColor = (typeof SIGNAL_ORDER)[number];

export function colorForLabel(label: string): SignalColor {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = (hash * 31 + label.charCodeAt(i)) >>> 0;
  }
  return SIGNAL_ORDER[hash % SIGNAL_ORDER.length];
}

export function typeBadgeVariant(
  type?: string | null
): "default" | "teal" | "violet" | "rose" | "secondary" {
  if (!type) return "secondary";
  const t = type.toUpperCase();
  if (t === "GENERATION") return "teal";
  if (t === "SPAN") return "violet";
  if (t === "EVENT") return "default";
  if (t.includes("ERROR")) return "rose";
  return "secondary";
}
