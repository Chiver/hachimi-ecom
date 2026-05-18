# Claude Code 启动 Brief — Hachimi 全球电商研究 Webapp（静态版）

> **架构决定**：v1 采用**纯静态**架构（Next.js 15 + 直接 import JSON），不使用 Supabase/Drizzle。
> 数据量小（~1MB）、写操作几乎为零、单团队内部使用，静态足够且更快更省。
> 未来 v2 真有需要时再迁移到 DB，JSON schema 与 DB 表 1:1，迁移成本低。
>
> **使用方式**：在终端 `cd ~/Desktop/hachimi-ecom && claude`，把下面 **"COPY-PASTE COMMAND"** 整段粘贴给 Claude Code。
> **预计工时**：30-60 分钟出 v0。

---

## 一、COPY-PASTE COMMAND（直接粘贴）

```
我要你为我搭建一个 Next.js 15 全静态的全球电商市场调研 webapp。无数据库、无后端。

【架构原则】
- 纯静态：所有数据从 src/data/ 下的 JSON 文件直接 import
- 类型安全：用 webapp-spec/types.ts 提供的 Zod schema 在 build/dev 期校验所有 JSON
- 全部 SSG：所有页面 generateStaticParams 预渲染，零运行时数据请求
- 部署目标：Vercel（pnpm build → 静态资源），完全免费
- 后续加数据：往 src/data/countries/ 加 JSON → git push → Vercel 自动 redeploy

【前置阅读 - 严格按序】
1. /Users/chiev/Desktop/hachimi-ecom/PROJECT-IMPLEMENTATION.md（项目背景）
2. /Users/chiev/Desktop/hachimi-ecom/webapp-spec/schema.md（数据模型，理解概念用）
3. /Users/chiev/Desktop/hachimi-ecom/webapp-spec/types.ts（TS 类型 + Zod 校验，直接复制使用）
4. /Users/chiev/Desktop/hachimi-ecom/webapp-spec/glossary.json（25 词条种子数据）
5. /Users/chiev/Desktop/hachimi-ecom/data/countries/poland.json（波兰示范国，严格符合 schema）
6. /Users/chiev/Desktop/hachimi-ecom/webapp-spec/wireframes/*.svg（UI 草图）
7. /Users/chiev/Desktop/hachimi-ecom/data/raw/free-apis/worldbank_macro.json（32 国宏观数据）

【任务清单 - 按顺序完成，每完成一项报告进度】

### Step 1: 项目初始化
- 在 /Users/chiev/Desktop/hachimi-ecom/webapp/ 用 pnpm 初始化 Next.js 15 App Router 项目
  - TypeScript strict mode，Tailwind CSS，src 目录结构，App Router，无 src/app/api（不需要）
- 安装依赖：
  - 核心: zod
  - 地图: mapbox-gl react-map-gl d3-geo @types/d3-geo
  - 图表: recharts
  - UI: shadcn/ui（手动 init，dark mode）+ lucide-react

### Step 2: 复制类型定义和种子数据
- 复制 webapp-spec/types.ts → src/types/index.ts
- 创建 src/data/countries/ 目录，复制 data/countries/poland.json 进去
- 创建 src/data/glossary.json，复制 webapp-spec/glossary.json
- 创建 src/data/countries-meta.json，包含 32 国基础信息（iso/name/region/flag）
  - 从 types.ts 中的 RegionEnum 派生大区，国家清单参考 PROJECT-IMPLEMENTATION.md
- 写 src/lib/data.ts，导出：
  - getAllCountries(): Country[]
  - getCountryData(iso: string): CountryData | null
  - getGlossary(): GlossaryEntry[]
  - getPolicyEvents(): PolicyEvent[]（从所有 country.policy_events 汇总）
- 在导出前用 Zod schema 校验，失败时抛 build error（防止数据脏）

### Step 3: 全局布局
- src/app/layout.tsx：dark mode 默认、字体 system-ui
- src/components/nav/TopNav.tsx：顶部导航（地图 / 国家对比 / 政策时间轴 / Glossary）
- 配色：背景 #0a0e27 → #1a1f3a 渐变；主色 emerald-500 #10b981

### Step 4: 首页地图 /
- src/app/page.tsx：全屏 Mapbox 世界地图
- react-map-gl，初始视角 (lat=20, lng=10, zoom=1.5)
- 加载 world-110m TopoJSON（https://github.com/topojson/world-atlas 的 110m 版本）
- 用 d3-geo 把 TopoJSON 转 GeoJSON 后用 Layer 叠到 Mapbox
- 国家填色 = hachimi_scores.composite_score（绿色渐变，无评分国家灰色）
- Hover：右侧 240px 浮窗显示 5 个 KPI（参考 wireframes/01-homepage-map.svg）
- Click：跳 /country/[iso_alpha3]
- env 只需 NEXT_PUBLIC_MAPBOX_TOKEN

### Step 5: 国家详情页 /country/[iso]
- src/app/country/[iso]/page.tsx
- generateStaticParams：为 src/data/countries/ 下所有 JSON 文件预渲染
- 8 个 tab（用 shadcn/ui Tabs）：
  1. 概览 (默认) — KPI 卡片 + 电商体量预测图（recharts）
  2. 平台 — Top 5 平台表格
  3. 品类 — 12 大类热力图 + 增速
  4. 支付物流 — payments + logistics
  5. 合规与政策 — compliance 列表 + policy_events 时间轴
  6. 流量经济 — CPM/CPC 表格
  7. 中国卖家 — china_seller_density 详情
  8. 入市建议 — hachimi_scores rationale + recommended_entry_mode
- 参考 wireframes/02-country-detail.svg
- 数据不全的字段显示「待补」徽章，绝不编造

### Step 6: 数据源追溯组件 ⭐️ 核心
- src/components/SourceBadge.tsx
- 接收 source_metadata 中的某个字段 source 对象
- 显示彩色小圆点（H=绿/M=黄/L=灰），半径 6-8px
- Hover → Tooltip 显示 source_name + fetched_at + confidence
- Click → Popover 显示完整 source URL（若是 data/raw/... 本地路径，提示用户文件位置；若是 URL，新窗口打开）
- 全 UI 凡是有 source_metadata 的字段都用 <SourceBadge> 包裹

### Step 7: Glossary 系统
- src/components/GlossaryTerm.tsx：接收 term prop，从 glossary.json 查
  - Hover Tooltip：short_def
  - Click Modal：term_full + term_zh + full_def + example_case + seller_impact + reference_urls
- src/app/glossary/page.tsx：所有 25+ 词条搜索 + 分类筛选
- 在 webapp 文案中所有 glossary term 自动用 <GlossaryTerm term="GPSR"> 包裹

### Step 8: 政策时间轴 /timeline
- src/app/timeline/page.tsx
- 从 getPolicyEvents() 汇总所有国家的 policy_events
- 横向时间轴（recharts ScatterChart 或自定义）
- 过期事件灰色；未来 30 天红色高亮；30-90 天黄色
- 筛选器：按国家 / 品类 / 严重度

### Step 9: 国家对比 /compare
- src/app/compare/page.tsx
- 多选 2-4 国（默认选 2 个，最多 4 个）
- 表格 + 雷达图（recharts RadarChart）对比 hachimi_scores 5 个维度
- 关键指标横向并排

### Step 10: 构建脚本 + 部署文档
- scripts/validate-data.ts：开发期跑，校验 src/data/ 下所有 JSON 符合 Zod schema
- 在 package.json 加 "validate": "tsx scripts/validate-data.ts"
- 在 "build": "pnpm validate && next build"（构建前强制校验）
- README.md：
  - 本地开发：pnpm dev
  - 加新国家数据：把 JSON 放 src/data/countries/，pnpm dev 自动校验
  - Vercel 部署：连 GitHub repo，一键
- docs/data-update-flow.md：Cowork 交付新国家 JSON → 复制到 src/data/countries/ → git push → Vercel 自动 redeploy

【设计规范】
- 配色：dark mode，背景 #0a0e27 → #1a1f3a 渐变，主色 #10b981
- 字体：system-ui 默认
- 圆角统一 8px / 12px
- 不要任何 emoji 装饰（除国旗 emoji + 极少必要场景）
- 中文为主，专业术语保留英文
- 全部组件函数式 + TypeScript strict

【数据约定 - 严格遵守】
- 凡是带 source_metadata 字段的数值，UI 必须显示 SourceBadge，否则视为 bug
- 任何 AI 推算字段（hachimi_scores 等）必须显示「Hachimi 计算」徽章
- 缺失数据用「待补」徽章，绝不编造
- glossary term 在 UI 文案中自动包裹 <GlossaryTerm>

【完成定义】
- 本地 pnpm dev 能跑
- pnpm validate 校验全部 JSON 通过
- 首页地图加载 < 3 秒，波兰显示绿色高分
- 点击波兰可进详情页，所有 8 个 tab 有内容
- Glossary 悬浮 + 点击 modal 可用
- 数据源追溯（SourceBadge）可点击查看 URL
- /timeline 页能看到 GPSR + CBAM 两个事件
- /compare 页能选 2-4 国并显示雷达图
- 其他 31 国地图灰色，点击进去显示「数据待补」占位页

【报告节奏】
每完成一个 Step，一句话报告进度，立刻继续下一个 Step。
遇到不确定的设计决策，按本 brief 中"关键设计决策"章节做，不要停。
所有问题统一记到 webapp/questions.md，最后一次性问我。

我需要你的只是一个 token：
- NEXT_PUBLIC_MAPBOX_TOKEN（Mapbox 免费层 token）
准备好了就开始。
```

