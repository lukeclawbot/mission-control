"use client";

type SidebarGroup = {
  section: string;
  items: { label: string; href: string }[];
};

function targetIdFromHref(href: string) {
  return href.startsWith("#") ? href.slice(1) : href;
}

export function SidebarNav({ groups }: { groups: SidebarGroup[] }) {
  function handleClick(href: string) {
    const targetId = targetIdFromHref(href);
    const element = document.getElementById(targetId);

    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", href);
      return;
    }

    window.location.hash = href;
  }

  return (
    <nav className="space-y-7">
      {groups.map((group) => (
        <div key={group.section}>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-500">
            {group.section}
          </p>
          <div className="space-y-1.5">
            {group.items.map((item, index) => {
              const active = item.label === "Home";
              return (
                <button
                  type="button"
                  key={item.label}
                  onClick={() => handleClick(item.href)}
                  className={[
                    "flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-sm transition",
                    active
                      ? "bg-white/[0.08] text-zinc-50 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                      : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200",
                  ].join(" ")}
                >
                  <span>{item.label}</span>
                  <span className="text-[11px] text-zinc-600">0{index + 1}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
