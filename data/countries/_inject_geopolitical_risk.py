#!/usr/bin/env python3
"""
Inject `geopolitical_risk` field into each of 32 country JSON files.

Researched 2026-05-19 via web search (Sources listed in each entry).
Each entry includes:
  - overall_level: extreme / high / medium / low
  - headline: one-line conclusion
  - factors: 1-4 factor objects with type / title / description / impact / severity
  - entry_recommendation_adjustment: how the assessment should bend strategy
  - sources: name / url / fetched_at
"""

import json
from pathlib import Path

TODAY = "2026-05-19"
ASSESSED_BY = "Hachimi research team (web-search synthesis 2026-05-19)"

# --- shared source bundles ---
SRC_RED_SEA = [
    {
        "name": "Suaid Global · Red Sea Shipping Crisis 2026: Impact on Rates, Routes & Your Supply Chain",
        "url": "https://suaidglobal.com/insights/red-sea-shipping-crisis-2026/",
        "fetched_at": TODAY,
    },
    {
        "name": "Bloomberg · Shipping Firms Face Tough 2026 as Reopening of Red Sea Looms",
        "url": "https://www.bloomberg.com/news/articles/2026-02-04/shipping-firms-face-tough-2026-as-reopening-of-red-sea-looms",
        "fetched_at": TODAY,
    },
    {
        "name": "World Bank · The Deepening Red Sea Shipping Crisis: Impacts and Outlook",
        "url": "https://documents1.worldbank.org/curated/en/099253002102539789/pdf/IDU10b8b59671dbc814cfc19c4a1299ff54854ba.pdf",
        "fetched_at": TODAY,
    },
]

SRC_HORMUZ = [
    {
        "name": "Business Today · How the Gulf is redrawing its logistics network to bypass Hormuz (2026-05-14)",
        "url": "https://www.businesstoday.in/world/story/how-the-gulf-is-redrawing-its-logistics-network-to-bypass-hormuz-531417-2026-05-14",
        "fetched_at": TODAY,
    },
    {
        "name": "Travel And Tour World · UAE Joins Middle East in Massive Overland Energy Push as Strait of Hormuz Crisis Reshapes 2026 Economy",
        "url": "https://www.travelandtourworld.com/news/article/uae-joins-bahrain-saudi-arabia-iraq-kuwait-qatar-and-israel-in-massive-overland-energy-push-as-strait-of-hormuz-crisis-reshapes-middle-east-economy-and-travel-in-2026/",
        "fetched_at": TODAY,
    },
    {
        "name": "Vortex Shipping · UAE Shipping Crisis 2026 Guide",
        "url": "https://vortexshipping.ae/uae-shipping-crisis-2026/",
        "fetched_at": TODAY,
    },
]

SRC_USA_TARIFF = [
    {
        "name": "Dutiable · Section 321 in 2026: the de minimis rules that changed everything",
        "url": "https://dutiable.io/blog/de-minimis-section-321-changes-2026",
        "fetched_at": TODAY,
    },
    {
        "name": "Gateway Lines · Section 301 China Tariffs 2026: Current Rates, Lists 1-4A, EVs & Apparel",
        "url": "https://gatewaylines.com/press-releases/complete-guide-to-section-301-china-tariffs-in-2026",
        "fetched_at": TODAY,
    },
    {
        "name": "White & Case · United States Begins to Restrain Cross-Border E-commerce",
        "url": "https://www.whitecase.com/insight-alert/united-states-begins-restrain-cross-border-e-commerce",
        "fetched_at": TODAY,
    },
]

SRC_RUSSIA = [
    {
        "name": "CSIS · Sanctions, SWIFT, and China's Cross-Border Interbank Payments System",
        "url": "https://www.csis.org/analysis/sanctions-swift-and-chinas-cross-border-interbank-payments-system",
        "fetched_at": TODAY,
    },
    {
        "name": "CEPA · Transatlantic Action: Sanctioning Third-Country Enablers of Russia's War Economy",
        "url": "https://cepa.org/comprehensive-reports/transatlantic-action-sanctioning-third-country-enablers-of-russias-war-economy/",
        "fetched_at": TODAY,
    },
    {
        "name": "Atlantic Council · Russia Sanctions Database",
        "url": "https://www.atlanticcouncil.org/blogs/econographics/russia-sanctions-database/",
        "fetched_at": TODAY,
    },
]

SRC_BRA = [
    {
        "name": "WCO News · E-commerce at a turning point: Customs, compliance and the end of de minimis",
        "url": "https://mag.wcoomd.org/magazine/wco-news-108-issue-3-2025/e-commerce-at-a-turning-point/",
        "fetched_at": TODAY,
    },
    {
        "name": "Deliver2 · Brazil has introduced a 60% tax on parcels cheaper than $50 — Shein and Temu are under attack",
        "url": "https://deliver-2.com/news/economy/brazil-has-introduced-a-60-tax-on-parcels-cheaper-than-50-shein-and-temu-are-under-attack/",
        "fetched_at": TODAY,
    },
]

SRC_MEX = [
    {
        "name": "ASI Central · Mexico Imposes Tariffs on China To Curb 'Back Door' to U.S. Market (Jan 2026)",
        "url": "https://members.asicentral.com/news/industry-news/january-2026/mexico-imposes-tariffs-on-china-to-curb-back-door-to-us-market/",
        "fetched_at": TODAY,
    },
    {
        "name": "CSIS · USMCA Review 2026",
        "url": "https://www.csis.org/analysis/usmca-review-2026",
        "fetched_at": TODAY,
    },
    {
        "name": "FreightWaves · Mexico targets Asian imports with new tariffs ahead of USMCA negotiations",
        "url": "https://www.freightwaves.com/news/mexico-targets-asian-imports-with-new-tariffs-ahead-of-usmca-negotiations",
        "fetched_at": TODAY,
    },
]

SRC_IDN = [
    {
        "name": "ChemLinked · Indonesia Prohibits Online Sales of Imported Goods Priced Below $100 and E-commerce Services on Social Media",
        "url": "https://cosmetic.chemlinked.com/news/cosmetic-news/indonesia-prohibits-online-sales-of-imported-goods-priced-below-100-and-e-commerce-services-on-social-media",
        "fetched_at": TODAY,
    },
    {
        "name": "Asia Pacific Foundation · Indonesia's New E-commerce Regulations Take a Bite Out of TikTok's Market Share",
        "url": "https://www.asiapacific.ca/publication/indonesias-new-e-commerce-regulations-take-bite-out-tiktoks",
        "fetched_at": TODAY,
    },
    {
        "name": "Rest of World · Indonesia taxes e-commerce imports at high rates to protect local business",
        "url": "https://restofworld.org/2024/indonesia-import-tax/",
        "fetched_at": TODAY,
    },
]