---

## 二、关键设计决策（Claude Code 卡住时用此覆盖）

| 决策点 | 答案 |
|---|---|
| 数据库 | 不用，纯 JSON import |
| ORM | 不用，用 Zod 做类型 + 校验 |
| Mapbox vs Leaflet | Mapbox（视觉好，token 免费层够） |
| 国家边界数据 | world-atlas 110m TopoJSON（npm install 或 fetch 都可） |
| State 管理 | React 内置 useState/useReducer，不要 Zustand/Redux |
| 多语言 | v1 中文 UI（专业术语保留英文） |
| 认证 | 不需要（内部公开工具） |
| API Routes | 不需要（纯静态） |
| Image 优化 | next/image 默认 |
| 部署 | Vercel Hobby tier（免费） |
| env 变量 | 只需 NEXT_PUBLIC_MAPBOX_TOKEN |

---

## 三、目录结构

```
~/Desktop/hachimi-ecom/webapp/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                     # 首页地图
│   │   ├── country/[iso]/page.tsx       # 国家详情（SSG）
│   │   ├── compare/page.tsx
│   │   ├── timeline/page.tsx
│   │   └── glossary/page.tsx
│   ├── components/
│   │   ├── nav/TopNav.tsx
│   │   ├── map/WorldMap.tsx
│   │   ├── country/{KpiCards,PlatformTable,CategoryHeatmap,...}.tsx
│   │   ├── SourceBadge.tsx              # ⭐️ 核心
│   │   ├── GlossaryTerm.tsx             # ⭐️ 核心
│   │   └── ui/...                       # shadcn 生成
│   ├── data/                             # 全部数据
│   │   ├── countries/poland.json
│   │   ├── countries-meta.json           # 32 国基础信息
│   │   └── glossary.json
│   ├── lib/
│   │   ├── data.ts                      # getCountryData 等读取函数
│   │   └── validation.ts                # build/dev 期校验
│   └── types/
│       └── index.ts                      # 复制自 webapp-spec/types.ts
├── scripts/
│   └── validate-data.ts
├── public/
│   └── world-110m.json                   # TopoJSON 离线版本
├── .env.local
├── .env.example
├── README.md
├── docs/data-update-flow.md
└── package.json
```

