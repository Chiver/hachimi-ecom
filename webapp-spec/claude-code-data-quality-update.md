# Claude Code 升级 Brief — 数据质量警示 + Source 可追溯

> **背景**：Cowork 完成了 31 国 JSON 数据质量审计，发现大量字段是 Hachimi 估算而非 Statista 直接提取。所有 31 国 JSON 已加 `_data_quality_warning` 字段并降级 confidence。
> **核心要求**：webapp 必须明显标识哪些数据可信、哪些是估算，让用户决策时不被误导。
> **使用方式**：在终端 `cd ~/Desktop/hachimi-ecom/webapp && claude`（继续之前的 Claude Code session 即可），把下面的 COMMAND 整段粘贴。

---

## COPY-PASTE COMMAND（直接粘贴给 Claude Code）

```
我刚完成了 31 国数据的诚实审计 + confidence 降级。请按以下 6 步升级 webapp 让数据质量可视化，不要让用户被估算数据误导。

【前置阅读】
1. /Users/chiev/Desktop/hachimi-ecom/DATA-QUALITY-AUDIT.md（污染清单）
2. /Users/chiev/Desktop/hachimi-ecom/data/countries/bra.json（看 _data_quality_warning 长什么样）
3. /Users/chiev/Desktop/hachimi-ecom/data/countries/poland.json（高质量参考）

【关键事实】
- 32 国中只有 1 国（波兰）数据是人工 PDF 提取的，confidence=H
- 31 国的 ecommerce_market.gmv_total_usd_million、platforms[].gmv_usd_million、
  category_metrics[].gmv_usd_million、payments[].share_pct 等核心字段都是 Hachimi 估算 (confidence=L)
- World Bank 宏观数据、Statista CAGR/cross-border xlsx 数据是真实的 (confidence=H)
- 44 个品类（西班牙/法国/意大利/瑞典/挪威/越南/菲律宾/阿根廷的若干品类）已升级为 Statista 真实 %

【任务清单 - 严格按序】

### Step 1: 同步最新 JSON 到 webapp
- cp /Users/chiev/Desktop/hachimi-ecom/data/countries/*.json webapp/src/data/countries/
- 复制 31 国 + poland.json，共 32 个文件
- 跑 pnpm validate 确保 schema 通过（如果失败，按之前模式：改 types.ts 让字段更宽容，不要改 JSON）

### Step 2: 类型扩展
- webapp-spec/types.ts 增加 CountryDataSchema 顶层字段 `_data_quality_warning`：
  ```typescript
  _data_quality_warning: z.object({
    status: z.string(),
    warning: z.string(),
    trusted_fields: z.array(z.string()).optional(),
    polluted_fields: z.array(z.string()).optional(),
    raw_pdf_extract_path: z.string().optional(),
    remediation_plan: z.string().optional(),
    audited_at: z.string().optional(),
  }).optional()
  ```
- 同步到 src/types/index.ts

### Step 3: 创建 <DataQualityBanner> 组件
- 位置：每个国家详情页顶部、KPI 卡片之上
- 如果 country._data_quality_warning 存在：
  - 黄色横幅（warning 色），左侧大警示图标
  - 文案：「数据质量提示」+ warning 内容
  - 右侧"查看详情"按钮 → 弹出 Modal 显示完整 polluted_fields 列表 + raw_pdf_extract_path
- 如果没有 _data_quality_warning（仅波兰）：
  - 绿色横幅（success 色）：「✓ 本国数据已人工核实，所有数值可追溯到 Statista 原文页码」

### Step 4: 重做 <SourceBadge> 组件 ⭐️ 核心
现状：圆点 + hover tooltip 显示 source_name
升级目标：

- 显示规则：
  - 数据点旁边显示彩色圆点（H 绿 / M 黄 / L 灰）
  - 鼠标 hover 显示一个 popup 卡片，含：
    - **source_name**（如 "Statista E-commerce in Brazil Dossier - page 14"）
    - **source_url**（点击可打开/复制）
    - **source_quote**（如 "Fashion & accessories: 10.4% of revenues"）
    - **fetched_at**（抓取时间）
    - **confidence**（带等级解释：H=政府/官方/Statista 直接 / M=Hachimi 计算自真值 / L=Hachimi 估算）
    - **warning**（如有）：红色文字显示警告
    - **formula**（如有）：显示计算公式
- 点击 source_url 行为：
  - 如果 source_url 以 "data/raw/" 开头（本地 PDF）：
    - 不能直接打开（浏览器无文件访问权）
    - 显示按钮 "复制路径到剪贴板"
    - 显示提示："在 Mac Finder 中前往：~/Desktop/hachimi-ecom/{source_url}#page=14"
  - 如果是 http/https URL：target="_blank" 新窗口打开

### Step 5: 国家详情页 - 每个数据点都必须用 <SourceBadge>
检查以下页面，确保所有显示的数字旁都有 SourceBadge：
- 概览 KPI 卡片（GMV、CAGR、人均、跨境占比 → 每个都要）
- 平台 tab（GMV、市占、抽佣 → 每个都要）
- 品类 tab（GMV 或 % → 每个都要；显示 category_share_pct 如果有）
- 支付 tab（每个支付方式的 share_pct）
- 物流 tab（LPI 评分等）
- 流量 tab（CPM、CPC）
- 中国卖家 tab（Top 100 卖家数）

### Step 6: 首页地图 - 国家"可信度徽章"
- 32 国地图悬浮卡片右上角，加一个小徽章：
  - 波兰：绿色 ✓ "数据已核实"
  - 其他 31 国：黄色 ⚠ "数据估算中"
- 这样用户在首页就能立刻分辨

### Step 7: 全局 <DataQualityGuide> 模态
- 顶部导航加一个"数据质量说明"按钮
- 点击弹出说明文档：
  - H 绿色：政府 API、Statista 官方报告、上市公司财报、World Bank
  - M 黄色：Hachimi 基于真值计算（如 per_capita_spend = GMV / buyers）
  - L 灰色：Hachimi 领域估算（待 PDF 校对或付费工具验证）
- 链接到 DATA-QUALITY-AUDIT.md 完整审计文档

### Step 8: 验收
- pnpm dev 跑通
- 打开任意非波兰国家（如巴西）：
  - 顶部应见黄色"数据质量提示"横幅
  - KPI 卡片每个数字旁有灰色 L 徽章
  - hover 任意 L 徽章应见"Hachimi 估算"warning + raw_pdf_extract_path 引用
- 打开波兰：
  - 顶部应见绿色"数据已核实"横幅
  - KPI 数字旁是绿色 H 徽章
  - hover 应见 "Statista E-commerce in Poland Dossier - page X"
- 首页地图：波兰悬浮卡有 ✓，其他 31 国有 ⚠
- 顶部"数据质量说明"按钮可点开

【报告节奏】
每完成一个 Step 一句话报告。完成 Step 8 后，截图（如果可以）或简述地图首页 + 巴西详情页 + 波兰详情页的视觉对比。

开始吧。
```

