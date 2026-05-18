import { getGlossary } from "@/lib/data";
import { GlossaryClient } from "@/components/GlossaryClient";

export const metadata = {
  title: "Glossary · Hachimi 全球电商研究",
  description: "跨境电商专业名词解释库：法规、税务、物流、支付、平台运营、电商指标。",
};

export default function GlossaryPage() {
  const entries = getGlossary();
  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6">
      <header className="border-b border-[var(--color-border)] pb-6">
        <h1 className="text-3xl font-bold tracking-tight">Glossary · 跨境电商名词库</h1>
        <p className="mt-2 text-sm text-[var(--color-text-dim)]">
          {entries.length} 条词条 · 含完整定义、案例、对中国卖家影响、官方参考。
          所有 webapp 文案中的术语都会自动悬浮显示解释。
        </p>
      </header>
      <GlossaryClient entries={entries} />
    </div>
  );
}
