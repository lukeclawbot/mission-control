"use client";

import { useEffect, useMemo, useState } from "react";

type Action = {
  id: string;
  label: string;
  description: string;
  href?: string;
  external?: boolean;
  command?: string;
};

const actions: Action[] = [
  {
    id: "openclaw-dashboard",
    label: "Open OpenClaw gateway dashboard",
    description: "Jump to the local OpenClaw UI on 127.0.0.1.",
    href: "http://127.0.0.1:18789/",
    external: true,
  },
  {
    id: "openclaw-json",
    label: "Inspect OpenClaw status JSON",
    description: "Open the local API route backing the status panel.",
    href: "/api/openclaw",
  },
  {
    id: "calendar-json",
    label: "Inspect agenda JSON",
    description: "Open the local API route backed by gog calendar events.",
    href: "/api/calendar/agenda",
  },
  {
    id: "gmail-json",
    label: "Inspect Gmail inbox JSON",
    description: "Open the local read-only Gmail route backed by gog.",
    href: "/api/gmail/inbox",
  },
  {
    id: "jump-openclaw",
    label: "Jump to OpenClaw status section",
    description: "Scroll straight to the system panel.",
    href: "#openclaw-status",
  },
  {
    id: "jump-calendar",
    label: "Jump to calendar agenda section",
    description: "Scroll to the next 7 days of calendar events.",
    href: "#calendar-agenda",
  },
  {
    id: "jump-gmail",
    label: "Jump to Gmail inbox section",
    description: "Scroll to the recent inbox summary.",
    href: "#gmail-inbox",
  },
  {
    id: "jump-actions",
    label: "Jump to quick actions",
    description: "Get to the safe local actions and copyable commands.",
    href: "#quick-actions",
  },
  {
    id: "copy-gateway-status",
    label: "Copy openclaw gateway status command",
    description: "Copy the terminal command used by the dashboard status panel.",
    command: "openclaw gateway status",
  },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return actions;

    return actions.filter((action) => {
      return [action.label, action.description, action.href ?? "", action.command ?? ""].some((field) =>
        field.toLowerCase().includes(normalized),
      );
    });
  }, [query]);

  async function handleAction(action: Action) {
    if (action.command) {
      await navigator.clipboard.writeText(action.command);
      setCopied(action.id);
      window.setTimeout(() => setCopied((current) => (current === action.id ? null : current)), 1800);
      setOpen(false);
      return;
    }

    if (!action.href) return;

    if (action.external) {
      window.open(action.href, "_blank", "noreferrer");
    } else {
      window.open(action.href, "_self");
    }

    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-left text-sm text-zinc-400 transition hover:border-white/15 hover:bg-white/[0.06] hover:text-zinc-200"
      >
        <span className="text-base text-zinc-500">⌘</span>
        <span className="flex-1">Search tools, jump sections, or copy a safe local command…</span>
        <span className="rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs text-zinc-500">
          Ctrl K
        </span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 py-16 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-[#0c0d12] p-4 shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
            <div className="mb-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
              <span className="text-zinc-500">⌘</span>
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search local actions"
                className="w-full border-0 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-zinc-400"
              >
                Esc
              </button>
            </div>

            <div className="space-y-2">
              {filtered.length > 0 ? (
                filtered.map((action) => (
                  <button
                    type="button"
                    key={action.id}
                    onClick={() => void handleAction(action)}
                    className="block w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-left transition hover:border-cyan-400/30 hover:bg-cyan-400/8"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-zinc-100">{action.label}</p>
                        <p className="mt-1 text-sm leading-6 text-zinc-500">{action.description}</p>
                      </div>
                      <span className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[11px] text-zinc-400">
                        {copied === action.id ? "Copied" : action.command ? "Copy" : "Open"}
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-zinc-500">
                  No matches. Apparently even the gremlins came up empty.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
