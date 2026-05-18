import { getPolicyEvents, getAllCountries } from "@/lib/data";
import { TimelineClient } from "@/components/TimelineClient";

export const metadata = {
  title: "全球政策时间轴 · Hachimi",
  description: "全球跨境电商政策时间轴 — 关税、VAT、认证要求、数据法、制裁。",
};

export default function TimelinePage() {
  const events = getPolicyEvents();
  const countries = getAllCountries();
  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6">
      <header className="border-b border-[var(--color-border)] pb-6">
        <h1 className="text-3xl font-bold tracking-tight">全球政策时间轴</h1>
        <p className="mt-2 text-sm text-[var(--color-text-dim)]">
          {events.length} 个事件 · 红色 = 未来 30 天内 · 黄色 = 30-90 天 · 灰色 = 已生效
        </p>
      </header>
      <TimelineClient events={events} countries={countries} />
    </div>
  );
}
