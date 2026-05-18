# Claude 的 TODO — Hachimi 全球电商调研

> **持久化的跨 session TODO**，下次会话开始时先读这个文件 pick up 进度。
> **状态标记**：`[ ]` 待办 / `[~]` 进行中 / `[x]` 已完成 / `[!]` 受阻
> **最后更新**: 2026-05-17

---

## Phase 1 — 方法论 + 试点国（Week 1）✅ 全部完成 2026-05-17

- [x] **P1.1** 完整数据 Schema 文档（schema.md + 字段定义）— 完成 2026-05-17
  - 路径：`webapp-spec/schema.md`
  - 含：17 张主表、每字段类型/单位/源/置信度规则、UI 映射、变更协议
- [x] **P1.2** Drizzle TypeScript Schema — 完成 2026-05-17
  - 路径：`webapp-spec/schema.ts`
  - 含：17 张表 + 12 个 enum，可直接交给 Claude Code 起 migration
- [x] **P1.3** 免费 API 数据预拉脚本（World Bank × 32 国 × 8 指标） — 完成 2026-05-17
  - 路径：`data/raw/free-apis/fetch_worldbank.py` + `worldbank_macro.json`
  - 已拉：人口、GDP、人均 GDP、通胀、互联网渗透、移动订阅、城市化、人均 GNI
  - 未跑：UN Comtrade、Eurostat（脚本待后续按需补充）
- [x] **P1.4** 波兰端到端示范 `poland.json` — 完成 2026-05-17（70% 完成度，等爬虫补 Top SKU）
  - 路径：`data/countries/poland.json`
  - 含：13 cluster 主体字段 + 完整 source_metadata，覆盖率 70%
- [x] **P1.5** Glossary 首批 25 词条 — 完成 2026-05-17
  - 路径：`webapp-spec/glossary.json`
  - 含：FCC、CE、GPSR、RoHS、REACH、Section 301、De Minimis、IOSS、GDPR、PSE、BIS、INMETRO、ANVISA、UKCA、Marketplace Facilitator、1099-K、CBAM、UFLPA、DAC7、Prop 65、FBA、ACOS、TACOS、PIX、BLIK
- [x] **P1.6** Webapp wireframe — 完成 2026-05-17
  - 路径：`webapp-spec/wireframes/01-homepage-map.svg` + `02-country-detail.svg`
  - 含：首页地图、国家详情、KPI 卡片、平台表格、品类热力图、合规提醒、source 追溯弹窗
- [x] **P1.7** Claude Code 启动 brief — 完成 2026-05-17
  - 路径：`webapp-spec/claude-code-brief.md`
  - 含：复制粘贴的 COPY-PASTE COMMAND + 10 个 Step 任务、设计规范、验收 checklist

---

## Phase 2 — 成熟市场调研（Week 2-3，12 国）✅ 全部完成 2026-05-17（首版 65% 覆盖率）

### 北美 (3)
- [x] **P2.1** 美国 USA — `data/countries/usa.json`
- [x] **P2.2** 加拿大 Canada — `data/countries/canada.json`
- [x] **P2.3** 墨西哥 Mexico — `data/countries/mexico.json`

### 西欧 (6)
- [x] **P2.4** 英国 UK — `data/countries/uk.json`
- [x] **P2.5** 德国 Germany — `data/countries/germany.json`
- [x] **P2.6** 法国 France — `data/countries/france.json`
- [x] **P2.7** 意大利 Italy — `data/countries/italy.json`
- [x] **P2.8** 西班牙 Spain — `data/countries/spain.json`
- [x] **P2.9** 荷兰 Netherlands — `data/countries/netherlands.json`

### 北欧 (3)
- [x] **P2.10** 瑞典 Sweden — `data/countries/sweden.json`
- [x] **P2.11** 挪威 Norway — `data/countries/norway.json`
- [x] **P2.12** 瑞士 Switzerland — `data/countries/switzerland.json`

---

## Phase 3 — 新兴市场调研（Week 4-5，19 国）✅ 全部完成 2026-05-17（首版 65% 覆盖率）

