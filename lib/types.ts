export interface TokenUsage {
  input: number;
  output: number;
  total: number;
  [key: string]: unknown;
}

export interface Observation {
  observation_id: string;
  type: string;
  name: string;
  start_time: string | null;
  end_time: string | null;
  latency: number | null;
  input: unknown;
  output: unknown;
  model?: string | null;
  provider?: string | null;
  token_usage?: TokenUsage | null;
  parent_observation_id?: string | null;
  [key: string]: unknown;
}

export interface Trace {
  trace_id: string;
  timestamp: string | null;
  environment?: string | null;
  user_id?: string | null;
  input: unknown;
  output: unknown;
  latency: number | null;
  app_version_id?: string | null;
  env_id?: string | null;
  source?: string | null;
  observations?: Observation[];
  [key: string]: unknown;
}

export interface Session {
  session_id: string;
  created_at?: string | null;
  source?: string | null;
  environment?: string | null;
  user_id?: string | null;
  session_reference?: string | null;
  app_version_id?: string | null;
  latency?: number | null;
  traces: Trace[];
  [key: string]: unknown;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  [key: string]: unknown;
}

export interface SessionApiResponse {
  sessions: Session[];
  pagination?: Pagination;
  [key: string]: unknown;
}

export interface SearchParams {
  appId: string;
  baseUrl: string;
  apiKey: string;
  sessionId: string;
  includeTraces: boolean;
  includeObservations: boolean;
}
