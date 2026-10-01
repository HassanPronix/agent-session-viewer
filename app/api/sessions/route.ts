import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";

// This route exists purely as a same-origin proxy:
//  1. The Kore.ai API does not send CORS headers, so the browser can't call
//     it directly from a client component.
//  2. The x-api-key never needs to touch the browser's network tab as
//     anything other than a normal same-origin fetch to our own server.
//  3. The upstream endpoint is a GET request that also carries a
//     x-www-form-urlencoded body (per the provided curl). Browsers refuse to
//     send a body on a GET fetch, but Node's axios client does not enforce
//     that restriction, so the proxy re-creates the request faithfully -
//     sending session_id/include both as query params and as a form body.

export const dynamic = "force-dynamic";

interface ProxyPayload {
  baseUrl?: string;
  appId?: string;
  apiKey?: string;
  sessionId?: string;
  includeTraces?: boolean;
  includeObservations?: boolean;
}

const DEFAULT_BASE_URL = "https://agent-platform.kore.ai";

export async function POST(req: NextRequest) {
  let body: ProxyPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const {
    baseUrl,
    appId,
    apiKey,
    sessionId,
    includeTraces,
    includeObservations,
  } = body;

  const missing: string[] = [];
  if (!appId?.trim()) missing.push("appId");
  if (!apiKey?.trim()) missing.push("apiKey");
  if (!sessionId?.trim()) missing.push("sessionId");
  if (missing.length) {
    return NextResponse.json(
      { error: `Missing required field(s): ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  const includes: string[] = [];
  if (includeTraces) includes.push("traces");
  if (includeObservations) includes.push("observations");

  const resolvedBase = (baseUrl?.trim() || DEFAULT_BASE_URL).replace(
    /\/+$/,
    ""
  );
  const upstreamUrl = `${resolvedBase}/api/public/apps/${encodeURIComponent(
    appId!.trim()
  )}/sessions`;

  // Build the query string (mirrors the literal URL in the curl example).
  const searchParams = new URLSearchParams();
  searchParams.set("session_id", sessionId!.trim());
  includes.forEach((i) => searchParams.append("include", i));

  // Build the urlencoded body (mirrors the --data-urlencode flags).
  const formBody = new URLSearchParams();
  formBody.set("session_id", sessionId!.trim());
  includes.forEach((i) => formBody.append("include", i));

  try {
    const upstreamResponse = await axios.request({
      method: "GET",
      url: `${upstreamUrl}?${searchParams.toString()}`,
      headers: {
        "x-api-key": apiKey!.trim(),
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: formBody.toString(),
      timeout: 180_000,
      validateStatus: () => true,
    });

    if (upstreamResponse.status >= 200 && upstreamResponse.status < 300) {
      return NextResponse.json(upstreamResponse.data, {
        status: upstreamResponse.status,
      });
    }

    return NextResponse.json(
      {
        error: `Upstream request failed with status ${upstreamResponse.status}.`,
        details: upstreamResponse.data,
      },
      { status: upstreamResponse.status }
    );
  } catch (err) {
    const axiosErr = err as AxiosError;
    if (axiosErr.code === "ECONNABORTED") {
      return NextResponse.json(
        { error: "The request to the Kore.ai API timed out after 30s." },
        { status: 504 }
      );
    }
    return NextResponse.json(
      {
        error: "Failed to reach the Kore.ai API.",
        details: axiosErr.message ?? String(err),
      },
      { status: 502 }
    );
  }
}
