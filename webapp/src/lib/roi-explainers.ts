/**
 * Per-KPI explainer metadata — name, definition, formula, step-by-step
 * substitution with current input values.
 *
 * The walkthrough always shows actual numbers from the user's inputs so they
 * can verify the math by hand.
 */

import type { RoiInputs, RoiOutputs } from "./roi";

export type KpiExplainer = {
  name: string;
  description: string;
  formula: string;
  walkthrough: { step: string }[];
  /** Optional doc note pulled from ROI公式合集 v1.0. */
  doc_note?: string;
  /** Optional health-line hint. */
  health_hint?: string;
};

const $ = (n: number, digits = 2) =>
  Number.isFinite(n)
    ? `${n < 0 ? "-" : ""}$${Math.abs(n).toFixed(digits)}`
    : "∞";
const pct = (n: number, digits = 2) => `${n.toFixed(digits)}%`;
const x = (n: number, digits = 2) =>
  Number.isFinite(n) ? `${n.toFixed(digits)}x` : "∞";

export type KpiKey =
  | "NetSales"
  | "Profit_kept"
  | "Profit_returned"
  | "E_unit"
  | "AdCost_per_order"
  | "PerUnitNetProfit"
  | "N"
  | "G"
  | "TotalSales"
  | "TotalNetProfit"
  | "ROI_marginal"
  | "Net_ROI"
  | "ROAS"
  | "BreakEvenROAS"
  | "MER"
  | "GrossMargin"
  | "ContributionMargin"
  | "NetProfitMargin";

