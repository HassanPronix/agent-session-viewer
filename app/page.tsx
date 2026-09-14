"use client";

import * as React from "react";
import { AlertTriangle, Inbox, SearchX } from "lucide-react";
import { SearchHeader } from "@/components/session/SearchHeader";
import { SessionOverviewCard } from "@/components/session/SessionOverviewCard";
import { SessionCharts } from "@/components/session/SessionCharts";
import { SessionGraphView } from "@/components/session/SessionGraphView";
import { TraceItem } from "@/components/session/TraceItem";
import { JsonTree } from "@/components/JsonTree";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SearchParams, SessionApiResponse } from "@/lib/types";

type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string; details?: unknown }
  | { status: "success"; data: SessionApiResponse };

export default function Home() {
  const [state, setState] = React.useState<RequestState>({ status: "idle" });

  const handleSearch = async (params: SearchParams) => {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const json = await res.json();
      if (!res.ok) {
        setState({
          status: "error",
          message: json?.error ?? `Request failed with status ${res.status}`,
          details: json?.details,
        });
        return;
      }
      setState({ status: "success", data: json as SessionApiResponse });
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  };

  return (
    <div className="min-h-screen">
      <SearchHeader onSearch={handleSearch} loading={state.status === "loading"} />

      <main className="mx-auto max-w-6xl px-6 py-8">
        {state.status === "idle" && <EmptyState />}
        {state.status === "loading" && <LoadingState />}
        {state.status === "error" && <ErrorState message={state.message} details={state.details} />}
        {state.status === "success" && <ResultsState data={state.data} />}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-24 text-center">
      <Inbox className="h-8 w-8 text-muted-foreground" />
      <p className="mt-3 text-sm font-medium text-foreground">No session loaded yet</p>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">
        Enter an app ID, a session ID and your x-api-key above, then search to pull the
        session&apos;s traces and observations.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

function ErrorState({ message, details }: { message: string; details?: unknown }) {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Couldn&apos;t load the session</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>{message}</p>
        {details !== undefined && details !== null && (
          <pre className="max-h-40 overflow-auto rounded-md border border-destructive/30 bg-destructive/5 p-2 font-mono text-[11px]">
            {typeof details === "string" ? details : JSON.stringify(details, null, 2)}
          </pre>
        )}
      </AlertDescription>
    </Alert>
  );
}

function ResultsState({ data }: { data: SessionApiResponse }) {
  const sessions = data.sessions ?? [];

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-24 text-center">
        <SearchX className="h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium text-foreground">No session found</p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          The API responded successfully but returned no sessions matching that ID.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sessions.map((session) => (
        <div key={session.session_id} className="space-y-4">
          <SessionOverviewCard session={session} />

          <Tabs defaultValue="traces">
            <TabsList>
              <TabsTrigger value="traces">Traces</TabsTrigger>
              <TabsTrigger value="graph">Execution graph</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="raw">Raw response</TabsTrigger>
            </TabsList>

            <TabsContent value="traces" className="space-y-3">
              {session.traces.length === 0 ? (
                <p className="rounded-md border border-dashed border-border px-3 py-6 text-center text-xs italic text-muted-foreground">
                  No traces were returned for this session. Enable &quot;Include
                  traces&quot; above to fetch them.
                </p>
              ) : (
                [...session.traces].reverse().map((trace, i) => (
                  <TraceItem
                    key={trace.trace_id}
                    trace={trace}
                    index={i}
                    defaultOpen={session.traces.length === 1}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="graph">
              <SessionGraphView session={session} />
            </TabsContent>

            <TabsContent value="analytics">
              <SessionCharts session={session} />
            </TabsContent>

            <TabsContent value="raw">
              <JsonTree data={session} defaultExpandDepth={2} />
            </TabsContent>
          </Tabs>
        </div>
      ))}

      {data.pagination && (
        <p className="text-center text-[11px] text-muted-foreground">
          Page {data.pagination.page}, {data.pagination.total} total result
          {data.pagination.total === 1 ? "" : "s"}
        </p>
      )}
    </div>
  );
}