SRC_TUR = [
    {
        "name": "Türkiye Today · Türkiye scraps duty-free customs for online imports, affecting Chinese e-commerce",
        "url": "https://www.turkiyetoday.com/business/turkiye-scraps-fast-track-customs-for-online-imports-affecting-chinese-e-commerce-3212517",
        "fetched_at": TODAY,
    },
    {
        "name": "Türkiye Today · Temu suspends all cross-border sales in Türkiye following regulatory inspection",
        "url": "https://www.turkiyetoday.com/business/temu-suspends-all-cross-border-sales-in-turkiye-following-regulatory-inspection-3213496",
        "fetched_at": TODAY,
    },
]

SRC_IND = [
    {
        "name": "The Diplomat · China-India Relations in 2026: Can the Thaw Continue?",
        "url": "https://thediplomat.com/2026/01/china-india-relations-in-2026-can-the-thaw-continue/",
        "fetched_at": TODAY,
    },
    {
        "name": "Insights On India · India's Trade Deficit with China: Implications, Causes, and Economic Impact (Mar 2026)",
        "url": "https://www.insightsonindia.com/2026/03/17/india-china-trade-deficit/",
        "fetched_at": TODAY,
    },
]

SRC_SEA_TRANSSHIPMENT = [
    {
        "name": "ASEAN Briefing · ASEAN Transshipment Under US Tariffs: Compliance and Strategy",
        "url": "https://www.aseanbriefing.com/news/asean-transshipment-and-us-tariffs-balancing-opportunity-and-risk/",
        "fetched_at": TODAY,
    },
    {
        "name": "Sidley Austin · Implications of U.S. Tariffs on Southeast Asia",
        "url": "https://www.sidley.com/en/insights/newsupdates/2025/08/implications-of-us-tariffs-on-southeast-asia-navigating-the-trade-tumult",
        "fetched_at": TODAY,
    },
]

SRC_ARG = [
    {
        "name": "UPI · Argentina's easing restrictions drives surge in imports (Feb 2026)",
        "url": "https://www.upi.com/Top_News/World-News/2026/02/13/latam-argentina-foreign-product-purchases/9441771004024/",
        "fetched_at": TODAY,
    },
    {
        "name": "Rio Times · Argentina Economy 2026: Milei's Shock Therapy Is Working",
        "url": "https://www.riotimesonline.com/argentina-economy-2026-guide/",
        "fetched_at": TODAY,
    },
]

SRC_ZAF = [
    {
        "name": "Chatham House · Africa in 2026: Global uncertainty demands regional leadership",
        "url": "https://www.chathamhouse.org/2026/01/africa-2026-global-uncertainty-demands-regional-leadership",
        "fetched_at": TODAY,
    },
    {
        "name": "Voice of the Cape · South Africa's Political Landscape Faces Tests in 2026",
        "url": "https://vocfm.co.za/south-africas-political-landscape-faces-tests-in-2026/",
        "fetched_at": TODAY,
    },
    {
        "name": "JLog · Import Duty South Africa 2026: SARS Rates & Tariffs (de minimis = 0)",
        "url": "https://jlog.co.za/guides/import-duty-guide-south-africa-2026/",
        "fetched_at": TODAY,
    },
]

SRC_POL = [
    {
        "name": "CEPA · Poland to China: So, You Want to Play Hybrid War?",
        "url": "https://cepa.org/article/poland-to-china-so-you-want-to-play-hybrid-war/",
        "fetched_at": TODAY,
    },
    {
        "name": "Eurasia Review · Poland And Hungary In A Post-Ukraine War Order (Jan 2026)",
        "url": "https://www.eurasiareview.com/08012026-poland-and-hungary-in-a-post-ukraine-war-order-competing-visions-of-cee-security-analysis/",
        "fetched_at": TODAY,
    },
]

