import { CommandPalette } from "@/components/command-palette";
import { QuickActions } from "@/components/quick-actions";
import { SidebarNav } from "@/components/sidebar-nav";
import {
  formatAgendaDate,
  formatAgendaTime,
  formatRelativeTimestamp,
  getAgendaEvents,
  getGmailInbox,
  getHostHealth,
  getOpenClawStatus,
} from "@/lib/mission-control-data";

const tools = [
  {
    name: "Gateway",
    desc: "Open the localhost OpenClaw dashboard or inspect status JSON.",
    accent: "from-cyan-500/20 to-sky-500/5",
    href: "http://127.0.0.1:18789/",
    secondaryHref: "/api/openclaw",
    secondaryLabel: "JSON",
  },
  {
    name: "Calendar",
    desc: "View the next 7 days from the configured gog account.",
    accent: "from-violet-500/20 to-fuchsia-500/5",
    href: "#calendar-agenda",
    secondaryHref: "/api/calendar/agenda",
    secondaryLabel: "API",
  },
  {
    name: "Inbox",
    desc: "Read a recent Gmail summary through local gog in read-only mode.",
    accent: "from-rose-500/20 to-orange-500/5",
    href: "#gmail-inbox",
    secondaryHref: "/api/gmail/inbox",
    secondaryLabel: "API",
  },
  {
    name: "Actions",
    desc: "Safe local moves: refresh data, open routes, copy commands, keep fingers attached.",
    accent: "from-emerald-500/20 to-teal-500/5",
    href: "#quick-actions",
    secondaryHref: "#command-center",
    secondaryLabel: "Palette",
  },
];

