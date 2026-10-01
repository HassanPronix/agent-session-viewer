"use client";

import * as React from "react";
import { ChevronDown, Eye, EyeOff, Loader2, Search, Save, Trash2 } from "lucide-react";
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
const STORAGE_KEY = "kore-session-inspector-credentials";

type SavedCredential = {
  id: string;
  name: string;
  appId: string;
  sessionId: string;
  apiKey: string;
  baseUrl: string;
};

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

  const [savedCredentials, setSavedCredentials] = React.useState<SavedCredential[]>([]);
  const [selectedCredentialId, setSelectedCredentialId] = React.useState("");
  const [headerCollapsed, setHeaderCollapsed] = React.useState(false);

  const canSearch =
    apiKey.trim() &&
    appId.trim() &&
    sessionId.trim() &&
    !loading;

  // Load saved credentials from localStorage
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed: SavedCredential[] = JSON.parse(stored);
        setSavedCredentials(parsed);
      }
    } catch (error) {
      console.error("Failed to load saved credentials:", error);
    }
  }, []);

  // Save credentials to localStorage
  const handleSaveCredentials = () => {
    if (!appId.trim() || !sessionId.trim() || !apiKey.trim()) {
      return;
    }

    const name = window.prompt(
      "Enter a name for these credentials:",
      `Kore App ${savedCredentials.length + 1}`
    );

    if (!name?.trim()) {
      return;
    }

    const newCredential: SavedCredential = {
      id: crypto.randomUUID(),
      name: name.trim(),
      appId: appId.trim(),
      sessionId: sessionId.trim(),
      apiKey: apiKey.trim(),
      baseUrl: baseUrl.trim() || DEFAULT_BASE_URL,
    };

    const updatedCredentials = [
      ...savedCredentials,
      newCredential,
    ];

    setSavedCredentials(updatedCredentials);
    setSelectedCredentialId(newCredential.id);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedCredentials)
    );
  };

  // Load selected credentials into the form
  const handleCredentialSelect = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const id = e.target.value;

    setSelectedCredentialId(id);

    if (!id) {
      return;
    }

    const credential = savedCredentials.find(
      (item) => item.id === id
    );

    if (!credential) {
      return;
    }

    setAppId(credential.appId);
    setSessionId(credential.sessionId);
    setApiKey(credential.apiKey);
    setBaseUrl(credential.baseUrl || DEFAULT_BASE_URL);
  };

  // Delete selected credentials
  const handleDeleteCredentials = () => {
    if (!selectedCredentialId) {
      return;
    }

    const credential = savedCredentials.find(
      (item) => item.id === selectedCredentialId
    );

    if (!credential) {
      return;
    }

    const confirmed = window.confirm(
      `Delete saved credentials "${credential.name}"?`
    );

    if (!confirmed) {
      return;
    }

    const updatedCredentials = savedCredentials.filter(
      (item) => item.id !== selectedCredentialId
    );

    setSavedCredentials(updatedCredentials);
    setSelectedCredentialId("");

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedCredentials)
    );
  };

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
    <header
      className={cn(
        "sticky top-0 z-20 border-b border-border",
        "bg-background/95 backdrop-blur",
        "supports-[backdrop-filter]:bg-background/80",
        "transition-all duration-200"
      )}
    >
      <div className="mx-auto max-w-6xl px-6">

        {/* Top bar - always visible */}
        <div className="flex min-h-12 items-center gap-2">

          <div className="h-2 w-2 rounded-full bg-primary" />

          <h1 className="text-sm font-semibold text-foreground">
            Session Inspector
          </h1>

          <span className="text-xs text-muted-foreground">
            Kore.ai Agent Platform
          </span>

          {/* Show current selected credential when collapsed */}
          {headerCollapsed && selectedCredentialId && (
            <>
              <span className="text-muted-foreground">·</span>

              <span className="max-w-[180px] truncate text-xs text-muted-foreground">
                {
                  savedCredentials.find(
                    (credential) =>
                      credential.id === selectedCredentialId
                  )?.name
                }
              </span>
            </>
          )}

          <div className="ml-auto flex items-center gap-2">

            <ThemeToggle />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                setHeaderCollapsed((value) => !value)
              }
              className="gap-1.5"
            >
              {headerCollapsed ? "Expand" : "Collapse"}

              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  headerCollapsed && "-rotate-90"
                )}
              />
            </Button>

          </div>
        </div>

        {/* Collapsible content */}
        {!headerCollapsed && (
          <div className="pb-4">

            <form
              onSubmit={handleSubmit}
              className="space-y-3"
            >

              {/* Saved credentials */}
              {savedCredentials.length > 0 && (
                <div className="flex flex-wrap items-end gap-2">

                  <div className="min-w-[250px] space-y-1.5">

                    <Label htmlFor="savedCredentials">
                      Saved credentials
                    </Label>

                    <select
                      id="savedCredentials"
                      value={selectedCredentialId}
                      onChange={handleCredentialSelect}
                      className={cn(
                        "flex h-9 w-full rounded-md",
                        "border border-input",
                        "bg-background px-3 py-1 text-sm",
                        "shadow-sm transition-colors",
                        "focus-visible:outline-none",
                        "focus-visible:ring-1",
                        "focus-visible:ring-ring"
                      )}
                    >
                      <option value="">
                        Select saved credentials...
                      </option>

                      {savedCredentials.map((credential) => (
                        <option
                          key={credential.id}
                          value={credential.id}
                        >
                          {credential.name}
                        </option>
                      ))}
                    </select>

                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleDeleteCredentials}
                    disabled={!selectedCredentialId}
                    title="Delete saved credentials"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                </div>
              )}

              {/* Main inputs */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.1fr_1.1fr_1.4fr_auto]">

                {/* App ID */}
                <div className="space-y-1.5">

                  <Label htmlFor="appId">
                    App ID
                  </Label>

                  <Input
                    id="appId"
                    placeholder="st-xxxxxxxx-xxxx-xxxx"
                    value={appId}
                    onChange={(e) =>
                      setAppId(e.target.value)
                    }
                    autoComplete="off"
                  />

                </div>

                {/* Session ID */}
                <div className="space-y-1.5">

                  <Label htmlFor="sessionId">
                    Session ID
                  </Label>

                  <Input
                    id="sessionId"
                    placeholder="s-xxxxxxxx-xxxx-xxxx"
                    value={sessionId}
                    onChange={(e) =>
                      setSessionId(e.target.value)
                    }
                    autoComplete="off"
                  />

                </div>

                {/* API Key */}
                <div className="space-y-1.5">

                  <Label htmlFor="apiKey">
                    x-api-key
                  </Label>

                  <div className="relative">

                    <Input
                      id="apiKey"
                      type={
                        showApiKey
                          ? "text"
                          : "password"
                      }
                      placeholder="Your API key"
                      value={apiKey}
                      onChange={(e) =>
                        setApiKey(e.target.value)
                      }
                      autoComplete="off"
                      className="pr-9"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowApiKey((v) => !v)
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={
                        showApiKey
                          ? "Hide API key"
                          : "Show API key"
                      }
                    >
                      {showApiKey ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>

                  </div>

                </div>

                {/* Save + Search */}
                <div className="flex items-end gap-2">

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveCredentials}
                    disabled={
                      !appId.trim() ||
                      !sessionId.trim() ||
                      !apiKey.trim()
                    }
                    title="Save credentials"
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </Button>

                  <Button
                    type="submit"
                    disabled={!canSearch}
                    className="w-full lg:w-auto"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}

                    Search
                  </Button>

                </div>

              </div>

              {/* Options */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">

                <div className="flex items-center gap-2">

                  <Checkbox
                    id="includeTraces"
                    checked={includeTraces}
                    onCheckedChange={(v) => {

                      const checked = v === true;

                      setIncludeTraces(checked);

                      if (!checked) {
                        setIncludeObservations(false);
                      }

                    }}
                  />

                  <Label
                    htmlFor="includeTraces"
                    className="cursor-pointer text-foreground/80"
                  >
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

                      if (checked) {
                        setIncludeTraces(true);
                      }

                    }}
                  />

                  <Label
                    htmlFor="includeObservations"
                    className="cursor-pointer text-foreground/80"
                  >
                    Include observations
                  </Label>

                </div>

                <Collapsible
                  open={advancedOpen}
                  onOpenChange={setAdvancedOpen}
                  className="ml-auto"
                >

                  <CollapsibleTrigger asChild>

                    <button
                      type="button"
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Advanced

                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 transition-transform",
                          advancedOpen &&
                          "rotate-180"
                        )}
                      />

                    </button>

                  </CollapsibleTrigger>

                </Collapsible>

              </div>

              {/* Advanced */}
              <Collapsible
                open={advancedOpen}
                onOpenChange={setAdvancedOpen}
              >

                <CollapsibleContent>

                  <div className="max-w-sm space-y-1.5 pt-1">

                    <Label htmlFor="baseUrl">
                      API base URL
                    </Label>

                    <Input
                      id="baseUrl"
                      value={baseUrl}
                      onChange={(e) =>
                        setBaseUrl(e.target.value)
                      }
                      placeholder={DEFAULT_BASE_URL}
                    />

                  </div>

                </CollapsibleContent>

              </Collapsible>

            </form>

          </div>
        )}

      </div>
    </header>
  );
}