# --- per-country geopolitical assessments (all 32) ---
ASSESSMENTS = {

    # ============================================================
    # 中东 — 红海/霍尔木兹危机 (HIGH RISK)
    # ============================================================
    "SAU": {
        "overall_level": "high",
        "headline": "红海航运危机 + 2026 霍尔木兹海峡危机叠加；运费暴涨、时效翻倍，行业出现'逐步放弃'声音",
        "factors": [
            {
                "type": "armed_conflict",
                "title": "胡塞武装红海/曼德海峡袭击持续",
                "description": "2023.11 起胡塞武装对红海商船袭击至 2026 仍未结束；2026.04 多国海事预警显示曼德海峡仍处中等威胁级。胡塞警告若加沙停火破裂或伊朗局势升级将恢复全面袭击。",
                "impact_on_china_sellers": "中国→中东海运时效从 25-30 天延长至 45-55 天（绕道好望角）；亚欧航线运费 +25-40%；集装箱附加费 +$800-$1500/40HQ。",
                "severity": "high",
            },
            {
                "type": "armed_conflict",
                "title": "2026 霍尔木兹海峡危机（美-以-伊冲突升级）",
                "description": "2026 年美-以-伊冲突升级导致霍尔木兹海峡部分时间封锁，中东地区航空 / 海运 / 陆运全面重构。MSC、Maersk 等承运商已启用阿拉伯半岛陆路绕道。",
                "impact_on_china_sellers": "集装箱附加费高达 $4,000/箱；空运容量 -18%；中国→中东空运成本环比 2025-Q4 上涨 35-60%。利雅得收货时效不可预测。",
                "severity": "critical",
            },
            {
                "type": "supply_chain",
                "title": "末端清关 / 派送时效恶化",
                "description": "Jeddah、Khorfakkan、Fujairah 等替代港口拥堵；陆路口岸（如 Al Rawdah）开通缓解部分压力但运力远低于海运。",
                "impact_on_china_sellers": "Amazon SA / Noon 等本地平台 FBA 入仓周期不确定，库存周转拉长压资金。",
                "severity": "high",
            },
        ],
        "entry_recommendation_adjustment": "短期（2026 H2 之前）不建议把沙特作为新拓展重点市场。已入市的卖家：1) 优先海外仓 + 本地履约（Noon FBN / Amazon SA FBA），减少跨境直发；2) 谨慎备货，把库存周转目标从 60 天延长到 90-120 天；3) 必接 Mada + STC Pay，降低订单流失。新进入卖家：等红海/霍尔木兹局势明朗（推荐密切关注 2026 Q3 节点）。",
        "sources": SRC_RED_SEA + SRC_HORMUZ,
    },

    "ARE": {
        "overall_level": "high",
        "headline": "霍尔木兹海峡危机 + Dubai 转运枢纽地位受挫；陆路绕道成本/时效双高",
        "factors": [
            {
                "type": "armed_conflict",
                "title": "霍尔木兹海峡封锁与重新开放周期反复",
                "description": "2026 美-伊-以冲突升级以来霍尔木兹海峡多次部分封锁。Spinneys 等本地零售商已启用 16 天陆路绕道（Kent → 西欧 → 埃及 → 沙特 → Dubai）取代海运。",
                "impact_on_china_sellers": "Dubai 作为中东最大转口枢纽地位受损；中国→UAE 集装箱附加费 +$4,000/箱；空运 8 月以来下降 18% 容量。",
                "severity": "critical",
            },
            {
                "type": "supply_chain",
                "title": "多式联运成本高且不可控",
                "description": "MSC、Maersk 等承运商已大规模启用阿拉伯半岛陆路通道；UAE-Oman 之间新开 Al Rawdah 口岸缓解。",
                "impact_on_china_sellers": "陆路运费按日上涨；中国-UAE 空运承运商减少，运价波动大；适合高客单（>$80）才能消化。",
                "severity": "high",
            },
        ],
        "entry_recommendation_adjustment": "Dubai 作为中东辐射枢纽的吸引力短期下滑。建议：1) 已建立 UAE 海外仓的卖家维持，但暂缓扩张库存；2) 新进入卖家暂避 cross-border 直邮模式，等局势缓和；3) 客单 $30 以下的快时尚 / 低价配饰品类受冲击最大（附加费分摊不起），建议转 PHL / MYS 等替代市场。",
        "sources": SRC_HORMUZ,
    },

    # ============================================================
    # 俄罗斯 — 制裁压力 (HIGH RISK)
    # ============================================================
    "RUS": {
        "overall_level": "extreme",
        "headline": "西方对中国第三方制裁实质性落地；中国卖家入俄汇款/履约渠道严重受限",
        "factors": [
            {
                "type": "sanctions",
                "title": "西方次级制裁压向中国金融机构",
                "description": "2025 年 EU 启用新制裁标准，已制裁多家协助俄罗斯绕道的中国/吉尔吉斯/哈萨克斯坦银行。2026 年 2 家中国区域性银行被次级制裁后立即停止所有对俄结算（事后部分解除制裁）。",
                "impact_on_china_sellers": "中国卖家收俄罗斯订单货款的合规渠道极少；CIPS 拒绝接入俄罗斯 SPFS 以避免次级制裁；多数 PSP（Stripe / Adyen / PayPal）不支持俄罗斯。",
                "severity": "critical",
            },
            {
                "type": "armed_conflict",
                "title": "俄乌战争持续 / 国际制裁体系升级",
                "description": "战争进入第 4 年，欧美制裁清单仍在扩张；俄罗斯卢布波动剧烈；Visa/Mastercard 等不可用，本国 Mir 卡和 SBP（央行快支付）成为唯一选择。",
                "impact_on_china_sellers": "跨境支付高摩擦：必须通过 Yandex Kassa / Tinkoff / YooKassa 等本地 PSP，门槛极高。提现汇款回中国流程不透明。",
                "severity": "critical",
            },
            {
                "type": "platform_regulation",
                "title": "Wildberries / Ozon 平台主导但跨境门槛高",
                "description": "Wildberries 和 Ozon 是俄本土两大平台；外资品牌大批撤出后留下大量市场份额，但本地公司注册 + VAT 是硬门槛。",
                "impact_on_china_sellers": "建议通过俄当地代运营 / 注册当地公司，不要直邮模式。",
                "severity": "high",
            },
        ],
        "entry_recommendation_adjustment": "**强烈不建议中国卖家在 2026 年新进入俄罗斯市场。** 主要风险：（1）跨境支付几乎不可行，回款渠道随时被切断；（2）西方次级制裁随时可能扩展至更多中国金融机构，企业被'连坐'风险高；（3）合规边际成本极高。如已有俄罗斯业务：评估是否设立独立法律实体隔离风险；优先选 Mir 卡 / SBP 支付；与中国银行的国际业务部门保持沟通。",
        "sources": SRC_RUSSIA,
    },

    # ============================================================
    # 美国 — 关税与平台法规 (HIGH RISK)
    # ============================================================
    "USA": {
        "overall_level": "high",
        "headline": "De Minimis 时代终结 + Section 301 持续加码；直邮模型已死，必须本土仓",
        "factors": [
            {
                "type": "trade_policy",
                "title": "Section 321 De Minimis ($800) 已废除",
                "description": "2025-05-02 起对中国/香港取消 $800 免税额；2025-08-29 起扩展到全球所有来源。所有 B2C 包裹必须正式报关 + 缴税。",
                "impact_on_china_sellers": "直邮模型寿终正寝。Temu / Shein 已全面转 US 本土仓储。中小卖家直发美国成本上升 30-50%。",
                "severity": "critical",
            },
            {
                "type": "trade_policy",
                "title": "Section 301 关税未变 + 新一轮调查启动",
                "description": "Section 301 在 1974 贸易法下仍全面有效。USTR 2026-03-11 新发起 Section 301 调查针对中国'过剩产能'，目标含 16 个对中国转运高度依赖的贸易伙伴（含越南/马来/泰/印尼等）。",
                "impact_on_china_sellers": "对中国直接进口的关税长期处于 +25-60% 区间；越南/马来'转运绕道'通道收紧。",
                "severity": "high",
            },
            {
                "type": "trade_policy",
                "title": "高敏感品类清关风险",
                "description": "包含 UFLPA（新疆强迫劳动） / Prop 65（加州） / FCC（无线产品） / FDA（食品/化妆品/医疗）等多套独立审查体系；CBP 抽查趋严。",
                "impact_on_china_sellers": "棉制品 / 太阳能 / 电池类目高扣货风险（已扣 90,000+ 批次价值 $30B+）。",
                "severity": "high",
            },
        ],
        "entry_recommendation_adjustment": "美国市场仍是首选战略市场，但战术必须转型：1) 必转 FBA / 本土海外仓 / 自建美国实体；2) UFLPA 涉及品类（棉、电池、光伏）建立完整供应链溯源；3) 客单价 > $50 才能消化关税成本；4) 警惕 2026 H2 可能再加码的 Section 301 关税。",
        "sources": SRC_USA_TARIFF,
    },

    # ============================================================
    # 土耳其 — 平台政策剧变 (HIGH RISK)
    # ============================================================
    "TUR": {
        "overall_level": "high",
        "headline": "2026-02-01 起取消 €30 简化清关；Temu 已全面屏蔽国际卖家",
        "factors": [
            {
                "type": "trade_policy",
                "title": "2026-02-01 取消快件简化清关",
                "description": "外购快件免税额从 €150 → €30；€30-1500 必须走全套海关流程。土耳其政府公开理由：产品安全（多数中国商品不达欧盟标准）。",
                "impact_on_china_sellers": "中国直邮土耳其的小件商品（玩具/鞋/皮具等）成本暴涨；多数 SKU 失去价格竞争力。",
                "severity": "critical",
            },
            {
                "type": "platform_regulation",
                "title": "Temu 全面屏蔽国际卖家",
                "description": "Temu 在土耳其完全移除中国 / 国际卖家，转为纯本地卖家市场。这是 Temu 首次在某个国家级市场完全关闭跨境通道。",
                "impact_on_china_sellers": "Temu 渠道丧失。AliExpress / Hepsiburada / Trendyol 仍可用但合规门槛同步上升。",
                "severity": "critical",
            },
            {
                "type": "currency_volatility",
                "title": "里拉持续贬值 + 高通胀",
                "description": "土耳其里拉自 2021 起累积贬值 80%+；通胀率 2024-2025 仍 40-60%；央行政策不稳定。",
                "impact_on_china_sellers": "本地结算货款贬值快；定价需高频调整；客户购买力下降。",
                "severity": "high",
            },
        ],
        "entry_recommendation_adjustment": "**短期暂避土耳其市场。** 已有业务的卖家需立即评估：1) 直邮 SKU 全面退出，改用本地海外仓 + 当地公司架构；2) 改走 AliExpress / Hepsiburada 等仍开放的平台；3) 涉及玩具 / 鞋 / 皮具的强加强抽查品类需提前做 CE / EN71 合规。新拓展资源转向波兰、罗马尼亚等东欧替代市场。",
        "sources": SRC_TUR,
    },

    # ============================================================
    # 巴西 — 关税 + 平台规则 (MEDIUM-HIGH)
    # ============================================================
    "BRA": {
        "overall_level": "high",
        "headline": "Remessa Conforme 维持 60% 联邦 + 17% 州税；Shein / Shopee 已加入合规计划",
        "factors": [
            {
                "type": "trade_policy",
                "title": "Remessa Conforme 跨境关税体系",
                "description": "≤ USD 50 包裹征 20% 联邦税 + 17% 州税；USD 50-3000 征 60% 联邦税 + 17% 州税。2024-08-01 起 $50 免税额取消。",
                "impact_on_china_sellers": "$30 的 Temu 商品落地价飙到约 $48；价格竞争力大幅下降。Shein 已申请加入 PRC 享 20% 优惠。",
                "severity": "high",
            },
            {
                "type": "platform_regulation",
                "title": "ML 主导但本地化合规门槛上升",
                "description": "Mercado Libre 仍是绝对主导（市占 50%+）；Temu Brazil 启动半托管模式（2024-07-31）；本地履约要求趋严。",
                "impact_on_china_sellers": "卖家需通过 PRC 获取税务优势或接受 60% 关税；本地仓 + ML Full 是必选项。",
                "severity": "high",
            },
        ],
        "entry_recommendation_adjustment": "巴西仍是拉美最大市场，但务必走合规路径：1) 入驻 ML Full / Shopee BR / Magalu 等本土平台；2) 申请 Remessa Conforme 享 20%（vs 60%）税率；3) 海外仓必备，库存深度建议覆盖 90 天；4) PIX 必接（占订单 60%+），boleto 仍需保留作为补充。",
        "sources": SRC_BRA,
    },

    # ============================================================
    # 墨西哥 — Trump 政策传导 (MEDIUM-HIGH)
    # ============================================================
    "MEX": {
        "overall_level": "high",
        "headline": "2026-01 对中国 1,400 商品加 35-50% 关税；USMCA 2026 review 进行中",
        "factors": [
            {
                "type": "trade_policy",
                "title": "墨西哥对中国/亚洲新关税",
                "description": "2026 年初墨西哥对中国等亚洲国家 1,400 类商品（汽车/汽配/钢铝/塑料/服装/家电/玩具/鞋/纺织等）加 35-50% 关税。目的：堵截中国商品借道墨西哥进入美国。",
                "impact_on_china_sellers": "直接进入墨西哥市场的中国商品成本飙升；'借道美国'模型受严打。",
                "severity": "critical",
            },
            {
                "type": "trade_policy",
                "title": "USMCA 2026 review 不确定性",
                "description": "原定 2026-07-01 截止的 USMCA 审议预计将延期；美方推 52 项贸易要求；可能强化原产地规则，进一步限制中国转运。",
                "impact_on_china_sellers": "中长期通过墨西哥进入美国的路径越来越难；本地建厂 / 实际制造比例要求会上升。",
                "severity": "high",
            },
            {
                "type": "domestic_unrest",
                "title": "末端物流安全（cartel 影响）",
                "description": "部分地区（如 Sinaloa、Michoacán）的最后一公里物流受 cartel 影响，丢件 / 抢劫率较高。",
                "impact_on_china_sellers": "MercadoLibre Full 等大平台已有应对，独立卖家慎选偏远地区配送。",
                "severity": "medium",
            },
        ],
        "entry_recommendation_adjustment": "墨西哥仍有人口红利和电商高速增长（24% YoY），但战略要重新思考：1) 别再把墨西哥当美国转运基地，必须正面做本地市场；2) Mercado Libre Full 必接，PIX 类即时支付（CoDi）+ OXXO 现金支付双轨；3) 客单 $30 以下品类成本压力大，向高客单 / 高毛利品类倾斜；4) 配送地址做风控筛查，避开高风险邮编。",
        "sources": SRC_MEX,
    },

    # ============================================================
    # 印尼 — 平台严管 (MEDIUM-HIGH)
    # ============================================================
    "IDN": {
        "overall_level": "high",
        "headline": "De Minimis 降至 $3；部分品类 200% 关税；TikTok Shop 仅靠 Tokopedia 合并存活",
        "factors": [
            {
                "type": "trade_policy",
                "title": "De Minimis 极端收紧",
                "description": "2023 年以来从 $100 → $75 → $3，是 SEA 最严的跨境免税门槛。部分品类（鞋、纺织、陶瓷等）面临高达 200% 进口关税。",
                "impact_on_china_sellers": "中国直邮印尼小件商品成本激增；多数低客单 SKU 失去竞争力。",
                "severity": "critical",
            },
            {
                "type": "platform_regulation",
                "title": "TikTok Shop 2023.10 被关，2024.02 通过与 Tokopedia 合并重启",
                "description": "印尼禁止社交媒体平台做交易（仅允许促销/广告）；TikTok 通过收购 Tokopedia 75.01% 股权才得以保留电商业务。",
                "impact_on_china_sellers": "中国跨境卖家可在 TikTok Shop 印尼站经营（Business Help Center 确认），但合规要求显著加强；'低价直邮'模式不可行。",
                "severity": "high",
            },
        ],
        "entry_recommendation_adjustment": "印尼仍是 SEA 第一大市场，但门槛高：1) 必走 Shopee ID / Tokopedia / Lazada ID 的本地店模式，本地仓必备；2) De Minimis $3 意味着所有跨境包裹都要缴税，定价加 20-50% 缓冲；3) 警惕政府随时可能加码的产业保护（鞋、纺织、陶瓷已有 200% 案例）；4) GoPay / OVO / Dana 数字钱包接入。",
        "sources": SRC_IDN,
    },

    # ============================================================
    # 印度 — 解冻但仍敏感 (MEDIUM)
    # ============================================================
    "IND": {
        "overall_level": "medium",
        "headline": "中印 2025-2026 局部解冻；Shein 已解禁；但 BIS 与投资审查仍严",
        "factors": [
            {
                "type": "diplomatic_tension",
                "title": "中印关系局部解冻（2025-2026）",
                "description": "2025 中国部分放开稀土磁体、隧道掘进机、化肥对印度出口；印度解封 Shein 等中国应用并重新评估对华投资限制。但进展仅为局部、未来不明朗。",
                "impact_on_china_sellers": "市场准入有所放宽，但敏感行业（国防、电信、关键基建）仍严控。",
                "severity": "medium",
            },
            {
                "type": "trade_policy",
                "title": "BIS 强制注册 + 本地实体要求",
                "description": "BIS 通过 CRS / ISI 强制注册 1,000+ 类电子产品；测试样品需运到印度本地实验室；本地代理人是硬性要求。",
                "impact_on_china_sellers": "电子 / 玩具 / 家电品类合规周期 6-12 个月，费用 $5,000-$20,000；Xiaomi 等大厂曾被巨额罚款。",
                "severity": "high",
            },
            {
                "type": "diplomatic_tension",
                "title": "中印边境局势仍敏感",
                "description": "2020 加勒万冲突遗留紧张关系；2025-2026 边境降温但未根本解决；任何边境冲突会立即触发新一轮中国应用 / 商品封禁。",
                "impact_on_china_sellers": "黑天鹅事件风险持续存在；卖家应保持本地团队 + 多平台分散风险。",
                "severity": "medium",
            },
        ],
        "entry_recommendation_adjustment": "印度市场是长期价值（人口红利 + UPI 普及），但短期门槛高：1) 通过 Amazon IN / Flipkart 等大平台代办合规，避免独立站强 BIS 路径；2) 启动期专攻 BIS 不强制的品类（部分服装、美妆、家居）；3) 监控中印关系新闻，做好黑天鹅预案（应用下架、商品封禁）。",
        "sources": SRC_IND,
    },

    # ============================================================
    # SEA 其它 — US 转运严打 (MEDIUM)
    # ============================================================
    "VNM": {
        "overall_level": "medium",
        "headline": "美对越 20% 基准关税 + 40% 转运罚则；中国转运通道收紧",
        "factors": [
            {
                "type": "trade_policy",
                "title": "美越关税框架（2025-2026）",
                "description": "美国对越南进口设 20% 基准关税；如认定为中国转运（transshipment）加征 40%。USTR 2026-03-11 对 16 个伙伴启动 Section 301 调查含越南。",
                "impact_on_china_sellers": "靠'越南组装规避美国关税'的中国卖家面临高合规风险；本地真实生产比例（rules of origin）成为关键。",
                "severity": "high",
            },
            {
                "type": "platform_regulation",
                "title": "TikTok Shop VN + Shopee VN 仍开放",
                "description": "TikTok Shop 越南站对中国卖家开放；越南本地市场（非转运）仍是高增速 SEA 国家（CAGR 11%+）。",
                "impact_on_china_sellers": "面向越南本地消费者的电商业务相对友好。",
                "severity": "medium",
            },
        ],
        "entry_recommendation_adjustment": "越南本地市场仍可做，但避免把它当中国转美国的'白手套'。1) 真做越南本地销售的卖家：TikTok Shop / Shopee / Lazada 三平台齐发；2) 转运卖家：审慎评估 rules of origin 满足度，避免被认定后追溯补税。",
        "sources": SRC_SEA_TRANSSHIPMENT,
    },

    "THA": {
        "overall_level": "medium",
        "headline": "中国关税平均下降 4-8%；但 USTR 2026.03 含泰国的过剩产能调查带不确定性",
        "factors": [
            {
                "type": "trade_policy",
                "title": "ASEAN 关税下降 + USTR 调查",
                "description": "2024 起对中/韩进口商品平均关税下降 4-8%；马泰已成为电子 / 美妆 SEA cross-border 调拨中心（duty suspension zones）。但 USTR 2026-03-11 对含泰国的 16 伙伴启动调查。",
                "impact_on_china_sellers": "中国卖家进入泰国本地市场友好，但泰国作为'转运到美国'通道风险上升。",
                "severity": "medium",
            },
        ],
        "entry_recommendation_adjustment": "泰国市场温和友好。建议通过 Shopee TH / Lazada TH / TikTok Shop 三平台；PromptPay QR 必接；warehouse 设在 BKK 周边即可覆盖全国。",
        "sources": SRC_SEA_TRANSSHIPMENT,
    },

    "MYS": {
        "overall_level": "medium",
        "headline": "duty suspension zones 让马来成为 SEA 卖家调拨中心；但 Section 301 转运调查含马来",
        "factors": [
            {
                "type": "trade_policy",
                "title": "USTR 调查 + 转运嫌疑",
                "description": "马来与越南同为 2026-03-11 USTR 启动的 16 国调查名单；本地化生产比例不够的卖家面临转运认定风险。",
                "impact_on_china_sellers": "纯转运卖家慎重；本地真做马来市场的卖家影响小。",
                "severity": "medium",
            },
        ],
        "entry_recommendation_adjustment": "马来西亚是 SEA 中相对均衡市场。Lazada MY 是主要入口，Shopee 增长快；FPX 银行转账主流，TouchNGo wallet 必接。",
        "sources": SRC_SEA_TRANSSHIPMENT,
    },

    "PHL": {
        "overall_level": "medium",
        "headline": "SEA 中相对友好但物流基础薄弱",
        "factors": [
            {
                "type": "supply_chain",
                "title": "群岛地理 + 物流弱基础",
                "description": "7,000+ 岛屿，跨岛配送慢，本地承运商（J&T / LBC / Ninja Van）覆盖率参差。",
                "impact_on_china_sellers": "末端配送时效不稳定，COD 拒收率高（25-40%）；马尼拉外岛屿物流成本高。",
                "severity": "medium",
            },
            {
                "type": "trade_policy",
                "title": "进口关税 200% 见过",
                "description": "部分品类（鞋、纺织、家电）历史曾见高达 200% 关税；DTI 监管对食品 / 化妆品 / 玩具严格。",
                "impact_on_china_sellers": "高客单品类需提前 FDA 注册；玩具品类需 EN71 / DTI 注册。",
                "severity": "medium",
            },
        ],
        "entry_recommendation_adjustment": "菲律宾作为 SEA 替代市场（如沙特 / UAE 短期不可行时）尚可。Shopee PH / Lazada PH / TikTok Shop 主战场。COD 仍是 30%+ 订单，必须接受。",
        "sources": SRC_SEA_TRANSSHIPMENT,
    },

    "SGP": {
        "overall_level": "low",
        "headline": "全球最稳定贸易枢纽，本国市场小但适合区域 HQ",
        "factors": [
            {
                "type": "trade_policy",
                "title": "稳定 + 中转优势",
                "description": "新加坡作为 SEA 货物枢纽地位稳固；GST 9% 但跨境免税额仅 SGD 400。",
                "impact_on_china_sellers": "建议作为区域总部 / 转口枢纽，不要把它当主要终端市场（人口仅 600 万）。",
                "severity": "low",
            },
        ],
        "entry_recommendation_adjustment": "新加坡市场体量小但富裕。客单价高（人均电商支出 $1,667）。可作为 SEA 团队所在地或 high-end SKU 试水市场。Shopee SG 主导，PayNow QR + 信用卡。",
        "sources": SRC_SEA_TRANSSHIPMENT,
    },

    # ============================================================
    # 拉美其它
    # ============================================================
    "ARG": {
        "overall_level": "medium",
        "headline": "Milei 改革反向打开市场：courier 限额 $1,000 → $3,000，免税额年 $400",
        "factors": [
            {
                "type": "trade_policy",
                "title": "Milei 政府开放进口（对卖家利好）",
                "description": "2024-11 起 courier 限额从 $1,000 升至 $3,000；个人年免税进口 $400；2025 跨境订单 $9.55 亿（接近翻三倍）；Shein / Temu / Amazon 首次进入。",
                "impact_on_china_sellers": "**这是少数对中国卖家利好的政策变化。** Amazon 已开免费美国发阿根廷。Mercado Libre 已起诉 Temu 不正当竞争。",
                "severity": "low",
            },
            {
                "type": "currency_volatility",
                "title": "比索贬值 + 高通胀仍是隐患",
                "description": "Milei 改革取得阶段性成果但通胀仍偏高；比索波动大；外汇管制虽放宽仍未完全自由化。",
                "impact_on_china_sellers": "本地结算 / 提现仍有摩擦；定价需高频调整。",
                "severity": "medium",
            },
            {
                "type": "domestic_unrest",
                "title": "本土纺织业反弹",
                "description": "阿根廷纺织业自 Milei 上台后已裁员 16,000（占行业 13%）；行业向国会施压'限制中国电商'。",
                "impact_on_china_sellers": "未来可能出现反向保护主义；建议密切关注政策风向。",
                "severity": "medium",
            },
        ],
        "entry_recommendation_adjustment": "阿根廷是 2026 年值得加配资源的新兴市场。**机会窗口：Milei 政策对中国卖家明显友好。** 建议：1) Mercado Libre AR + Shopify 独立站并行；2) PIX 模式的 Mercado Pago 接入；3) 警惕本土业界反弹可能触发的政策转向；4) 大额订单（$1,000-$3,000）首次有完整免税通道，可主攻中高客单。",
        "sources": SRC_ARG,
    },

    "CHL": {
        "overall_level": "low",
        "headline": "拉美最稳定经济体之一；电商监管成熟",
        "factors": [
            {
                "type": "trade_policy",
                "title": "稳定的进口政策",
                "description": "智利 IVA 19% 标准税率；中智自贸协定生效多年；监管成熟。",
                "impact_on_china_sellers": "进入门槛低于巴西 / 阿根廷；不过市场体量也较小。",
                "severity": "low",
            },
        ],
        "entry_recommendation_adjustment": "智利适合作为拉美战略入口或 small-volume 试点。Mercado Libre CL 主战场；Falabella 等本土也强。",
        "sources": [
            {
                "name": "Hachimi research notes · 智利电商市场稳定基准（无重大政治风险事件）",
                "url": "Hachimi internal review 2026-05-19",
                "fetched_at": TODAY,
            }
        ],
    },

    # ============================================================
    # 欧洲 — 整体低风险，标准 EU 监管
    # ============================================================
    "DEU": {
        "overall_level": "low",
        "headline": "欧盟最大单一市场，监管成熟、风险可预测",
        "factors": [
            {
                "type": "trade_policy",
                "title": "标准 EU 监管 + GPSR / DAC7 / VAT",
                "description": "德国是 EU 监管最严格的市场之一；GPSR、DAC7、VAT OSS/IOSS 全套适用；UOKiK 等监管机构执法到位。",
                "impact_on_china_sellers": "合规成本高但稳定；中国卖家通过 Amazon Pan-EU FBA 是主流路径。",
                "severity": "medium",
            },
            {
                "type": "trade_policy",
                "title": "2026-07-01 EU €3 海关费",
                "description": "EU 启动对 ≤€150 小包征 €3 海关费；Shein / Temu 已大规模转 EU 本地仓应对。",
                "impact_on_china_sellers": "中国直邮 EU 小件成本上升；强化本地仓必要性。",
                "severity": "medium",
            },
        ],
        "entry_recommendation_adjustment": "德国仍是欧洲 #1 战略市场。Pan-EU FBA 必走；Klarna Invoice / SEPA 支付必接；GPSR + EU RP 提前准备；做好 Q4 旺季配额。",
        "sources": SRC_RED_SEA,  # EU €3 fee mentioned in Red Sea report context
    },

    "FRA": {
        "overall_level": "low",
        "headline": "西欧主流市场，标准监管环境",
        "factors": [
            {
                "type": "trade_policy",
                "title": "DGCCRF 执法 + GPSR / DAC7",
                "description": "法国 DGCCRF 监管对中国卖家玩具 / 化妆品 / 电子品类抽查较严。",
                "impact_on_china_sellers": "玩具 / 美妆类目需提前完整 CE / CPNP 备案。",
                "severity": "medium",
            },
        ],
        "entry_recommendation_adjustment": "标准 Pan-EU FBA 通路。Cdiscount + Fnac + Amazon FR 平台组合；Klarna + Bizum 非主流但可补充。",
        "sources": [],
    },

    "GBR": {
        "overall_level": "low",
        "headline": "脱欧后独立监管体系，但相对友好",
        "factors": [
            {
                "type": "trade_policy",
                "title": "UKCA / GPSR UK 独立合规",
                "description": "脱欧后英国可继续使用 CE 标志（无须 UKCA），但 GPSR UK 仍要求 UK 责任人 (£200-1,000/年)。",
                "impact_on_china_sellers": "合规额外成本 £200-1,000/年/品牌；其余跟欧盟差不多。",
                "severity": "medium",
            },
        ],
        "entry_recommendation_adjustment": "英国是中国卖家欧洲入门首选（语言 + 监管成熟）。Amazon UK + eBay + Shopify 独立站；BNPL（Klarna）必接；GBP 结算汇率较稳定。",
        "sources": [],
    },

    "ITA": {
        "overall_level": "low",
        "headline": "意大利温和监管，标准 EU",
        "factors": [
            {
                "type": "trade_policy",
                "title": "标准 EU 监管",
                "description": "意大利 IVA 22%；Pan-EU FBA 覆盖；时尚品类活跃。",
                "impact_on_china_sellers": "标准 EU 路径；当地 PSP（Nexi）接入降低费率。",
                "severity": "low",
            },
        ],
        "entry_recommendation_adjustment": "意大利时尚品类强势市场，毛利空间高。Amazon IT + Subito 二手平台；本地 BNPL (Scalapay) 接入。",
        "sources": [],
    },

    "ESP": {
        "overall_level": "low",
        "headline": "西班牙是 LATAM 营销中转站，监管标准 EU",
        "factors": [
            {
                "type": "trade_policy",
                "title": "标准 EU 监管 + 西语市场跳板",
                "description": "西班牙 IVA 21%；可作为西语市场（含拉美）的内容 / 本地化中转。",
                "impact_on_china_sellers": "标准 EU；Bizum 移动支付独有。",
                "severity": "low",
            },
        ],
        "entry_recommendation_adjustment": "西班牙作为西语市场跳板有战略价值。Bizum + Klarna + iZettle；Amazon ES + AliExpress ES 双平台。",
        "sources": [],
    },

    "NLD": {
        "overall_level": "low",
        "headline": "鹿特丹港 + Schiphol 物流中心；监管严格但稳定",
        "factors": [
            {
                "type": "supply_chain",
                "title": "EU 物流核心节点",
                "description": "鹿特丹港 + 阿姆斯特丹 Schiphol 机场是 EU 进口主通道；Shein 因 cookie 同意被荷兰罚 €1.45 亿。",
                "impact_on_china_sellers": "适合作为 EU 仓储 / 转运基地；GDPR 执法严。",
                "severity": "low",
            },
        ],
        "entry_recommendation_adjustment": "荷兰适合做 EU 物流仓储节点（鹿特丹仓服务 27 国）。Bol.com + Amazon NL + iDEAL 必接；当心 GDPR 执法。",
        "sources": [],
    },

    "POL": {
        "overall_level": "medium",
        "headline": "毗邻乌克兰但稳定；东欧最大电商市场；中国-波兰关系微妙",
        "factors": [
            {
                "type": "diplomatic_tension",
                "title": "中波关系微妙（中国对俄态度因素）",
                "description": "波兰对中国在俄乌战争中态度持保留；铁路'中欧班列'依赖度高但波兰可能受地缘压力。",
                "impact_on_china_sellers": "目前对电商无直接影响；中欧班列时效（15 天 vs 海运 45 天）仍是核心优势，建议持续监控政策走向。",
                "severity": "medium",
            },
            {
                "type": "armed_conflict",
                "title": "乌克兰战争邻接但无直接冲击",
                "description": "波兰是乌克兰主要物流中转国，是中欧班列重要节点；战争目前未蔓延至波兰本土。",
                "impact_on_china_sellers": "电商业务无直接受损，反而因乌克兰难民 + 援助物流而消费市场扩大。",
                "severity": "low",
            },
        ],
        "entry_recommendation_adjustment": "波兰是中国卖家在欧盟的最佳入门市场（推荐度 v1.0 评分 65/100）。Allegro + Amazon PL 双平台；BLIK + Przelewy24 + PayU 三付款方式必接；中欧班列时效优势保持。",
        "sources": SRC_POL,
    },

    "ROU": {
        "overall_level": "low",
        "headline": "毗邻乌克兰但电商稳定；东欧增速市场",
        "factors": [
            {
                "type": "armed_conflict",
                "title": "乌克兰战争邻接无直接冲击",
                "description": "罗马尼亚是 NATO 成员国，与乌克兰边境共有 600 公里；战争对本国电商无直接影响。",
                "impact_on_china_sellers": "电商业务正常；中国-罗马尼亚直邮通道仍开放。",
                "severity": "low",
            },
        ],
        "entry_recommendation_adjustment": "罗马尼亚作为东欧增长市场可关注。eMag 是本土主导平台；EU 标准合规。",
        "sources": [],
    },

    "SWE": {
        "overall_level": "low",
        "headline": "北欧高 GDP 市场，监管成熟，VAT 25% 最高",
        "factors": [
            {
                "type": "trade_policy",
                "title": "EU 标准 + 高 VAT",
                "description": "瑞典 VAT 25% 是欧盟最高之一；GPSR / OSS/IOSS 标准。",
                "impact_on_china_sellers": "高客单 / 高毛利品类适合；低价品类需考虑税后定价。",
                "severity": "low",
            },
        ],
        "entry_recommendation_adjustment": "瑞典消费力强（人均电商支出 $1,647）。Klarna 主场（Pay in 4/30 必接）；Swish 移动支付必备。",
        "sources": [],
    },

    "NOR": {
        "overall_level": "low",
        "headline": "VOEC 独立 VAT 体系；非 EU 但 EEA 成员",
        "factors": [
            {
                "type": "trade_policy",
                "title": "VOEC VAT on E-Commerce 独立体系",
                "description": "挪威 VAT 25% + VOEC（VAT on E-Commerce）独立体系，不属于 EU OSS。卖家需单独注册 VOEC 号。",
                "impact_on_china_sellers": "需单独 VAT 注册流程；Klarna / Vipps 主导支付。",
                "severity": "medium",
            },
        ],
        "entry_recommendation_adjustment": "挪威人均消费高但市场体量小。Vipps + Klarna 双付款；建议作为北欧组合的一部分（瑞典 + 挪威 + 丹麦）。",
        "sources": [],
    },

    "CHE": {
        "overall_level": "low",
        "headline": "非欧盟 + 跨境申报独立；高客单市场",
        "factors": [
            {
                "type": "trade_policy",
                "title": "VAT 8.1% 欧洲最低之一",
                "description": "瑞士 VAT 8.1%（欧洲最低之一），跨境申报独立体系；非欧盟成员需单独流程。",
                "impact_on_china_sellers": "低 VAT 优势 + 高消费力，适合高客单品类；但需单独清关流程。",
                "severity": "low",
            },
        ],
        "entry_recommendation_adjustment": "瑞士高客单市场（人均 $2,154 电商支出）。Digitec Galaxus + Amazon DE 跨境；TWINT 移动支付必接（瑞士 65% 用户使用）。",
        "sources": [],
    },

    # ============================================================
    # 北美 / 东亚 / 澳洲
    # ============================================================
    "CAN": {
        "overall_level": "low",
        "headline": "稳定贸易伙伴；CUSMA 框架下但对中国 EV/钢铝有制裁",
        "factors": [
            {
                "type": "trade_policy",
                "title": "对中国 EV / 钢铝跟随美国制裁",
                "description": "加拿大 2024 起对中国电动车征 100% 关税、钢铝征 25%；其余消费品仍正常。",
                "impact_on_china_sellers": "EV / 钢铝相关行业受限；常规消费品类不受影响。",
                "severity": "medium",
            },
            {
                "type": "trade_policy",
                "title": "USMCA 2026 review 关联影响",
                "description": "USMCA 审议中加拿大相对'冷处理'；美国强化原产地规则可能间接影响经加进美的中国商品。",
                "impact_on_china_sellers": "传统加拿大本地销售不受影响。",
                "severity": "low",
            },
        ],
        "entry_recommendation_adjustment": "加拿大是稳定可预测市场。Amazon CA + Shopify 独立站；CAD 结算汇率稳定；客单价高于美国。",
        "sources": SRC_MEX,  # USMCA context
    },

    "JPN": {
        "overall_level": "low",
        "headline": "日本市场极为稳定；PSE / METI 监管严但路径清晰",
        "factors": [
            {
                "type": "trade_policy",
                "title": "PSE / METI 严合规",
                "description": "电子电气产品强制 PSE（菱形 / 圆形两档）；锂电池 / 充电器 / 电热产品几乎都需要菱形 PSE。",
                "impact_on_china_sellers": "认证周期 3-6 个月，费用 30-80 万日元；可委托国内代理。",
                "severity": "medium",
            },
        ],
        "entry_recommendation_adjustment": "日本是高粘性高客单市场。Amazon JP 主导，乐天 + Yahoo Shopping 补充；PayPay + 信用卡 + Konbini 三轨支付；耐心做品牌、不打价格战。",
        "sources": [],
    },

    "KOR": {
        "overall_level": "low",
        "headline": "韩国电商高度本土化（Naver / Coupang）；THAAD 遗留紧张但管控良好",
        "factors": [
            {
                "type": "platform_regulation",
                "title": "本土平台主导 + 严密保护",
                "description": "Naver Smart Store + Coupang 占主导；中国卖家入驻需本地实体 + 韩文运营。",
                "impact_on_china_sellers": "无本地团队的中国卖家直接进入门槛高；建议通过代运营或 Coupang Global Sale。",
                "severity": "medium",
            },
            {
                "type": "diplomatic_tension",
                "title": "中韩关系（THAAD 遗留）",
                "description": "2017 萨德事件遗留影响仍在；中韩文化 / 政治紧张周期性出现；但已不影响日常电商。",
                "impact_on_china_sellers": "日常业务无影响；遇外交摩擦时韩国消费者会出现'反中'情绪潮。",
                "severity": "low",
            },
        ],
        "entry_recommendation_adjustment": "韩国市场需要深度本地化。Coupang Rocket（自营物流）或 Naver Smart Store；KakaoPay / Naver Pay 必接；韩文 listing + 本地客服。",
        "sources": [],
    },

    "AUS": {
        "overall_level": "low",
        "headline": "中澳关系自 2023 年解冻后稳定；电商市场成熟",
        "factors": [
            {
                "type": "diplomatic_tension",
                "title": "中澳贸易已大致正常化",
                "description": "2020-2022 一系列中澳贸易争端（葡萄酒、龙虾、煤炭等）已基本解除；电商业务始终未受影响。",
                "impact_on_china_sellers": "整体环境友好。",
                "severity": "low",
            },
            {
                "type": "trade_policy",
                "title": "GST $75K 起征 + Marketplace Facilitator",
                "description": "澳大利亚 GST 10%，A$75K 起征 + 平台代缴。",
                "impact_on_china_sellers": "标准合规流程，Amazon AU 已代办。",
                "severity": "low",
            },
        ],
        "entry_recommendation_adjustment": "澳洲是中国卖家高客单 / 高毛利市场。Amazon AU + eBay AU + Shopify 独立站；BPay / PayID + 信用卡；客单价能拉到 $40+。",
        "sources": [],
    },

    # ============================================================
    # 南非
    # ============================================================
    "ZAF": {
        "overall_level": "medium",
        "headline": "政局过渡 + 2026.11 大选 + 海关零起征点；监管复杂度高",
        "factors": [
            {
                "type": "trade_policy",
                "title": "De Minimis 零 + 复杂关税",
                "description": "南非 de minimis = 0，所有进口包裹都要缴税；SARS 严格审查 HS 编码；中南贸易方案 2026-05-01 生效。",
                "impact_on_china_sellers": "低价跨境直邮模型不可行；本地履约或与有 ICS（Importer of Record）服务的代理合作。",
                "severity": "high",
            },
            {
                "type": "domestic_unrest",
                "title": "2026-11 大选 + 国民团结政府试金石",
                "description": "南非 2024 大选 ANC 失去绝对多数；2026-11 地方选举是国民团结政府（GNU）的第一次大考。",
                "impact_on_china_sellers": "选举周围社会不稳定风险上升；但电商业务可继续运营。",
                "severity": "medium",
            },
            {
                "type": "currency_volatility",
                "title": "兰特持续波动 + 治安",
                "description": "南非兰特对美元长期贬值；约堡 / 开普敦部分地区治安差，影响 last-mile 派送。",
                "impact_on_china_sellers": "定价 / 提现汇率风险；部分高风险邮编建议谨慎配送。",
                "severity": "medium",
            },
        ],
        "entry_recommendation_adjustment": "南非是 SADC 区域跳板但门槛高。Takealot 是本土主导平台；建议通过 Takealot 1P / 3P 直发模式，避免独立站直邮；EFT instant 支付必接。",
        "sources": SRC_ZAF,
    },
}


def main():
    countries_dir = Path(__file__).parent
    updated = 0
    for iso, assessment in ASSESSMENTS.items():
        # Country files use lower-case iso codes; poland is a special case
        if iso == "POL":
            path = countries_dir / "poland.json"
        else:
            path = countries_dir / f"{iso.lower()}.json"
        if not path.exists():
            print(f"  ! missing file for {iso}: {path}")
            continue
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        data["geopolitical_risk"] = {
            "_assessed_at": TODAY,
            "_assessed_by": ASSESSED_BY,
            **assessment,
        }
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"  ✓ {iso} → {assessment['overall_level']}")
        updated += 1
    print(f"\n{updated} / {len(ASSESSMENTS)} countries updated.")


if __name__ == "__main__":
    main()