---

## 升级后的用户体验

**首页地图**：
- 32 国全部点亮 + 颜色按 composite_score
- 波兰悬浮卡片显示 ✓ "数据已核实"
- 其他 31 国显示 ⚠ "数据估算中"

**国家详情页（巴西示例）**：
```
┌─────────────────────────────────────────────────┐
│ ⚠️  数据质量提示                                 │
│ 本国数据由 Cowork Phase 2-3 批量生成器产出，   │
│ 部分字段（GMV、平台市占、品类细分…）为 Hachimi │
│ 估算，confidence=L。决策前建议人工核对 Statista│
│ 原文。                                  [查看详情]│
└─────────────────────────────────────────────────┘

┌─── KPI Cards ───┐
│ Hachimi 评分  62  │ ⚪ L     ← 灰色徽章
│ GMV 2024  $50B   │ ⚪ L     ← 灰色徽章
│ CAGR     4.85%   │ 🟢 H    ← 绿色徽章（Statista 真值）
│ 跨境占比  17.49% │ 🟢 H    ← 绿色徽章
└──────────────────┘
```

**Hover 灰色 L 徽章**：
```
┌────────────────────────────────────────────────────┐
│ source_name: Hachimi 领域知识估算                  │
│              （未直接从 Statista PDF 提取）         │
│ source_url:  data/raw/statista_extracted/bra.json  │
│              📋 复制路径                            │
│ confidence:  L · Hachimi 估算                      │
│ ⚠️ warning:  待人工校对 Statista 原文精确化         │
│ fetched_at:  2026-05-17                            │
└────────────────────────────────────────────────────┘
```

**Hover 绿色 H 徽章（波兰 Fashion 例）**：
```
┌────────────────────────────────────────────────────┐
│ source_name: Statista E-commerce in Poland         │
│              Dossier - p.44 Total amount spent     │
│              in consumer e-commerce categories     │
│ source_url:  data/raw/statista/study_id59880_      │
│              e-commerce-in-poland.pdf#page=44      │
│ source_quote: "Fashion: $8.74B (2025 estimate)"    │
│ confidence:  H · Statista 官方报告                  │
│ fetched_at:  2026-05-17                            │
└────────────────────────────────────────────────────┘
```

---

## 完成后下一步（Phase 2.5）

升级完 UI 后，剩下的工作是 Cowork 端逐国 Statista PDF 人工校对。
工作量：31 国 × 30-60 分钟 ≈ 15-30 小时。
优先级：美国 / 英国 / 德国 / 日本 / 印尼 / 巴西 / 印度（核心战略市场）先做。

每完成一国，Cowork 输出 `data/countries/{iso}.json` 更新版本，
用户跑 `cp data/countries/*.json webapp/src/data/countries/` 即可同步。