const sidebar = [
  {
    section: "Overview",
    items: [
      { label: "Home", href: "#top" },
      { label: "Activity", href: "#command-center" },
      { label: "Timeline", href: "#calendar-agenda" },
    ],
  },
  {
    section: "Operations",
    items: [
      { label: "OpenClaw", href: "#openclaw-status" },
      { label: "Calendar", href: "#calendar-agenda" },
      { label: "Inbox", href: "#gmail-inbox" },
      { label: "Actions", href: "#quick-actions" },
    ],
  },
  {
    section: "System",
    items: [
      { label: "Health", href: "#health-summary" },
      { label: "Routes", href: "#tools-launcher" },
    ],
  },
];

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function Panel({
  title,
  eyebrow,
  children,
  className,
  id,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cx(
        "rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl",
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          {eyebrow ? (
            <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function StatCard({ label, value, meta }: { label: string; value: string; meta: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-zinc-50">{value}</p>
      <p className="mt-2 text-sm text-zinc-500">{meta}</p>
    </div>
  );
}

function ProgressRow({ label, value, note }: { label: string; value: number | null; note: string }) {
  const displayValue = value === null ? "n/a" : `${value}%`;
  const width = value === null ? "22%" : `${value}%`;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-zinc-300">{label}</span>
        <span className="font-medium text-zinc-100">{displayValue}</span>
      </div>
      <div className="h-2 rounded-full bg-white/6">
        <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" style={{ width }} />
      </div>
      <p className="mt-2 text-xs text-zinc-500">{note}</p>
    </div>
  );
}

export const dynamic = "force-dynamic";

export default async function Home() {
  const [openClaw, agenda, health, inbox] = await Promise.all([
    getOpenClawStatus(),
    getAgendaEvents(),
    getHostHealth(),
    getGmailInbox(),
  ]);

  const statusPills = [
    { label: "Gateway", value: openClaw.ok ? "Online" : "Attention" },
    { label: "Agenda", value: `${agenda.length} in 7 days` },
    { label: "Inbox", value: inbox.ok ? `${inbox.threads.length} recent` : "Read issue" },
    { label: "Host", value: `${health.memoryPercent}% memory` },
  ];

  return (
    <main id="top" className="min-h-screen scroll-smooth bg-[radial-gradient(circle_at_top,_rgba(110,125,255,0.16),_transparent_22%),radial-gradient(circle_at_right,_rgba(0,209,255,0.08),_transparent_28%),linear-gradient(180deg,_#0a0b10_0%,_#09090b_100%)] text-zinc-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-6 px-4 py-4 lg:px-6 lg:py-6">
        <aside className="hidden w-[260px] shrink-0 rounded-[28px] border border-white/10 bg-black/25 p-5 shadow-2xl backdrop-blur-xl lg:flex lg:flex-col">
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 text-sm font-bold text-black">
                MC
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-100">Mission Control</p>
                <p className="text-xs text-zinc-500">OpenClaw local cockpit v3</p>
              </div>
            </div>
          </div>

          <SidebarNav groups={sidebar} />

          <div className="mt-auto rounded-3xl border border-cyan-400/20 bg-cyan-400/8 p-4">
            <p className="text-sm font-medium text-cyan-100">Local-first by design</p>
            <p className="mt-2 text-sm leading-6 text-cyan-50/75">
              Loopback gateway, local CLI reads, copyable commands, and zero fake cloud mystery meat.
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <header className="rounded-[28px] border border-white/10 bg-black/25 px-5 py-5 shadow-2xl backdrop-blur-xl lg:px-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
                    v3 dashboard
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
                    localhost-only assumptions
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
                    gog Gmail is read-only here
                  </span>
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-white lg:text-4xl">
                  Mission Control
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400 lg:text-base">
                  Same calm, Linear-ish cockpit — now with Gmail inbox visibility, safer local quick actions,
                  and a little more signal without turning the dashboard into a cursed kitchen sink.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {statusPills.map((pill) => (
                  <div key={pill.label} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{pill.label}</p>
                    <p className="mt-2 text-sm font-semibold text-zinc-100">{pill.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </header>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-6">
              <Panel id="command-center" title="Command bar" eyebrow="Search / launch / inspect">
                <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                  <CommandPalette />
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <StatCard label="Agenda" value={String(agenda.length)} meta="events in the next 7 days" />
                  <StatCard label="Inbox" value={String(inbox.threads.length)} meta={inbox.ok ? inbox.summary : "gog read issue"} />
                  <StatCard label="Uptime" value={`${health.uptimeHours}h`} meta={health.hostname} />
                </div>
              </Panel>

              <Panel id="tools-launcher" title="Tools launcher" eyebrow="Jump in fast">
                <div className="grid gap-4 md:grid-cols-2">
                  {tools.map((tool) => (
                    <div
                      key={tool.name}
                      className={cx(
                        "group rounded-2xl border border-white/10 bg-gradient-to-br p-4 text-left transition hover:-translate-y-0.5 hover:border-white/20",
                        tool.accent,
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-zinc-100">{tool.name}</p>
                          <p className="mt-2 text-sm leading-6 text-zinc-400">{tool.desc}</p>
                        </div>
                        <a href={tool.href} className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-xs text-zinc-300">
                          Open
                        </a>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <a href={tool.href} className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-xs text-zinc-200">
                          Primary
                        </a>
                        <a
                          href={tool.secondaryHref}
                          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-zinc-400"
                        >
                          {tool.secondaryLabel}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel id="quick-actions" title="Quick actions" eyebrow="Safe local operations">
                <QuickActions />
              </Panel>
            </div>

            <div className="grid gap-6">
              <Panel id="openclaw-status" title="OpenClaw status" eyebrow="System">
                <div className="space-y-3">
                  {[
                    ["Gateway daemon", openClaw.runtime || "Unknown", openClaw.service || "No service metadata"],
                    ["Loopback listener", openClaw.listening || `${openClaw.bind}:${openClaw.port}`, openClaw.dashboardUrl],
                    ["RPC probe", openClaw.rpcProbe || "Unknown", openClaw.logFile || "No log file reported"],
                  ].map(([label, value, detail]) => (
                    <div key={label} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-zinc-300">{label}</p>
                        <span
                          className={cx(
                            "rounded-full px-2.5 py-1 text-xs",
                            value.toLowerCase().includes("running") || value.toLowerCase() === "ok"
                              ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                              : "border border-amber-400/20 bg-amber-400/10 text-amber-300",
                          )}
                        >
                          {value}
                        </span>
                      </div>
                      <p className="mt-2 break-all text-sm text-zinc-500">{detail}</p>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel id="health-summary" title="Health summary" eyebrow="Host posture">
                <div className="space-y-4">
                  <ProgressRow label="CPU load" value={health.cpuLoadPercent} note={`1-minute load normalized across cores · ${health.platform}`} />
                  <ProgressRow label="Memory" value={health.memoryPercent} note="Live host memory use from the local machine." />
                  <ProgressRow label="Disk" value={health.diskPercent} note="Workspace filesystem usage. Feed the gremlins less." />
                </div>
              </Panel>

              <Panel id="gmail-inbox" title="Gmail inbox" eyebrow="Google Gmail · read-only via gog">
                <div className="mb-4 rounded-2xl border border-white/8 bg-black/20 p-4 text-sm text-zinc-400">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-zinc-100">{inbox.summary}</p>
                      <p className="mt-1 text-zinc-500">Account: {inbox.account} · Query: {inbox.query}</p>
                    </div>
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                      Updated {formatRelativeTimestamp(inbox.updatedAt)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {inbox.ok && inbox.threads.length > 0 ? (
                    inbox.threads.map((thread) => (
                      <div key={thread.id} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-sm font-medium text-zinc-100">{thread.subject}</p>
                              {thread.unread ? (
                                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[11px] text-cyan-300">
                                  Unread
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-1 text-sm text-zinc-400">{thread.participants}</p>
                          </div>
                          <div className="text-right text-xs text-zinc-500">
                            <p>{formatRelativeTimestamp(thread.lastMessageAt)}</p>
                            <p className="mt-1">{thread.messageCount} messages</p>
                          </div>
                        </div>
                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-500">{thread.snippet}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
                          <span className="rounded-full border border-white/8 bg-white/[0.03] px-2 py-1">Last from {thread.lastFrom}</span>
                          {thread.labels.slice(0, 3).map((label) => (
                            <span key={label} className="rounded-full border border-white/8 bg-white/[0.03] px-2 py-1">
                              {label}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : inbox.ok ? (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-black/15 p-5 text-sm text-zinc-500">
                      {inbox.emptyReason ?? "No recent inbox threads returned. Either inbox zero happened or Gmail is being coy."}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-amber-400/15 bg-amber-400/5 p-5 text-sm text-amber-100/85">
                      <p className="font-medium text-amber-200">Couldn’t load Gmail from local gog.</p>
                      <p className="mt-2 leading-6 text-amber-100/70">{inbox.error ?? inbox.emptyReason}</p>
                      <p className="mt-3 text-amber-100/70">
                        The UI stays read-only on purpose. Open <a className="underline" href="/api/gmail/inbox">/api/gmail/inbox</a> or copy the gog command from Quick actions if you want the raw story.
                      </p>
                    </div>
                  )}
                </div>
              </Panel>

              <Panel id="calendar-agenda" title="Calendar agenda" eyebrow="Google Calendar · next 7 days">
                <div className="space-y-3">
                  {agenda.length > 0 ? (
                    agenda.map((item) => (
                      <div key={item.id} className="flex gap-4 rounded-2xl border border-white/8 bg-black/20 p-4">
                        <div className="w-20 shrink-0 text-sm font-medium text-cyan-300">
                          {formatAgendaTime(item.start, item.isAllDay)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-zinc-100">{item.title}</p>
                          <p className="mt-1 text-sm leading-6 text-zinc-500">
                            {formatAgendaDate(item.start, item.isAllDay)}
                            {item.location ? ` · ${item.location}` : ""}
                          </p>
                          {item.detail ? (
                            <p className="mt-1 line-clamp-2 text-sm leading-6 text-zinc-500">{item.detail}</p>
                          ) : null}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-black/15 p-5 text-sm text-zinc-500">
                      No events returned by gog for the next 7 days. Either the calendar is gloriously empty or Google is keeping its cards close.
                    </div>
                  )}
                </div>
              </Panel>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
