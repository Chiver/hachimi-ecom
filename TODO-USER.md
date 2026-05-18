# 你的 TODO — Hachimi 全球电商调研

> 这是你（Casval）需要做的事，按时间紧迫度排序。
> **状态标记**：`[ ]` 待办 / `[~]` 进行中 / `[x]` 已完成
> **最后更新**: 2026-05-17

---

## 🔴 本周（Week 1）必做 — 不做会阻塞调研

### 数据源采购
- [ ] **U1.1** 闲鱼买 Statista eCommerce Worldwide 报告
  - 关键词："Statista eCommerce Outlook 2025" / "Statista 行业报告代下"
  - 预算：¥200-500
  - 下载到：`~/Desktop/hachimi-ecom/data/raw/statista/`
  - 用途：30+ 国 × 品类电商体量数据，是 schema 70% 字段的填表器

- [ ] **U1.2** 闲鱼买 Statista Digital Payments Worldwide 报告
  - 关键词："Statista Digital Payments"
  - 预算：¥200-500
  - 下载到：`~/Desktop/hachimi-ecom/data/raw/statista/`
  - 用途：支付方式渗透率（Top 3 本地支付）

- [ ] **U1.3** 卖家精灵 SellerSprite 专业版（直购）
  - 网址：https://www.sellersprite.com
  - 套餐：专业版 3 月
  - 预算：¥2664（约 $375）
  - 用途：亚马逊 12 站点 SKU/类目销量数据
  - **完成后**：把账号给我（可临时给 view-only 账号）

- [ ] **U1.4** 闲鱼买 SimilarWeb Pro 共享账号
  - 关键词："SimilarWeb Pro 共享账号"
  - 预算：¥100-300/月
  - 用途：Shopee/Lazada/MELI/Allegro 等非亚马逊平台流量数据
  - **完成后**：登录信息发我

- [ ] **U1.5** Apify 注册 + 充值 $49
  - 网址：https://apify.com
  - 步骤：注册 → Billing → Pay-as-you-go $49 起
  - 用途：跑现成的 Amazon/Shopee/Lazada/MELI/TikTok Shop 爬虫
  - **完成后**：把 API Token 发我（Settings → Integrations → Personal API tokens）

- [x] ~~Keepa 账号~~（已买，准备好 API key 即可）
  - **TODO**：把 API key 找出来发我

### 环境准备
- [ ] **U1.6** 确认 `~/Desktop/hachimi-ecom/` 目录可读写
  - 我会自动创建子目录（webapp-spec/、data/、data/raw/、data/countries/）
  - 你只需确认权限正常

---

## 🟡 Week 2 — Claude Code 启动

- [ ] **U2.1** 收到我的 Step 1 包（schema、poland.json、glossary、wireframe、Claude Code brief）后通读
  - 预计 Week 1 末交付
  - 重点检查：schema 字段是否符合预期、wireframe 风格是否对路

- [ ] **U2.2** 在 `~/Desktop/hachimi-ecom/webapp/` 启动 Claude Code
  - 命令：`cd ~/Desktop/hachimi-ecom && claude` （或你常用方式）
  - 把 `webapp-spec/claude-code-brief.md` 粘贴给 Claude Code 作为首条指令
  - 让它初始化 Next.js + Supabase + Drizzle 项目，ingest poland.json，跑出 v0 界面

- [x] ~~**U2.3** Supabase 账号准备~~ — **已取消，改为纯静态架构（无数据库）**

- [ ] **U2.4** Mapbox 账号注册（v1 唯一需要的外部 token）
  - 推荐 Mapbox 免费层（每月 50k 加载够用）：https://www.mapbox.com
  - 创建 Access Token 给 Claude Code
  - **如果不想注册任何账号**：告诉我，我让 Claude Code 用 Leaflet + OpenStreetMap（完全免费）

---

## 🟢 Week 3-6 — 调研期间你需要的决策

- [ ] **U3.1** Phase 2 完成（12 国）后检阅成熟市场结果，决定是否调整 Phase 3 国家清单
  - 例如：发现西欧成本太高 → 是否加 portugal/greece 替换
  - 例如：发现 Shopee 数据极少 → 是否加买专门工具

- [ ] **U3.2** 综合评分模型（Phase 4 初）权重确认
  - 我会给你 4 个权重方案（如：吸引力 40%/可行性 30%/竞争 15%/AI 15%）
  - 你拍板最终权重

- [ ] **U3.3** Top 5 优先市场决策
  - 收到 Phase 4 战略报告后，团队内部讨论确认
  - 决定第一个真正落地的市场（启动 SKU 选品）

---

## 🔵 持续 / 临时（如有触发再做）

- [ ] **U4.1** 如果发现需要新付费数据源，临时采购决策
- [ ] **U4.2** 团队增员决策（如需要本地市场专家访谈）
- [ ] **U4.3** 法务咨询（如某国合规复杂度超预期，需找当地律师确认）
- [ ] **U4.4** 如未来 v2 自动化阶段启动，提供 OpenAI/Anthropic API key 给 Claude Code 跑 LLM 抽取

---

## 给我的反馈通道

每完成一项采购或发现问题，可直接说"已完成 U1.3"或"U1.4 找不到合适的共享账号怎么办"，我会同步状态并提供替代方案。

---

## 当前阻塞我的最关键 3 件事（优先做）

1. **U1.5 Apify Token**（不需要等其他，5 分钟搞定，让我立刻能写爬虫）
2. **U1.1 Statista eCommerce 报告**（Phase 2 第一国就需要）
3. **U1.3 卖家精灵**（亚马逊 SKU 数据没它寸步难行）

其他可以一周内陆续完成。
