import { promisify } from "node:util";
import { execFile as execFileCallback } from "node:child_process";
import os from "node:os";

const execFile = promisify(execFileCallback);
const DEFAULT_ACCOUNT = "tonybigclawbowski@gmail.com";
const COMMAND_TIMEOUT_MS = 12000;

export type OpenClawStatus = {
  ok: boolean;
  summary: string;
  bind: string;
  port: string;
  dashboardUrl: string;
  probeTarget: string;
  runtime: string;
  rpcProbe: string;
  listening: string;
  service: string;
  serviceFile: string;
  logFile: string;
  troubles?: string;
  raw: string;
  updatedAt: string;
};

export type AgendaEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
  location?: string;
  detail?: string;
  isAllDay: boolean;
  calendarId?: string;
  htmlLink?: string;
};

export type HostHealth = {
  cpuLoadPercent: number;
  memoryPercent: number;
  diskPercent: number | null;
  uptimeHours: number;
  hostname: string;
  platform: string;
};

export type GmailThreadSummary = {
  id: string;
  subject: string;
  snippet: string;
  participants: string;
  lastFrom: string;
  lastMessageAt: string;
  messageCount: number;
  unread: boolean;
  labels: string[];
};

export type GmailInboxState = {
  ok: boolean;
  summary: string;
  account: string;
  query: string;
  threads: GmailThreadSummary[];
  updatedAt: string;
  error?: string;
  emptyReason?: string;
};

type GogEvent = {
  id?: string;
  summary?: string;
  start?: { date?: string; dateTime?: string };
  end?: { date?: string; dateTime?: string };
  location?: string;
  description?: string;
  htmlLink?: string;
  organizer?: { email?: string };
};

type GogThread = {
  id?: string;
  threadId?: string;
  subject?: string;
  snippet?: string;
  from?: string;
  participants?: string[];
  labelIds?: string[];
  messageCount?: number;
  messagesTotal?: number;
  historyId?: string;
  internalDate?: string | number;
  lastMessageDate?: string;
  firstMessageDate?: string;
  messages?: Array<{
    id?: string;
    threadId?: string;
    subject?: string;
    snippet?: string;
    from?: string;
    internalDate?: string | number;
    labelIds?: string[];
  }>;
};

