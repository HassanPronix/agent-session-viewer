"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function JsonItem({
  index,
  value,
}: {
  index: number;
  value: unknown;
}) {
  const [open, setOpen] = useState(false);

  const preview =
    typeof value === "string"
      ? value
      : value === null
        ? "null"
        : Array.isArray(value)
          ? `Array (${value.length})`
          : typeof value === "object"
            ? "Object"
            : String(value);

  const isExpandable = (typeof value === "object" && value !== null) || typeof value === "string";

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => isExpandable && setOpen((v) => !v)}
        className={cn(
          "flex w-full items-start gap-2 px-3 py-2 text-left",
          isExpandable && "cursor-pointer hover:bg-muted/50"
        )}
      >
        {isExpandable ? (
          <ChevronRight
            className={cn(
              "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-90"
            )}
          />
        ) : (
          <span className="w-4 shrink-0" />
        )}

        <span className="shrink-0 text-xs font-medium text-muted-foreground">
          {index}:
        </span>

        <span className="min-w-0 truncate text-[13px] text-foreground/90">
          {preview}
        </span>
      </button>

      {open && (
        <div className="px-8 pb-3">
          {typeof value === "object" && value !== null ? (
            <JsonTree
              data={value}
              defaultExpandDepth={1}
            />
          ) : (
            <div className="whitespace-pre-wrap break-words text-[13px] text-foreground/90">
              {String(value)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function JsonTree({
  data,
  defaultExpandDepth = 1,
}: {
  data: unknown;
  defaultExpandDepth?: number;
}) {
  if (Array.isArray(data)) {
    return (
      <div className="rounded-md border border-border">
        {data.map((item, index) => (
          <JsonItem
            key={index}
            index={index}
            value={item}
          />
        ))}
      </div>
    );
  }

  if (data !== null && typeof data === "object") {
    return (
      <div className="rounded-md border border-border">
        {Object.entries(data).map(([key, value]) => (
          <JsonObjectItem
            key={key}
            name={key}
            value={value}
          />
        ))}
      </div>
    );
  }

  return null;
}
function JsonObjectItem({
  name,
  value,
}: {
  name: string;
  value: unknown;
}) {
  const [open, setOpen] = useState(false);

  const isContainer = typeof value === "object" && value !== null;
  const isExpandable = isContainer || typeof value === "string";

  const preview =
    typeof value === "string"
      ? value
      : value === null
        ? "null"
        : isExpandable
          ? Array.isArray(value)
            ? `Array (${value.length})`
            : "Object"
          : String(value);

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => isExpandable && setOpen((v) => !v)}
        className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-muted/50"
      >
        {isExpandable ? (
          <ChevronRight
            className={cn(
              "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-90"
            )}
          />
        ) : (
          <span className="w-4 shrink-0" />
        )}

        <span className="shrink-0 text-xs font-medium text-muted-foreground">
          {name}:
        </span>

        <span className="min-w-0 truncate text-[13px]">
          {preview}
        </span>
      </button>

      {open && isContainer && (
        <div className="px-8 pb-3">
          <JsonTree data={value} defaultExpandDepth={1} />
        </div>
      )}

      {open && !isContainer && (
        <div className="px-8 pb-3 whitespace-pre-wrap break-words text-[13px]">
          {String(value)}
        </div>
      )}``
    </div>
  );
}
