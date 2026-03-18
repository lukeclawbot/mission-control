import { promisify } from "node:util";
import { execFile as execFileCallback } from "node:child_process";
import os from "node:os";

const execFile = promisify(execFileCallback);

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
  });

  return `${stdout}${stderr}`.trim();
}

export async function getOpenClawStatus(): Promise<OpenClawStatus> {
  try {
    const raw = await runCommand("openclaw", ["gateway", "status"]);
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
      "gog",
      ["calendar", "events", "primary", "--from", fromIso, "--to", toIso, "--json", "--no-input"],
      {
        PATH: `${process.env.HOME}/go/bin:${process.env.PATH ?? ""}`,
        GOG_ACCOUNT: process.env.GOG_ACCOUNT ?? "tonybigclawbowski@gmail.com",
      },
    );

    const parsed = JSON.parse(raw) as { events?: GogEvent[] };
    return (parsed.events ?? []).map(normalizeAgendaEvent);
  } catch {
    return [];
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
