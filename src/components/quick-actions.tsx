"use client";

import { useState } from "react";

type QuickAction = {
  id: string;
  title: string;
  description: string;
  href?: string;
  command?: string;
  label: string;
};

const actions: QuickAction[] = [
  {
    id: "refresh",
    title: "Refresh local dashboard data",
    description: "Simple browser refresh. Not sexy, but very honest.",
    label: "Refresh",
  },
  {
    id: "gmail-api",
    title: "Open Gmail inbox JSON",
    description: "Inspect the read-only route backed by local gog Gmail reads.",
    href: "/api/gmail/inbox",
    label: "Open route",
  },
  {
    id: "status-api",
    title: "Open OpenClaw status JSON",
    description: "Peek behind the UI and inspect what the gateway probe returned.",
    href: "/api/openclaw",
    label: "Open route",
  },
  {
    id: "copy-status",
    title: "Copy gateway status command",
    description: "Useful when the UI says something weird and you want receipts in a terminal.",
    command: "openclaw gateway status",
    label: "Copy command",
  },
  {
    id: "copy-gmail",
    title: "Copy inbox summary command",
    description: "Read-only gog query for recent inbox threads. Safe, local, boring in the best way.",
    command: "GOG_ACCOUNT=${GOG_ACCOUNT:-tonybigclawbowski@gmail.com} gog gmail search 'in:inbox newer_than:14d' --max 6 --json --no-input",
    label: "Copy command",
  },
  {
    id: "copy-dev",
    title: "Copy local dev run command",
    description: "Handy when you just want the app up without spelunking through docs.",
    command: "npm run dev",
    label: "Copy command",
  },
];

export function QuickActions() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleAction(action: QuickAction) {
    if (action.id === "refresh") {
      window.location.reload();
      return;
    }

    if (action.href) {
      if (action.href.startsWith("http")) {
        window.open(action.href, "_blank", "noreferrer");
      } else {
        window.open(action.href, "_self");
      }
      return;
    }

    if (action.command) {
      await navigator.clipboard.writeText(action.command);
      setCopiedId(action.id);
      window.setTimeout(() => setCopiedId((current) => (current === action.id ? null : current)), 1800);
    }
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {actions.map((action) => {
        const copied = copiedId === action.id;

        return (
          <div key={action.id} className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-zinc-100">{action.title}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-500">{action.description}</p>
              </div>
              <button
                type="button"
                onClick={() => void handleAction(action)}
                className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-zinc-200 transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
              >
                {copied ? "Copied" : action.label}
              </button>
            </div>
            {action.command ? (
              <pre className="mt-3 overflow-x-auto rounded-xl border border-white/8 bg-black/30 px-3 py-2 text-xs text-zinc-400">
                <code>{action.command}</code>
              </pre>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
