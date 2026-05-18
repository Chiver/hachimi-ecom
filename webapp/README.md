# Hachimi 全球电商研究 Webapp

> Next.js 15 全静态架构。32 国 × 12 品类 × 14 数据 cluster。所有数据可追溯。

## 快速开始

```bash
# 1. 安装依赖
pnpm install

# 2. 配置 Mapbox token（免费层即可）
cp .env.example .env.local
# 编辑 .env.local，填入 NEXT_PUBLIC_MAPBOX_TOKEN

# 3. 启动开发服务器
pnpm dev
# 打开 http://localhost:3000
```

## 命令

| 命令 | 作用 |
|---|---|
| `pnpm dev` | 本地开发（热更新） |
| `pnpm validate` | 用 Zod 校验 `src/data/` 下所有 JSON |
| `pnpm typecheck` | 仅类型检查 (`tsc --noEmit`) |
| `pnpm build` | `pnpm validate && next build` — 构建前强制校验 |
| `pnpm start` | 运行生产构建 |
| `pnpm lint` | ESLint |

## 架构

- **零数据库**。所有数据从 `src/data/` 下的 JSON 文件直接 import
- **Zod runtime validation**：所有数据在加载时校验，校验失败时构建报错
- **SSG 全部页面**：32 个国家详情页（`generateStaticParams`）+ 首页 + 4 个静态页
- **环境变量**：只需 `NEXT_PUBLIC_MAPBOX_TOKEN`
- **部署**：Vercel Hobby tier（免费） — 一键连 GitHub repo

## 添加新国家数据

Cowork 团队产出 `data/countries/germany.json` 后：

```bash
cp ~/Desktop/hachimi-ecom/data/countries/germany.json \
   ~/Desktop/hachimi-ecom/webapp/src/data/countries/

# 同时把新国家注册到 src/lib/data.ts 的 COUNTRY_FILES 映射里：
#   import germanyRaw from "@/data/countries/germany.json";
#   const COUNTRY_FILES = { POL: polandRaw, DEU: germanyRaw, ... };

pnpm validate   # 确保 schema 合规
pnpm dev        # 本地预览
git add . && git commit -m "data: add Germany" && git push
# → Vercel 自动 redeploy
```

详情见 [`docs/data-update-flow.md`](docs/data-update-flow.md)。

## 目录结构

```
src/
├── app/
│   ├── layout.tsx                # dark mode + 渐变背景 + TopNav
│   ├── page.tsx                  # 首页全屏地图
│   ├── country/[iso]/page.tsx    # 国家详情（8 tabs，SSG）
│   ├── compare/page.tsx          # 国家对比（雷达图 + 表格）
│   ├── timeline/page.tsx         # 全球政策时间轴
│   └── glossary/page.tsx         # 名词解释库
├── components/
│   ├── nav/TopNav.tsx
│   ├── map/{WorldMap,HoverPanel}.tsx
│   ├── country/*.tsx             # 8 个 tab 组件
│   ├── SourceBadge.tsx           # ⭐️ 数据源追溯
│   ├── GlossaryTerm.tsx          # ⭐️ 词条悬浮/点击
│   ├── GlossaryClient.tsx
│   ├── CompareClient.tsx
│   ├── TimelineClient.tsx
│   └── ui/                       # shadcn-style primitives
├── data/
│   ├── countries/                # 32 国 × JSON（目前 1：poland.json）
│   ├── countries-meta.json       # 32 国基础信息
│   └── glossary.json             # 25 词条
├── lib/
│   ├── data.ts                   # 数据加载 + Zod 校验入口
│   ├── scores.ts                 # 评分聚合 + 颜色映射
│   ├── geojson.ts                # TopoJSON → GeoJSON 转换
│   ├── iso-codes.ts              # 数字 ISO → alpha-3 映射
│   ├── categories.ts             # 12 大类标签
│   └── utils.ts                  # cn() + 数字格式化
└── types/
    └── index.ts                  # Zod schema + TS types（v1 frozen）
```

## 数据完整性铁律

- 凡是带 `source_metadata` 字段的数值，UI 必须用 `<SourceBadge>` 展示
- AI 推算字段（`hachimi_scores` 等）显示 `<HachimiDerivedBadge>`
- 缺失数据显示 `<PendingBadge>`，绝不编造
- Glossary term 自动用 `<GlossaryTerm term="GPSR">` 包裹

## 部署到 Vercel

1. push 这个仓库到 GitHub
2. Vercel → "New Project" → import repo
3. Environment Variables：添加 `NEXT_PUBLIC_MAPBOX_TOKEN`
4. Deploy。后续 `git push` 自动 redeploy。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Next.js 16 (App Router, SSG) + React 19 |
| 样式 | Tailwind CSS v4 + 自定义 dark theme |
| 类型/校验 | TypeScript strict + Zod runtime |
| 地图 | Mapbox GL JS + react-map-gl + d3-geo + world-atlas TopoJSON |
| 图表 | Recharts |
| UI | Radix UI primitives + lucide-react |
| 部署 | Vercel Hobby tier |
