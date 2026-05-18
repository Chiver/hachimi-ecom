# Hachimi 全球跨境电商市场调研项目 — 实施方案

> **版本**: v1.0
> **最后更新**: 2026-05-17
> **项目代号**: hachimi-ecom-global-research

---

## 一、项目目标

为 Hachimi AI Native 电商团队的全球市场进入决策提供数据驱动的战略指导。最终产物是一个**交互式 webapp**，展示全球 32 个国家 × 12 个品类的电商市场全景，支持未来迭代和实时数据更新。

战略目标：从中筛选出最适合"店长 + AI 工作链"运营模式的市场和品类组合，支撑公司"100+ 盈利品牌"长期目标。

---

## 二、范围

### 2.1 地理范围（32 国，9 大区）

| 大区 | 国家 |
|---|---|
| 北美 (3) | 美国 USA、加拿大 Canada、墨西哥 Mexico |
| 西欧 (6) | 英国 UK、德国 Germany、法国 France、意大利 Italy、西班牙 Spain、荷兰 Netherlands |
| 北欧 (3) | 瑞典 Sweden、挪威 Norway、瑞士 Switzerland |
| 东欧+独联体 (4) | 波兰 Poland、罗马尼亚 Romania、土耳其 Turkey、俄罗斯 Russia |
| 东南亚 (6) | 印尼 Indonesia、泰国 Thailand、越南 Vietnam、菲律宾 Philippines、马来西亚 Malaysia、新加坡 Singapore |
| 南亚 (1) | 印度 India |
| 东亚+大洋洲 (3) | 日本 Japan、韩国 Korea、澳大利亚 Australia |
| 拉美 (3) | 巴西 Brazil、智利 Chile、阿根廷 Argentina |
| 中东+非洲 (3) | 沙特 Saudi Arabia、阿联酋 UAE、南非 South Africa |

### 2.2 品类范围（12 大类）

服装鞋帽、美妆个护、家居家具、3C 电子、母婴用品、宠物用品、户外运动、汽配、健康保健、玩具、厨房用品、园艺工具

### 2.3 数据维度（每国 14 个数据 cluster）

A. 宏观经济 | B. 进出口贸易 | C. 电商市场体量 | D. 平台格局 | E. 品类 + Top SKU | F. 支付与物流 | G. 合规与政策 | H. 流量经济（CPM/CPC）| I. 中国卖家密度 | J. 文化与季节性 | K. AI 适配度 | L. Hachimi 综合评分 | M. 入市模式 P&L 推荐 | N. 政策时间轴事件

---

## 三、数据源策略

### 3.1 数据源分层

| 层级 | 源 | 类型 | 用途 |
|---|---|---|---|
| Tier 1 政府/国际组织 | World Bank、IMF、UN Comtrade、Eurostat、US Census、ITU、UNCTAD、WTO TBT | 免费 API | 宏观、进出口、合规 |
| Tier 2 付费报告 | Statista（eCommerce + Digital Payments）、SellerSprite 卖家精灵、SimilarWeb Pro、Keepa | 闲鱼/直购 | 电商体量、平台、SKU |
| Tier 3 爬虫 / 实时 | Apify（Amazon/Shopee/Lazada/MELI/TikTok Shop）、Google Trends pytrends | API/scrape | Top SKU、趋势 |
| Tier 4 公司财报 | Sea Group、MercadoLibre、Coupang、Allegro、JD、PDD | 免费 PDF | 平台 GMV |
| Tier 5 免费行业报告 | Worldpay Global Payments、World Bank LPI、DHL、We Are Social | 免费 PDF | 支付、物流、数字渗透 |
| Tier 6 中文跨境社区 | 亿邦动力、雨果跨境、Cifnews、艾媒咨询 iiMedia | 免费 | 一手情报交叉验证 |

### 3.2 数据完整性铁律

1. 每条数据点必须含 `source_url` + `fetched_at` + `confidence`（H/M/L）
2. 置信度优先级：政府 > 上市公司财报 > 付费报告 > 爬虫 > 社区情报
3. 多源冲突时取高优先级，并在 `notes` 注明差异
4. AI 计算字段（综合评分、P&L）单独标记，附方法论链接

---

## 四、技术架构

### 4.1 技术栈（v1 静态版，2026-05-17 修订）