export function getExplainer(
  key: KpiKey,
  r: RoiOutputs,
  i: RoiInputs,
): KpiExplainer {
  // Pre-compute decimal versions of percentage inputs for the walkthrough display
  const d = (i.d_pct / 100).toFixed(3);
  const t = (i.t_pct / 100).toFixed(3);
  const c = (i.c_pct / 100).toFixed(3);
  const a = (i.a_pct / 100).toFixed(3);
  const RR = (i.RR_pct / 100).toFixed(3);
  const CTR = (i.CTR_pct / 100).toFixed(4);
  const CVR = (i.CVR_pct / 100).toFixed(4);

  switch (key) {
    case "NetSales":
      return {
        name: "NetSales · 净销售额",
        description:
          "客户实付后剔除折扣、剔除 VAT 的入账金额。这是后续所有利润/比率计算的分母基础。",
        formula: "NetSales = P × (1 - d) / (1 + t)",
        walkthrough: [
          { step: `= ${i.P} × (1 - ${d}) / (1 + ${t})` },
          { step: `= ${i.P} × ${(1 - i.d_pct / 100).toFixed(3)} / ${(1 + i.t_pct / 100).toFixed(3)}` },
          { step: `= ${$(r.NetSales)}` },
        ],
        doc_note:
          "🇺🇸 US sales tax 客户付不进入商家收入 → t=0；🇪🇺 VAT 含价 → 必须除 (1+t) 抵扣。",
      };

    case "Profit_kept":
      return {
        name: "Profit_kept · 保单利润",
        description:
          "订单送达且客户保留时的单笔毛利。扣掉平台抽佣 c、达人分成 a、单件物流 SC、出厂价 COGS。这条件触发概率 = 1 - RR。",
        formula: "Profit_kept = NetSales × (1 - c - a) - SC - COGS",
        walkthrough: [
          { step: `= ${$(r.NetSales)} × (1 - ${c} - ${a}) - ${i.SC} - ${i.COGS}` },
          {
            step: `= ${$(r.NetSales)} × ${(1 - i.c_pct / 100 - i.a_pct / 100).toFixed(3)} - ${$(i.SC + i.COGS)}`,
          },
          { step: `= ${$(r.NetSales * (1 - i.c_pct / 100 - i.a_pct / 100))} - ${$(i.SC + i.COGS)}` },
          { step: `= ${$(r.Profit_kept)}` },
        ],
      };

    case "Profit_returned":
      return {
        name: "Profit_returned · 返单损失",
        description:
          "弃货模式 (路径 A) 下退单的损失：钱全退给客户，付出的物流 + 货值 + Stripe 不退的手续费 U。这条件触发概率 = RR。",
        formula: "Profit_returned = -(SC + COGS + U)",
        walkthrough: [
          { step: `= -(${i.SC} + ${i.COGS} + ${i.U})` },
          { step: `= ${$(r.Profit_returned)}` },
        ],
        doc_note:
          "退货时不是又损失一次 SC+COGS——发货已经发生、运费已经付了，只是失去了销售收入，再补 Stripe 不退的 U。",
      };

    case "E_unit":
      return {
        name: "E_unit · 单笔预期贡献毛利",
        description:
          "用退货率加权后的单笔毛利（不含广告费）：(1-RR)×保单利润 + RR×返单损失。这是衡量单笔订单经济性的核心指标。",
        formula:
          "E_unit = (1-RR) × NetSales × (1-c-a) - (SC + COGS) - RR × U",
        walkthrough: [
          {
            step: `= (1 - ${RR}) × ${$(r.NetSales)} × (1 - ${c} - ${a}) - (${i.SC} + ${i.COGS}) - ${RR} × ${i.U}`,
          },
          {
            step: `= ${(1 - i.RR_pct / 100).toFixed(3)} × ${$(r.NetSales)} × ${(1 - i.c_pct / 100 - i.a_pct / 100).toFixed(3)} - ${$(i.SC + i.COGS)} - ${$((i.RR_pct / 100) * i.U)}`,
          },
          {
            step: `= ${$((1 - i.RR_pct / 100) * r.NetSales * (1 - i.c_pct / 100 - i.a_pct / 100))} - ${$(i.SC + i.COGS)} - ${$((i.RR_pct / 100) * i.U)}`,
          },
          { step: `= ${$(r.E_unit)}` },
        ],
        doc_note:
          "⚠ 关键点：(SC+COGS) 不乘 (1-RR)，因为退货时这两项已经付出去了。代数化简：(1-RR)·(SC+COGS) + RR·(SC+COGS) = (SC+COGS)。",
      };

    case "AdCost_per_order":
      return {
        name: "AdCost_per_order · 每订单广告费",
        description:
          "1 个订单平摊的广告成本：要让 1 个曝光变订单，需穿越 CTR (点击率) 和 CVR (转化率) 两层漏斗。",
        formula: "AdCost_per_order = CPM / (1000 × CTR × CVR)",
        walkthrough: [
          { step: `= ${i.CPM} / (1000 × ${CTR} × ${CVR})` },
          {
            step: `= ${i.CPM} / ${(1000 * (i.CTR_pct / 100) * (i.CVR_pct / 100)).toFixed(4)}`,
          },
          { step: `= ${$(r.AdCost_per_order)}` },
        ],
      };

    case "PerUnitNetProfit":
      return {
        name: "单笔净利 (Per-Unit Net Profit)",
        description: "单笔订单净利 = 贡献毛利 - 每订单广告费。",
        formula: "Per-Unit Net Profit = E_unit - AdCost_per_order",
        walkthrough: [
          { step: `= ${$(r.E_unit)} - ${$(r.AdCost_per_order)}` },
          { step: `= ${$(r.PerUnitNetProfit)}` },
        ],
        health_hint:
          "为负 = 每多卖一单多亏一单的钱。需要提高 CTR/CVR 或降低 CPM 才能转正。",
      };

    case "N":
      return {
        name: "N · 总订单数 (来自广告)",
        description:
          "在 AC 预算下，按当前 CPM/CTR/CVR 推算出的订单数。也是 AC ÷ AdCost_per_order。",
        formula: "N = AC × 1000 × CTR × CVR / CPM",
        walkthrough: [
          {
            step: `= ${i.AC} × 1000 × ${CTR} × ${CVR} / ${i.CPM}`,
          },
          {
            step: `= ${(i.AC * 1000 * (i.CTR_pct / 100) * (i.CVR_pct / 100)).toFixed(2)} / ${i.CPM}`,
          },
          { step: `= ${r.N.toFixed(2)} 单` },
        ],
      };

    case "G":
      return {
        name: "G · 总贡献毛利 (不含广告)",
        description:
          "所有订单的贡献毛利累加。是 ROI 的分子。注意：还没扣广告费 AC。",
        formula: "G = N × E_unit",
        walkthrough: [
          { step: `= ${r.N.toFixed(2)} × ${$(r.E_unit)}` },
          { step: `= ${$(r.G)}` },
        ],
      };

    case "TotalSales":
      return {
        name: "Total Sales · 总销售额",
        description: "所有订单的净销售额累加。用于 ROAS 和 MER 计算。",
        formula: "Total Sales = N × NetSales",
        walkthrough: [
          { step: `= ${r.N.toFixed(2)} × ${$(r.NetSales)}` },
          { step: `= ${$(r.TotalSales, 0)}` },
        ],
      };

    case "TotalNetProfit":
      return {
        name: "Total Net Profit · 总净利",
        description: "贡献毛利总和减去广告投入 = 最终归你的净利。",
        formula: "Total Net Profit = G - AC",
        walkthrough: [
          { step: `= ${$(r.G)} - ${i.AC}` },
          { step: `= ${$(r.TotalNetProfit)}` },
        ],
      };

    case "ROI_marginal":
      return {
        name: "ROI (Marginal) · 边际 ROI",
        description:
          "每投 $1 广告产生多少 $ 贡献毛利。Triple Whale、Northbeam 等工具默认口径。",
        formula: "ROI = G / AC",
        walkthrough: [
          { step: `= ${$(r.G)} / ${i.AC}` },
          { step: `= ${x(r.ROI_marginal)}` },
        ],
        health_hint: ">1x 即盈利；家居家具健康 1.5-3x；>3x 优秀。",
      };

    case "Net_ROI":
      return {
        name: "Net ROI · 净 ROI",
        description: "财务报表口径。本质是 ROI - 1（同一指标的另一种表达）。",
        formula: "Net ROI = (G - AC) / AC = ROI - 1",
        walkthrough: [
          { step: `= (${$(r.G)} - ${i.AC}) / ${i.AC}` },
          { step: `= ${pct(r.Net_ROI * 100, 1)}` },
        ],
      };

    case "ROAS":
      return {
        name: "ROAS · Return on Ad Spend",
        description:
          "广告花的钱换回的销售额倍数。不考虑成本，所以 ROAS 高不等于赚钱（要对比 Break-Even ROAS）。",
        formula: "ROAS = Total Sales / AC = N × NetSales / AC",
        walkthrough: [
          { step: `= ${$(r.TotalSales, 0)} / ${i.AC}` },
          { step: `= ${x(r.ROAS)}` },
        ],
        health_hint: "家居家具健康 3-5x；>5x 优秀；< Break-Even ROAS 即亏损。",
      };

    case "BreakEvenROAS":
      return {
        name: "Break-Even ROAS · 保本 ROAS",
        description:
          "实际 ROAS 必须 > 这个值才能赚钱。本质是 NetSales 与 E_unit 的比例。",
        formula: "Break-Even ROAS = NetSales / E_unit",
        walkthrough: [
          { step: `= ${$(r.NetSales)} / ${$(r.E_unit)}` },
          { step: `= ${x(r.BreakEvenROAS)}` },
        ],
        health_hint: "保本 < 2x 优秀；2-3x 健康；>4x 淘汰。",
      };

    case "MER":
      return {
        name: "MER · Marketing Efficiency Ratio",
        description:
          "跨渠道总账：总销售额 ÷ 总广告花费。建议早期关注（避免多渠道归因双计）。",
        formula: "MER = Total Sales / Total Ad Spend",
        walkthrough: [
          { step: `= ${$(r.TotalSales, 0)} / ${i.AC}` },
          { step: `= ${x(r.MER)}` },
        ],
        health_hint: ">4x 优秀；2.5-4x 健康；<1.5x 淘汰。",
      };

    case "GrossMargin":
      return {
        name: "毛利率 (Gross Margin)",
        description: "财报口径。只看销售 vs 货值，不算物流、平台、广告。",
        formula: "Gross Margin = (NetSales - COGS) / NetSales",
        walkthrough: [
          {
            step: `= (${$(r.NetSales)} - ${$(i.COGS)}) / ${$(r.NetSales)}`,
          },
          { step: `= ${$(r.NetSales - i.COGS)} / ${$(r.NetSales)}` },
          { step: `= ${pct(r.GrossMargin * 100, 1)}` },
        ],
        health_hint: "家居家具健康 50-70%。",
      };

    case "ContributionMargin":
      return {
        name: "贡献毛利率 (Contribution Margin)",
        description:
          "投放决策口径。每一单毛利占净销售的比例。这是判断「广告能不能跑得动」的关键比率。",
        formula: "Contribution Margin = E_unit / NetSales",
        walkthrough: [
          { step: `= ${$(r.E_unit)} / ${$(r.NetSales)}` },
          { step: `= ${pct(r.ContributionMargin * 100, 1)}` },
        ],
        health_hint: "家居家具健康 30-45%；>45% 优秀；<20% 难做广告。",
      };

    case "NetProfitMargin":
      return {
        name: "净利率 (Net Profit Margin)",
        description: "真实盈亏：单笔净利 ÷ 净销售额。最终归你的那一刀。",
        formula: "Net Profit Margin = Per-Unit Net Profit / NetSales",
        walkthrough: [
          { step: `= ${$(r.PerUnitNetProfit)} / ${$(r.NetSales)}` },
          { step: `= ${pct(r.NetProfitMargin * 100, 1)}` },
        ],
        health_hint: "目标 5-15%；>15% 优秀；<0% 亏损。",
      };
  }
}
