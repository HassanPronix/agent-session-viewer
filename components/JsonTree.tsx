"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CopyButton } from "./CopyButton";

type JsonValue = unknown;

function valueKind(v: JsonValue): "object" | "array" | "string" | "number" | "boolean" | "null" | "undefined" {
  if (v === null) return "null";
  if (v === undefined) return "undefined";
  if (Array.isArray(v)) return "array";
  const t = typeof v;
  if (t === "object") return "object";
  if (t === "string") return "string";
  if (t === "number") return "number";
  if (t === "boolean") return "boolean";
  return "string";
}

function Primitive({ value }: { value: JsonValue }) {
  const kind = valueKind(value);
  if (kind === "null" || kind === "undefined") {
    return <span className="text-muted-foreground">null</span>;
  }
  if (kind === "boolean") {
    return <span className="text-signal-violet">{String(value)}</span>;
  }
  if (kind === "number") {
    return <span className="text-signal-amber">{String(value)}</span>;
  }
  // string
  const str = value as string;
  if (str === "") {
    return <span className="italic text-muted-foreground">empty string</span>;
  }
  const isLong = str.length > 140;
  const [expanded, setExpanded] = React.useState(false);
  if (!isLong) {
    return <span className="text-foreground/90">&quot;{str}&quot;</span>;
  }
  return (
    <span className="text-foreground/90">
      &quot;
      {expanded ? (
        <span className="whitespace-pre-wrap break-words">{str}</span>
      ) : (
        <span className="break-words">{str.slice(0, 140)}…</span>
      )}
      &quot;{" "}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setExpanded((v) => !v);
        }}
        className="text-signal-amber hover:underline"
      >
        {expanded ? "show less" : `show ${str.length - 140} more chars`}
      </button>
    </span>
  );
}

export function JsonTree({
  data,
  name,
  depth = 0,
  defaultExpandDepth = 1,
}: {
  data: JsonValue;
  name?: string;
  depth?: number;
  defaultExpandDepth?: number;
}) {
  const kind = valueKind(data);
  const isContainer = kind === "object" || kind === "array";
  const [open, setOpen] = React.useState(depth < defaultExpandDepth);

  if (!isContainer) {
    return (
      <div className="flex items-start gap-1.5 py-0.5 pl-5 font-mono text-[12.5px] leading-relaxed">
        {name !== undefined && (
          <span className="shrink-0 text-signal-teal">{name}:</span>
        )}
        <Primitive value={data} />
      </div>
    );
  }

  const entries: [string, JsonValue][] =
    kind === "array"
      ? (data as JsonValue[]).map((v, i) => [String(i), v])
      : Object.entries(data as Record<string, JsonValue>);

  const count = entries.length;
  const brackets = kind === "array" ? ["[", "]"] : ["{", "}"];

  if (count === 0) {
    return (
      <div className="flex items-center gap-1.5 py-0.5 pl-5 font-mono text-[12.5px] leading-relaxed">
        {name !== undefined && (
          <span className="text-signal-teal">{name}:</span>
        )}
        <span className="text-muted-foreground">
          {brackets[0]}
          {brackets[1]} empty
        </span>
      </div>
    );
  }

  return (
    <div className="font-mono text-[12.5px] leading-relaxed">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group flex w-full items-center gap-1 rounded py-0.5 pl-1 text-left hover:bg-accent/60"
      >
        <ChevronRight
          className={cn(
            "h-3 w-3 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-90"
          )}
        />
        {name !== undefined && (
          <span className="text-signal-teal">{name}:</span>
        )}
        <span className="text-muted-foreground">
          {brackets[0]}
          {!open && (
            <>
              <span className="px-1 text-[11px]">
                {count} {kind === "array" ? "item" : "key"}
                {count === 1 ? "" : "s"}
              </span>
              {brackets[1]}
            </>
          )}
        </span>
        {open && (
          <span className="ml-auto pr-1 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100">
            {count} {kind === "array" ? "items" : "keys"}
          </span>
        )}
      </button>
      {open && (
        <div className="ml-2 border-l border-border/70 pl-1">
          {entries.map(([k, v]) => (
            <JsonTree
              key={k}
              name={k}
              data={v}
              depth={depth + 1}
              defaultExpandDepth={defaultExpandDepth}
            />
          ))}
          <div className="pl-5 text-muted-foreground">{brackets[1]}</div>
        </div>
      )}
    </div>
  );
}

export function JsonTreeRoot({
  data,
  title,
  defaultExpandDepth = 1,
}: {
  data: JsonValue;
  title?: string;
  defaultExpandDepth?: number;
}) {
  return (
    <div className="rounded-md border border-border bg-background/40">
      <div className="flex items-center justify-between border-b border-border/70 px-2.5 py-1.5">
        <span className="text-[11px] font-medium text-muted-foreground">
          {title ?? "Raw JSON"}
        </span>
        <CopyButton
          value={JSON.stringify(data, null, 2)}
          label="Copy JSON"
        />
      </div>
      <div className="max-h-[420px] overflow-auto p-2 scrollbar-thin">
        <JsonTree data={data} defaultExpandDepth={defaultExpandDepth} />
      </div>
    </div>
  );
}
