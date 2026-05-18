import Link from "next/link";
import { Globe2, GitCompareArrows, CalendarClock, BookText } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "全球地图", icon: Globe2 },
  { href: "/compare", label: "国家对比", icon: GitCompareArrows },
  { href: "/timeline", label: "政策时间轴", icon: CalendarClock },
  { href: "/glossary", label: "Glossary", icon: BookText },
];

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg-from)]/80 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-screen-2xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2">
          <span
            className="inline-block size-2.5 rounded-full"
            style={{ background: "var(--color-primary)" }}
          />
          <span className="font-semibold tracking-tight">Hachimi 全球电商</span>
          <span className="ml-1 rounded-md border border-[var(--color-border)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-dim)]">
            v1 · 静态
          </span>
        </Link>
        <ul className="ml-4 flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-[var(--color-text-dim)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
              >
                <Icon className="size-4" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