function lineValue(raw: string, label: string) {
  const line = raw
    .split("\n")
    .find((entry) => entry.trim().startsWith(`${label}:`));

  return line ? line.split(":").slice(1).join(":").trim() : "";
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function formatExecError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

async function runCommand(command: string, args: string[], env?: Partial<NodeJS.ProcessEnv>) {
  const { stdout, stderr } = await execFile(command, args, {
    cwd: process.cwd(),
    env: { ...process.env, ...env },
    maxBuffer: 1024 * 1024 * 4,
    timeout: COMMAND_TIMEOUT_MS,
  });

  return `${stdout}${stderr}`.trim();
}

function resolveOpenClawPath() {
  return process.env.OPENCLAW_PATH ?? "openclaw";
}

function resolveGogPath() {
  return process.env.GOG_PATH ?? "gog";
}

function gogEnv(): Partial<NodeJS.ProcessEnv> {
  return {
    PATH: `${process.env.HOME}/go/bin:/usr/local/bin:${process.env.PATH ?? ""}`,
    GOG_ACCOUNT: process.env.GOG_ACCOUNT ?? DEFAULT_ACCOUNT,
  };
}

function parseJsonEnvelope<T>(raw: string): T {
  const parsed = JSON.parse(raw) as { result?: T } & T;
  return (parsed.result ?? parsed) as T;
}

export async function getOpenClawStatus(): Promise<OpenClawStatus> {
  try {
    const raw = await runCommand(resolveOpenClawPath(), ["gateway", "status"]);
    const runtime = lineValue(raw, "Runtime");
    const bindPort = lineValue(raw, "Gateway");
    const bind = bindPort.match(/bind=([^,]+)/)?.[1]?.trim() ?? "loopback";
    const port = bindPort.match(/port=([^\s(]+)/)?.[1]?.trim() ?? "18789";
    const dashboardUrl = lineValue(raw, "Dashboard") || `http://127.0.0.1:${port}/`;
    const probeTarget = lineValue(raw, "Probe target");
    const rpcProbe = lineValue(raw, "RPC probe") || "unknown";
    const listening = lineValue(raw, "Listening");
    const service = lineValue(raw, "Service");
    const serviceFile = lineValue(raw, "Service file");
    const logFile = lineValue(raw, "File logs");
    const troubles = lineValue(raw, "Troubles");
    const summary = runtime.includes("running") ? "Gateway running" : runtime || "Gateway status available";

    return {
      ok: runtime.includes("running") || rpcProbe === "ok",
      summary,
      bind,
      port,
      dashboardUrl,
      probeTarget,
      runtime,
      rpcProbe,
      listening,
      service,
      serviceFile,
      logFile,
      troubles,
      raw,
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      ok: false,
      summary: "OpenClaw status unavailable",
      bind: "unknown",
      port: "unknown",
      dashboardUrl: "http://127.0.0.1:18789/",
      probeTarget: "",
      runtime: formatExecError(error),
      rpcProbe: "failed",
      listening: "",
      service: "",
      serviceFile: "",
      logFile: "",
      raw: "",
      updatedAt: new Date().toISOString(),
    };
  }
}

function normalizeAgendaEvent(event: GogEvent): AgendaEvent {
  const start = event.start?.dateTime ?? event.start?.date ?? "";
  const end = event.end?.dateTime ?? event.end?.date;

  return {
    id: event.id ?? `${event.summary ?? "event"}-${start}`,
    title: event.summary ?? "Untitled event",
    start,
    end,
    location: event.location,
    detail: event.description,
    isAllDay: Boolean(event.start?.date && !event.start?.dateTime),
    calendarId: event.organizer?.email,
    htmlLink: event.htmlLink,
  };
}

export async function getAgendaEvents(): Promise<AgendaEvent[]> {
  const from = new Date();
  const to = new Date(from);
  to.setDate(to.getDate() + 7);

  const fromIso = from.toISOString().slice(0, 10);
  const toIso = to.toISOString().slice(0, 10);

  try {
    const raw = await runCommand(
      resolveGogPath(),
      ["calendar", "events", "primary", "--from", fromIso, "--to", toIso, "--json", "--no-input"],
      gogEnv(),
    );

    const parsed = parseJsonEnvelope<{ events?: GogEvent[] }>(raw);
    return (parsed.events ?? []).map(normalizeAgendaEvent);
  } catch {
    return [];
  }
}

function normalizeTimestamp(value?: string | number) {
  if (typeof value === "number") {
    return new Date(value).toISOString();
  }

  if (typeof value === "string") {
    if (/^\d+$/.test(value)) {
      const numeric = Number.parseInt(value, 10);
      if (value.length > 11) {
        return new Date(numeric).toISOString();
      }
      return new Date(numeric * 1000).toISOString();
    }

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return "";
}

function firstNonEmpty(...values: Array<string | undefined>) {
  return values.find((value) => value && value.trim())?.trim() ?? "";
}

function normalizeThread(thread: GogThread): GmailThreadSummary {
  const newestMessage = [...(thread.messages ?? [])]
    .sort((a, b) => {
      const aTime = Number(new Date(normalizeTimestamp(a.internalDate)).getTime() || 0);
      const bTime = Number(new Date(normalizeTimestamp(b.internalDate)).getTime() || 0);
      return bTime - aTime;
    })
    .at(0);

  const labels = Array.from(
    new Set([...(thread.labelIds ?? []), ...(newestMessage?.labelIds ?? [])].filter(Boolean) as string[]),
  );

  return {
    id: thread.threadId ?? thread.id ?? `thread-${Math.random().toString(36).slice(2)}`,
    subject: firstNonEmpty(thread.subject, newestMessage?.subject) || "(no subject)",
    snippet: firstNonEmpty(thread.snippet, newestMessage?.snippet) || "No preview text returned by gog.",
    participants:
      thread.participants?.join(", ") ||
      firstNonEmpty(thread.from, newestMessage?.from) ||
      "Participants unavailable",
    lastFrom: firstNonEmpty(newestMessage?.from, thread.from) || "Unknown sender",
    lastMessageAt: firstNonEmpty(
      normalizeTimestamp(thread.lastMessageDate),
      normalizeTimestamp(newestMessage?.internalDate),
      normalizeTimestamp(thread.internalDate),
      normalizeTimestamp(thread.firstMessageDate),
    ),
    messageCount: thread.messageCount ?? thread.messagesTotal ?? thread.messages?.length ?? 0,
    unread: labels.includes("UNREAD"),
    labels,
  };
}

export async function getGmailInbox(): Promise<GmailInboxState> {
  const account = gogEnv().GOG_ACCOUNT ?? DEFAULT_ACCOUNT;
  const query = "in:inbox newer_than:14d";

  try {
    const raw = await runCommand(
      resolveGogPath(),
      ["gmail", "search", query, "--max", "6", "--json", "--no-input"],
      gogEnv(),
    );

    const parsed = parseJsonEnvelope<{ threads?: GogThread[]; items?: GogThread[]; messages?: GogThread[] }>(raw);
    const source = parsed.threads ?? parsed.items ?? parsed.messages ?? [];
    const threads = source.map(normalizeThread);

    if (threads.length === 0) {
      return {
        ok: true,
        summary: "Inbox clear",
        account,
        query,
        threads: [],
        updatedAt: new Date().toISOString(),
        emptyReason: "No recent inbox threads matched the local Gmail query.",
      };
    }

    return {
      ok: true,
      summary: `${threads.length} recent inbox threads`,
      account,
      query,
      threads,
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      ok: false,
      summary: "Gmail inbox unavailable",
      account,
      query,
      threads: [],
      updatedAt: new Date().toISOString(),
      error: formatExecError(error),
      emptyReason: "Local gog Gmail read failed or timed out.",
    };
  }
}

export async function getHostHealth(): Promise<HostHealth> {
  const cpus = os.cpus();
  const load = os.loadavg()[0] ?? 0;
  const cpuLoadPercent = clampPercent((load / Math.max(cpus.length, 1)) * 100);
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const memoryPercent = clampPercent(((totalMem - freeMem) / totalMem) * 100);
  const uptimeHours = Math.round((os.uptime() / 3600) * 10) / 10;

  let diskPercent: number | null = null;

  try {
    const raw = await runCommand("df", ["-P", process.cwd()]);
    const lastLine = raw.split("\n").filter(Boolean).at(-1) ?? "";
    const useField = lastLine.split(/\s+/)[4] ?? "";
    const parsed = Number.parseInt(useField.replace("%", ""), 10);

    if (Number.isFinite(parsed)) {
      diskPercent = clampPercent(parsed);
    }
  } catch {
    diskPercent = null;
  }

  return {
    cpuLoadPercent,
    memoryPercent,
    diskPercent,
    uptimeHours,
    hostname: os.hostname(),
    platform: `${os.platform()} ${os.release()}`,
  };
}

export function formatAgendaTime(value: string, isAllDay: boolean) {
  if (!value) return "TBD";
  if (isAllDay) return "All day";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatAgendaDate(value: string, isAllDay: boolean) {
  if (!value) return "No date";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    ...(isAllDay ? {} : { hour: undefined }),
  }).format(date);
}

export function formatRelativeTimestamp(value: string) {
  if (!value) return "Time unknown";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const diffMs = date.getTime() - Date.now();
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const minutes = Math.round(diffMs / 60000);
  const hours = Math.round(diffMs / 3600000);
  const days = Math.round(diffMs / 86400000);

  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  if (Math.abs(hours) < 48) return rtf.format(hours, "hour");
  return rtf.format(days, "day");
}
