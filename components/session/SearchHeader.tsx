"use client";

import * as React from "react";
import { ChevronDown, Eye, EyeOff, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { SearchParams } from "@/lib/types";
import { ThemeToggle } from "@/components/theme-toggle";

const DEFAULT_BASE_URL = "https://agent-platform.kore.ai";

export function SearchHeader({
  onSearch,
  loading,
}: {
  onSearch: (params: SearchParams) => void;
  loading: boolean;
}) {
  const [apiKey, setApiKey] = React.useState("");
  const [showApiKey, setShowApiKey] = React.useState(false);
  const [appId, setAppId] = React.useState("");
  const [sessionId, setSessionId] = React.useState("");
  const [includeTraces, setIncludeTraces] = React.useState(true);
  const [includeObservations, setIncludeObservations] = React.useState(true);
  const [advancedOpen, setAdvancedOpen] = React.useState(false);
  const [baseUrl, setBaseUrl] = React.useState(DEFAULT_BASE_URL);

  const canSearch = apiKey.trim() && appId.trim() && sessionId.trim() && !loading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSearch) return;
    onSearch({
      apiKey: apiKey.trim(),
      appId: appId.trim(),
      sessionId: sessionId.trim(),
      baseUrl: baseUrl.trim() || DEFAULT_BASE_URL,
      includeTraces,
      includeObservations,
    });
  };

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <h1 className="text-sm font-semibold text-foreground">Session Inspector</h1>
          <span className="text-xs text-muted-foreground">
            Kore.ai Agent Platform
          </span>
          <ThemeToggle className="ml-auto" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.1fr_1.1fr_1.4fr_auto]">
            <div className="space-y-1.5">
              <Label htmlFor="appId">App ID</Label>
              <Input
                id="appId"
                placeholder="st-xxxxxxxx-xxxx-xxxx"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sessionId">Session ID</Label>
              <Input
                id="sessionId"
                placeholder="s-xxxxxxxx-xxxx-xxxx"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="apiKey">x-api-key</Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  placeholder="Your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  autoComplete="off"
                  className="pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showApiKey ? "Hide API key" : "Show API key"}
                >
                  {showApiKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-end">
              <Button type="submit" disabled={!canSearch} className="w-full lg:w-auto">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Search
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="includeTraces"
                checked={includeTraces}
                onCheckedChange={(v) => {
                  const checked = v === true;
                  setIncludeTraces(checked);
                  if (!checked) setIncludeObservations(false);
                }}
              />
              <Label htmlFor="includeTraces" className="cursor-pointer text-foreground/80">
                Include traces
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="includeObservations"
                checked={includeObservations}
                onCheckedChange={(v) => {
                  const checked = v === true;
                  setIncludeObservations(checked);
                  if (checked) setIncludeTraces(true);
                }}
              />
              <Label htmlFor="includeObservations" className="cursor-pointer text-foreground/80">
                Include observations
              </Label>
            </div>

            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen} className="ml-auto">
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  Advanced
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform",
                      advancedOpen && "rotate-180"
                    )}
                  />
                </button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>

          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleContent>
              <div className="max-w-sm space-y-1.5 pt-1">
                <Label htmlFor="baseUrl">API base URL</Label>
                <Input
                  id="baseUrl"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder={DEFAULT_BASE_URL}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </form>
      </div>
    </header>
  );
}
