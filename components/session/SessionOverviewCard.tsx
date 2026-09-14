"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CopyButton } from "@/components/CopyButton";
import { JsonTreeRoot } from "@/components/JsonTree";
import { StatPill } from "./StatPill";
import type { Session } from "@/lib/types";
import { formatLatency, formatTimestamp } from "@/lib/format";
import { cn } from "@/lib/utils";

export function SessionOverviewCard({ session }: { session: Session }) {
  const [showRaw, setShowRaw] = React.useState(false);

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-mono text-sm font-semibold text-foreground">
              {session.session_id}
            </h2>
            <CopyButton value={session.session_id} label="Copy session id" />
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {session.traces.length} trace{session.traces.length === 1 ? "" : "s"} in this
            session
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-md border border-border/70 bg-background/30 p-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatPill label="Created" value={formatTimestamp(session.created_at)} mono={false} />
          <StatPill label="Source" value={session.source ?? "—"} />
          <StatPill label="Environment" value={session.environment ?? "—"} />
          <StatPill label="User" value={session.user_id ?? "—"} />
          <StatPill label="App version" value={session.app_version_id ?? "—"} />
          <StatPill label="Latency" value={formatLatency(session.latency)} />
        </div>

        <Collapsible open={showRaw} onOpenChange={setShowRaw}>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  showRaw && "rotate-90"
                )}
              />
              Raw session fields
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <JsonTreeRoot
              data={session}
              title="session object"
              defaultExpandDepth={1}
            />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