| 层 | 技术 |
|---|---|
| 前端 | Next.js 15 (App Router, SSG) + React + TailwindCSS |
| 地图 | Mapbox GL JS + d3-geo + world-atlas TopoJSON |
| 类型/校验 | TypeScript strict + Zod runtime validation |
| 数据存储 | **静态 JSON 文件**（src/data/countries/*.json）— 无数据库 |
| UI 组件 | shadcn/ui + recharts (图表) + lucide-react (图标) |
| 部署 | Vercel Hobby（免费） |
| Env 变量 | 仅 `NEXT_PUBLIC_MAPBOX_TOKEN` |

**为什么不用 Supabase**：数据量小（<1MB）、写操作几乎零、单团队内部使用，静态足够且更快更省。
未来 v2 真有需要时再迁移到 DB——JSON schema 与 DB 表 1:1 映射，迁移成本低。

### 4.2 目录结构

```
~/Desktop/hachimi-ecom/
├── PROJECT-IMPLEMENTATION.md          # 本文档
├── TODO-CLAUDE.md                     # Claude 的 TODO（含状态，跨 session 持久）
├── TODO-USER.md                       # 用户的 TODO
├── webapp-spec/                       # 技术规范
│   ├── schema.md                      # 数据模型文档
│   ├── schema.ts                      # Drizzle TypeScript types
│   ├── glossary.json                  # 名词解释库
│   ├── wireframes/                    # UI 草图
│   └── claude-code-brief.md           # 交给 Claude Code 的 brief
├── data/
│   ├── raw/                           # 原始数据
│   │   ├── statista/                  # Statista 下载的 CSV/PDF
│   │   ├── sellersprite/              # 卖家精灵导出
│   │   ├── similarweb/                # SimilarWeb 截图/CSV
│   │   ├── apify/                     # Apify 爬虫输出
│   │   └── free-apis/                 # World Bank/UN 等 API 拉取
│   └── countries/                     # 结构化国家数据
│       ├── poland.json                # 示范国
│       ├── usa.json
│       └── ... (32 国)
├── webapp/                            # Next.js 项目（Claude Code 创建）
└── [已有的亚马逊 SOP 等]
```

### 4.3 Webapp 核心模块

1. **全球地图首页**：Mapbox + d3-geo，按 Hachimi 综合评分配色，hover 显示 5 个关键指标
2. **国家详情页**：14 个数据 cluster 完整呈现，按品类切换
3. **品类详情页**：选定品类 × 32 国横向对比 + 热力图
4. **对比视图**：任选 2-4 国并排对比
5. **政策时间轴**：全球电商政策事件流，含倒计时高亮
6. **Glossary 系统**：所有专业名词悬浮可见详解
7. **数据源追溯**：每个数据点点击可跳转原始 URL
8. **数据管理后台**：为未来自动化 ingestion 预留接口

---

## 五、Phase 计划（4-6 周）

### Phase 1（Week 1）— 方法论 + 试点国
- 完整数据 Schema（schema.md + schema.ts）
- 免费 API 预拉（World Bank、UN Comtrade、Eurostat、IMF、ITU）
- 波兰端到端示范（poland.json）
- Glossary 首批 25 词
- Webapp wireframe
- Claude Code 启动 brief

### Phase 2（Week 2-3）— 成熟市场（12 国）
北美 3 + 西欧 6 + 北欧 3 = 12 国，数据丰富，验证 schema 稳定性

### Phase 3（Week 4-5）— 新兴市场（19 国）
东欧 4 + 东南亚 6 + 南亚 1 + 东亚澳 3 + 拉美 3 + 中东非 3 = 19 国，数据稀缺需多源交叉

### Phase 4（Week 6）— 战略产物 + 上线
- 综合评分模型（5 维雷达图）
- 32 国入市模式 P&L 模板
- 全球政策时间轴
- Webapp v1 部署

---

## 六、角色分工

| 角色 | 职责 |
|---|---|
| **Cowork（Claude，研究层）** | 调研、数据采集、JSON 输出、Schema、文档、战略分析 |
| **Claude Code（工程层）** | Next.js + Supabase + Drizzle 项目搭建、UI 实现、数据 ingestion、部署 |
| **用户（决策 + 采购层）** | 采购付费数据、申请账号、检阅产物、战略决策 |

### 数据交付协议（v1 静态版）

- Claude 输出 `data/countries/{country}.json`（严格遵守 webapp-spec/types.ts 中的 Zod schema）
- 用户下载付费数据到 `data/raw/{source}/`
- 把 JSON 复制到 `webapp/src/data/countries/` → `pnpm validate` 校验 → `git push` → Vercel 自动 redeploy

---

## 七、未来 v2 路线图（暂不开发）

- 自动化数据 ingestion（定时爬虫 + LLM 提取）
- 多语言 webapp（中英）
- 决策模拟器（输入预算/品类，输出推荐国家）
- 知识库 RAG（论文、案例与每国数据关联）
- AI 选品推荐器（接入卖家精灵 API）

---

## 八、关键风险与缓解

| 风险 | 缓解 |
|---|---|
| 数据源失效（如俄罗斯制裁、Marketplace Pulse 关闭订阅） | 每国至少 3 个独立源 |
| 付费报告版权 | 闲鱼采购需自行确认合规，webapp 内不展示原始 PDF，仅引用统计数字 + source URL |
| 政策快速变化 | 政策时间轴模块 + 每 30 天检视 |
| Schema 反复改动 | Phase 1 末确认 v1 schema，后续 frozen 至 v2 |

---

## 九、成功标准

- 32 国 × 14 数据 cluster 全部填入（覆盖率 ≥ 90%）
- 每条数据带 source URL（追溯率 100%）
- Webapp v1 上线，地图 + 详情页 + 对比 + Glossary 全部可用
- 综合评分模型可解释、可复现
- 团队可基于此独立做出 Top 5 优先市场决策
