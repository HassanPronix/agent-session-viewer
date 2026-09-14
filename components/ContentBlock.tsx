"use client";

import * as React from "react";
import { CopyButton } from "./CopyButton";
import { JsonTree } from "./JsonTree";
import { cn } from "@/lib/utils";

const COLLAPSE_THRESHOLD = 480;

function StringBlock({ value }: { value: string }) {
  const [expanded, setExpanded] = React.useState(value.length <= COLLAPSE_THRESHOLD);
  const isLong = value.length > COLLAPSE_THRESHOLD;

  return (
    <div className="group relative rounded-md border border-border bg-background/40 p-3">
      <p
        className={cn(
          "whitespace-pre-wrap break-words text-[13px] leading-relaxed text-foreground/90",
          !expanded && "line-clamp-6"
        )}
      >
        {value}
      </p>
      <div className="mt-1.5 flex items-center justify-between">
        {isLong ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-xs font-medium text-primary hover:underline"
          >
            {expanded ? "Show less" : "Show full text"}
          </button>
        ) : (
          <span />
        )}
        <CopyButton value={value} label="Copy text" />
      </div>
    </div>
  );
}

export function ContentBlock({
  value,
  emptyLabel = "No data",
}: {
  value: unknown;
  emptyLabel?: string;
}) {
  if (value === null || value === undefined || value === "") {
    return (
      <div className="rounded-md border border-dashed border-border px-3 py-2 text-xs italic text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  if (typeof value === "string") {
    return <StringBlock value={value} />;
  }

  return (
    <div className="rounded-md border border-border bg-background/40 p-2">
      <JsonTree data={value} defaultExpandDepth={1} />
    </div>
  );
}
