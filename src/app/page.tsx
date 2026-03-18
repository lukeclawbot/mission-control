const statusPills = [
  { label: "Gateway", value: "Online", tone: "emerald" },
  { label: "Nodes", value: "4 connected", tone: "sky" },
  { label: "Automations", value: "12 healthy", tone: "violet" },
];

const agenda = [
  {
    time: "08:30",
    title: "Azure platform standup",
    detail: "Placeholder agenda block · connect Calendar API later",
  },
  {
    time: "11:00",
    title: "Change window review",
    detail: "Reserved for your next high-signal thing",
  },
  {
    time: "15:30",
    title: "AI sandbox",
    detail: "Quick slot for testing new tools without chaos goblins",
  },
];

const tools = [
  { name: "Gateway", desc: "Check service status, restart, inspect logs", accent: "from-cyan-500/20 to-sky-500/5" },
  { name: "Nodes", desc: "View device pairing and remote connectivity", accent: "from-violet-500/20 to-fuchsia-500/5" },
  { name: "Workflows", desc: "Launch repeatable automations and scripts", accent: "from-emerald-500/20 to-teal-500/5" },
  { name: "Docs", desc: "Jump into runbooks, notes, and local references", accent: "from-amber-500/20 to-orange-500/5" },
];

const sidebar = [
  { section: "Overview", items: ["Home", "Activity", "Timeline"] },
  { section: "Operations", items: ["OpenClaw", "Calendar", "Tools", "Health"] },
  { section: "System", items: ["Settings", "Logs"] },
];

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function Panel({
  title,
  eyebrow,
  children,
  className,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
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

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(110,125,255,0.16),_transparent_22%),radial-gradient(circle_at_right,_rgba(0,209,255,0.08),_transparent_28%),linear-gradient(180deg,_#0a0b10_0%,_#09090b_100%)] text-zinc-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-6 px-4 py-4 lg:px-6 lg:py-6">
        <aside className="hidden w-[260px] shrink-0 rounded-[28px] border border-white/10 bg-black/25 p-5 shadow-2xl backdrop-blur-xl lg:flex lg:flex-col">
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 text-sm font-bold text-black">
                MC
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-100">Mission Control</p>
                <p className="text-xs text-zinc-500">OpenClaw local cockpit</p>
              </div>
            </div>
          </div>

          <nav className="space-y-7">
            {sidebar.map((group) => (
              <div key={group.section}>
                <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-500">
                  {group.section}
                </p>
                <div className="space-y-1.5">
                  {group.items.map((item, index) => {
                    const active = item === "Home";
                    return (
                      <button
                        key={item}
                        className={cx(
                          "flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-sm transition",
                          active
                            ? "bg-white/[0.08] text-zinc-50 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                            : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200",
                        )}
                      >
                        <span>{item}</span>
                        <span className="text-[11px] text-zinc-600">0{index + 1}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-auto rounded-3xl border border-cyan-400/20 bg-cyan-400/8 p-4">
            <p className="text-sm font-medium text-cyan-100">Local-first by design</p>
            <p className="mt-2 text-sm leading-6 text-cyan-50/75">
              Ship the good stuff on localhost first. Fewer moving parts, fewer gremlins.
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <header className="rounded-[28px] border border-white/10 bg-black/25 px-5 py-5 shadow-2xl backdrop-blur-xl lg:px-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                    v1 dashboard
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
                    localhost:3000 ready
                  </span>
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-white lg:text-4xl">
                  Mission Control
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400 lg:text-base">
                  A calm, Linear-inspired launchpad for OpenClaw status, quick actions, health signals,
                  and the next useful thing on deck.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {statusPills.map((pill) => (
                  <div
                    key={pill.label}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{pill.label}</p>
                    <p className="mt-2 text-sm font-semibold text-zinc-100">{pill.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </header>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-6">
              <Panel title="Command bar" eyebrow="Search / launch / inspect">
                <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                  <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-zinc-400">
                    <span className="text-base text-zinc-500">⌘</span>
                    <span className="flex-1">Search tools, jump to logs, run a local command…</span>
                    <span className="rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs text-zinc-500">
                      Ctrl K
                    </span>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <StatCard label="Today" value="7" meta="queued actions" />
                  <StatCard label="Latency" value="42 ms" meta="local gateway response" />
                  <StatCard label="Focus" value="Clean" meta="no active incidents" />
                </div>
              </Panel>

              <Panel title="Tools launcher" eyebrow="Jump in fast">
                <div className="grid gap-4 md:grid-cols-2">
                  {tools.map((tool) => (
                    <button
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
                        <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-xs text-zinc-300">
                          Open
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </Panel>
            </div>

            <div className="grid gap-6">
              <Panel title="OpenClaw status" eyebrow="System">
                <div className="space-y-3">
                  {[
                    ["Gateway daemon", "Running", "Updated 18 seconds ago"],
                    ["Remote URL", "Configured", "Ready for paired devices"],
                    ["Background jobs", "Nominal", "No stuck workers detected"],
                  ].map(([label, value, detail]) => (
                    <div key={label} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-zinc-300">{label}</p>
                        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300">
                          {value}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-zinc-500">{detail}</p>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Health summary" eyebrow="Host posture">
                <div className="space-y-4">
                  {[
                    { label: "CPU", value: "18%", note: "Comfortably bored" },
                    { label: "Memory", value: "61%", note: "Healthy for a local dashboard" },
                    { label: "Disk", value: "72%", note: "Worth watching before the gremlins breed" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-zinc-300">{item.label}</span>
                        <span className="font-medium text-zinc-100">{item.value}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/6">
                        <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" style={{ width: item.value }} />
                      </div>
                      <p className="mt-2 text-xs text-zinc-500">{item.note}</p>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Calendar agenda" eyebrow="Placeholder">
                <div className="space-y-3">
                  {agenda.map((item) => (
                    <div key={item.time} className="flex gap-4 rounded-2xl border border-white/8 bg-black/20 p-4">
                      <div className="w-14 shrink-0 text-sm font-medium text-cyan-300">{item.time}</div>
                      <div>
                        <p className="text-sm font-medium text-zinc-100">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-zinc-500">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