---

## 四、用户准备好的资源

| 资源 | 状态 | Claude Code 用法 |
|---|---|---|
| Statista 报告（30+ 份） | ✅ `data/raw/statista/` | 不直接用（Cowork 解析后产 JSON） |
| World Bank 32 国宏观 | ✅ `data/raw/free-apis/worldbank_macro.json` | Step 2 用来生成 countries-meta.json |
| 波兰示范 JSON | ✅ `data/countries/poland.json` | Step 2 复制到 src/data/ |
| Mapbox Token | 用户进度 | env 配置 |

**不再需要**：Supabase 账号、Drizzle、DATABASE_URL（去掉了这些就少了一堆配置）。

---

## 五、Cowork ↔ Claude Code 协作协议（更新）

```
┌─────────────────────┐                ┌─────────────────────┐
│   Cowork (Claude)   │                │   Claude Code       │
│   研究 + 数据产出     │                │   工程实现 + 部署     │
├─────────────────────┤                ├─────────────────────┤
│ • 调研 + 文档         │                │ • Next.js 静态 UI    │
│ • 输出 country JSON   │ ──json file──→ │ • Mapbox 地图        │
│ • Schema/types 制定   │                │ • SourceBadge        │
│ • Glossary 撰写       │                │ • GlossaryTerm       │
│ • Wireframe          │                │ • Vercel 部署         │
└─────────────────────┘                └─────────────────────┘
            │                                      │
            └──共享 ~/Desktop/hachimi-ecom/────────┘
```

**新国家上线流程**（极其简单）：
1. Cowork 输出 `data/countries/germany.json`
2. 用户 / Claude Code 复制到 `webapp/src/data/countries/germany.json`
3. `pnpm dev` 立刻看到德国变绿色可点击
4. `git push` → Vercel 自动 redeploy

---

## 六、验收 Checklist

- [ ] `pnpm dev` 能启动，无 lint 错误
- [ ] `pnpm validate` 跑通（Zod 校验所有 JSON）
- [ ] 首页地图加载 < 3 秒
- [ ] 32 国 ISO 边界正确，波兰填色明显绿色
- [ ] 悬停波兰显示 5 个 KPI 浮窗
- [ ] 点击波兰进详情页，8 个 tab 切换流畅，所有数据来自 poland.json
- [ ] 任意带 H/M/L 徽章的数字 click 能看到 source URL
- [ ] 文中「GPSR」「CE」「FCC」等术语 hover 出 glossary
- [ ] /timeline 看到 GPSR (2024-12-13) 和 CBAM (2026-01-01)
- [ ] /compare 选 2-4 国显示雷达图
- [ ] 其他 31 国地图灰色，点击进去显示「数据待补」
- [ ] README.md 完整，Vercel 一键部署可用
- [ ] questions.md 列出所有 Claude Code 未决问题

---

## 七、后续维护流程

未来你拿到 Cowork 产的新国家 JSON：

```bash
cd ~/Desktop/hachimi-ecom
cp data/countries/germany.json webapp/src/data/countries/
cd webapp
pnpm validate    # 确保符合 schema
pnpm dev          # 本地预览
git add . && git commit -m "Add Germany data" && git push   # 上线
```

无需碰任何代码、配置、数据库。这就是静态架构的好处。