### 东欧+独联体 (4)
- [x] **P3.1** 罗马尼亚 Romania — `data/countries/romania.json`
- [x] **P3.2** 土耳其 Turkey — `data/countries/turkey.json`
- [x] **P3.3** 俄罗斯 Russia — `data/countries/russia.json`（含制裁风险专章）
- [x] **P3.4** （波兰已在 Phase 1 完成）

### 东南亚 (6)
- [x] **P3.5** 印尼 Indonesia — `data/countries/indonesia.json`
- [x] **P3.6** 泰国 Thailand — `data/countries/thailand.json`
- [x] **P3.7** 越南 Vietnam — `data/countries/vietnam.json`
- [x] **P3.8** 菲律宾 Philippines — `data/countries/philippines.json`
- [x] **P3.9** 马来西亚 Malaysia — `data/countries/malaysia.json`
- [x] **P3.10** 新加坡 Singapore — `data/countries/singapore.json`

### 南亚 (1)
- [x] **P3.11** 印度 India — `data/countries/india.json`（含本地化要求专章）

### 东亚+大洋洲 (3)
- [x] **P3.12** 日本 Japan — `data/countries/japan.json`
- [x] **P3.13** 韩国 Korea — `data/countries/korea.json`
- [x] **P3.14** 澳大利亚 Australia — `data/countries/australia.json`

### 拉美 (3)
- [x] **P3.15** 巴西 Brazil — `data/countries/brazil.json`
- [x] **P3.16** 智利 Chile — `data/countries/chile.json`
- [x] **P3.17** 阿根廷 Argentina — `data/countries/argentina.json`（含恶性通胀专章）

### 中东+非洲 (3)
- [x] **P3.18** 沙特 Saudi Arabia — `data/countries/saudi.json`
- [x] **P3.19** 阿联酋 UAE — `data/countries/uae.json`
- [x] **P3.20** 南非 South Africa — `data/countries/southafrica.json`

---

## Phase 4 — 战略产物（Week 6）

- [ ] **P4.1** Hachimi 综合评分模型（5 维度 × 32 国）
  - 路径：`webapp-spec/scoring-model.md` + `data/scores.json`
  - 维度：市场吸引力、运营可行性、竞争烈度、AI 杠杆度、综合
- [ ] **P4.2** 入市模式 P&L 模板（按国×品类组合）
  - 路径：`webapp-spec/pnl-templates/`
  - 含：直邮、FBA、海外仓、本地实体四种模式
- [ ] **P4.3** 全球政策时间轴数据（未来 12 月）
  - 路径：`data/policy-timeline.json`
- [ ] **P4.4** Glossary 完善至 80+ 词条
  - 路径：`webapp-spec/glossary.json`
- [ ] **P4.5** 最终战略报告（Top 5 优先市场 + 推荐品类组合）
  - 路径：`STRATEGIC-REPORT.md`
- [ ] **P4.6** Webapp v1 上线协同（与 Claude Code 联调）

---

## 持续任务（贯穿全周期）

- [ ] **C.1** 每完成一国，在本文档 mark 并附完成时间
- [ ] **C.2** Glossary 持续扩充（每国发现新名词即追加）
- [ ] **C.3** 政策时间轴持续扩充（每国发现新政策即追加）
- [ ] **C.4** Schema 变更日志维护（路径：`webapp-spec/schema-changelog.md`）
- [ ] **C.5** 每 5 国做一次"中期 checkpoint"，向用户汇报覆盖率和待决议事项

---

## Session pickup 协议

下一个 session 开始时按此顺序操作：
1. 读 `PROJECT-IMPLEMENTATION.md` 了解项目背景
2. 读本文件了解最新进度
3. 找最早的未完成项（按 P1 → P2 → P3 → P4 顺序）
4. 开工前再读 `webapp-spec/schema.md` 确保 schema 不变
5. 完成任务后立即 Edit 本文件，把 `[ ]` 改为 `[x]` 并追加完成时间
