# 独立站 ROI 计算公式合集 — Meta + TikTok 投放版本

> 版本 v1.0 | 2026-05-19  
> 适用：独立站（Shopify / 自建）+ Meta (Facebook + Instagram) 或 TikTok Ads 投放  
> 模式：一件代发（1688 直发到客户）+ 退货路径 A（弃货 + 全额退款）  
> ❌ 不适用：Amazon、TikTok Shop（这两个有单独公式）

---

## 1. 变量定义

### 1.1 商品 & 销售

| 符号 | 含义 | 单位 | 默认值（家居中件） |
|------|------|------|----------------|
| P | AOV / 客单价（含税前售价） | USD | $100 |
| d | 折扣率 | % | 10% |
| t | 销售税 / VAT 率 | % | 详见说明 |

**关于 t 的说明：**
- 🇺🇸 美国：sales tax 由消费者额外支付，**不进商家收入**，t = 0
- 🇪🇺 欧盟：VAT 含价，t = 19-27%（按国家）
- 🇬🇧 英国：VAT 20%
- 🇯🇵 日本：消费税 10%

### 1.2 平台 & 支付

| 符号 | 含义 | 默认值 |
|------|------|-------|
| c | 平台抽成率（含支付手续费） | 3.2%（Shopify + Shopify Payments）|
| a | Affiliate / 达人分成率 | 0（独立站无 affiliate） |

**c 取值参考：**
- Shopify Basic + Shopify Payments (US)：2.9% + $0.30/单 ≈ 3.2%（按 $100 AOV）
- Shopify Advanced + Shopify Payments：2.5% + $0.30 ≈ 2.8%
- 自建 + Stripe (US 卡)：2.9% + $0.30 ≈ 3.2%
- 自建 + Stripe (UK 卡)：1.5% + 20p ≈ 1.7%
- 自建 + Stripe (EU 卡)：1.5% + €0.25 ≈ 1.7%

### 1.3 物流 & 货值

| 符号 | 含义 | 默认值 |
|------|------|-------|
| SC | 单件正向物流（中国国际小包到客户） | $8 |
| COGS | 单件 1688 出厂价（含打包） | $25 |

### 1.4 退货

| 符号 | 含义 | 默认值 |
|------|------|-------|
| RR | 退货率 | 7%（独立站家居家具） |
| U | 单件不可退手续费（Stripe 等） | $0.30 |

**RR 参考（家居家具）：**
- 美国独立站：4-7%（Shopify Plus 报告）
- 欧洲独立站：6-10%
- 日本：2-5%（文化性低退货）

### 1.5 广告（Meta 或 TikTok 二选一，公式相同）

| 符号 | 含义 | Meta US Home 默认 | TikTok US Home 默认 |
|------|------|------------------|-------------------|
| CPM | 千次曝光成本 | $20 | $12 |
| CTR | 点击率 | 1.48% | 0.9% |
| CVR | 转化率（点击→下单） | 1.2% | 1.0% |
| AC | 总广告花费 | $1000（举例） | $1000（举例） |

---

## 2. 核心公式

### 2.1 单笔订单经济

```
净销售额：
  NetSales = P × (1 - d) / (1 + t)

保单利润（占 1-RR 比例）：
  Profit_kept = NetSales × (1 - c - a) - SC - COGS

返单损失（占 RR 比例）：
  Profit_returned = -(SC + COGS + U)
  ↑ 弃货模式：钱全退给客户，付出的物流+货值损失，加上 Stripe 不退的手续费

单笔预期贡献毛利（不含广告）：
  E_unit = (1 - RR) × Profit_kept + RR × Profit_returned
        = (1 - RR) × NetSales × (1 - c - a) - (SC + COGS) - RR × U
```

⚠ **关键点**：`(SC + COGS)` 不乘 `(1-RR)`，因为不管订单退不退，发货已经发生、运费已经付了。

### 2.2 广告漏斗 → 订单数

```
总订单数（来自广告）：
  N = AC × 1000 × CTR × CVR / CPM

等价写法：
  N = AC / AdCost_per_order

每订单广告费：
  AdCost_per_order = CPM / (1000 × CTR × CVR)
```

### 2.3 总贡献毛利、净利、ROI

```
总贡献毛利（不含广告费）：
  G = N × E_unit

总净利：
  Total Net Profit = G - AC

单笔净利：
  Per-Unit Net Profit = E_unit - AdCost_per_order
                      = (1-RR) × NetSales × (1-c-a) - (SC+COGS) - RR × U
                        - CPM / (1000 × CTR × CVR)
```

### 2.4 ROI 系列指标

```
ROI (Marginal ROI) = G / AC
   ↑ 推荐用法。>1x 即盈利

Net ROI = (G - AC) / AC = ROI - 1
   ↑ 财务报表口径。>0 即盈利

ROAS (Return on Ad Spend) = N × NetSales / AC
                          = (1000 × CTR × CVR / CPM) × NetSales
   ↑ 仅看广告投入产出，不考虑成本

Break-Even ROAS = NetSales / E_unit
   ↑ ROAS 必须 > 此值才能赚钱

MER (Marketing Efficiency Ratio) = Total Sales / Total Ad Spend
   ↑ 跨渠道总账，建议早期关注（避免多渠道归因双重计算）
```

### 2.5 毛利 / 净利率三层

```
毛利率（Gross Margin）：
  Gross Margin = (NetSales - COGS) / NetSales
   ↑ 财报口径，家居家具健康线 50-70%

贡献毛利率（Contribution Margin）：
  Contribution Margin = E_unit / NetSales
   ↑ 投放决策口径，家居家具健康线 30-50%

净利率（Net Profit Margin）：
  Net Profit Margin = Per-Unit Net Profit / NetSales
   ↑ 真实盈亏，目标 5-15%
```

---

## 3. 完整示例：美国市场 + Meta 投放

### 输入

```
P = $100, d = 10%, t = 0% (US sales tax 客户付)
c = 3.2% (Shopify Basic + Shopify Payments), a = 0
SC = $8, COGS = $25, U = $0.30
RR = 7%
CPM = $20, CTR = 1.48%, CVR = 1.2%
AC = $1000 (举例总广告费)
```

### 计算过程

```
NetSales = 100 × 0.9 / 1.0 = $90.00

Profit_kept = 90 × (1 - 0.032 - 0) - 8 - 25
           = 90 × 0.968 - 33
           = 87.12 - 33
           = $54.12

Profit_returned = -(8 + 25 + 0.30) = -$33.30

E_unit = 0.93 × 54.12 + 0.07 × (-33.30)
      = 50.33 - 2.33
      = $48.00

AdCost_per_order = 20 / (1000 × 0.0148 × 0.012)
                = 20 / 0.1776
                = $112.61

Per-Unit Net Profit = 48.00 - 112.61 = -$64.61

N = 1000 × 1000 × 0.0148 × 0.012 / 20
  = 8.88 单

G = 8.88 × 48.00 = $426.24

Total Net Profit = 426.24 - 1000 = -$573.76
```

### 输出 KPI

| KPI | 值 | 健康线 | 状态 |
|-----|-----|------|------|
| 毛利率 | 72.2% | 50-70% | ✅ |
| 贡献毛利率 | 53.3% | 30-50% | ✅ |
| **净利率** | **-71.8%** | 5-15% | ❌ |
| ROAS | 0.80x | > 3x | ❌ |
| **ROI (Marginal)** | **0.43x** | > 1.5x | ❌ |
| Net ROI | -57% | > 0% | ❌ |
| Break-Even ROAS | 1.88x | (你的 ROAS 阈值) | — |

### 结论

按行业平均跑，**亏钱**。要让这单赚钱需要做到以下任一：

| 杠杆 | 当前值 | 需达到 |
|-----|------|--------|
| CTR | 1.48% | > 2.5%（创意优化） |
| CVR | 1.2% | > 3%（落地页 + 评论 + EDM） |
| CPM | $20 | < $8（换 SEA 市场） |
| AOV | $100 | > $250（套装/大件） |
| 任意 2 项组合 | — | 多管齐下 |

---

## 4. Meta vs TikTok 渠道差异

公式**完全相同**，只是 CPM/CTR/CVR 数值不同。

### 4.1 默认值对比（家居家具）

| 维度 | Meta (FB/IG) | TikTok |
|-----|------------|--------|
| **CPM US** | $20-23 | $10-14 |
| **CPM UK** | $10-12 | $8-12 |
| **CPM DE/FR** | $9-10 | $4-8（红利期） |
| **CPM SEA** | $2-7 | $0.5-5 |
| **CTR (Furniture)** | 1.48% | 0.68-1.2% |
| **CVR (独立站)** | 0.8-1.8% | 0.8-1.5% |
| **决策周期** | 2-4 周 | 短，冲动消费偏多 |
| **创意要求** | 静图 / 短视频 / Carousel | 短视频为主，UGC 强 |
| **建议归因窗口** | 28d click + 1d view | 7d click + 1d view |
| **受众定向** | 兴趣 + 行为 + LAL | 兴趣 + LAL + Spark Ads |

### 4.2 TikTok 示例（用默认值，跟 Meta 对比）

```
输入：CPM = $12, CTR = 0.9%, CVR = 1.0%（其他同 Meta 示例）

N = 1000 × 1000 × 0.009 × 0.010 / 12 = 7.5 单
AdCost_per_order = 12 / (1000 × 0.009 × 0.010) = $133.33
E_unit = $48.00（同 Meta，因为商品端不变）
Per-Unit Net Profit = 48 - 133.33 = -$85.33
ROI = (7.5 × 48) / 1000 = 0.36x ❌
```

TikTok 默认值跑出来比 Meta 更差，因为 CTR/CVR 偏低（虽然 CPM 也低）。**美国市场 TikTok 跑家居家具的 MER 行业最低（0.20，垫底）**——靠头部达人直播 + 短视频铺量才能拉起来，但那是 TikTok Shop 模式，不是这里说的纯独立站承接。

### 4.3 SEA 市场示例（TikTok 红利期）

```
输入（印尼/泰国）：
P = $30 (小件家居), AOV 低
COGS = $5 (1688 价更低)
SC = $4 (RCEP 内物流便宜)
CPM = $1, CTR = 1.5%, CVR = 2%
其他不变

NetSales = 30 × 0.9 / 1.0 = $27
E_unit = 0.93 × (27 × 0.968 - 4 - 5) + 0.07 × (-9.30)
      = 0.93 × 17.13 - 0.65
      = $15.28

N = 1000 × 1000 × 0.015 × 0.02 / 1 = 300 单
AdCost_per_order = 1 / (1000 × 0.015 × 0.02) = $3.33
Per-Unit Net Profit = 15.28 - 3.33 = $11.95
ROI = (300 × 15.28) / 1000 = 4.58x ✅
```

**同样的逻辑公式，SEA 跑出来 ROI = 4.58x（盈利），美国跑 0.43x（亏）**。市场选对了，公式就能转正。

---

## 5. 健康阈值（家居家具品类）

| KPI | 优秀 | 健康 | 警戒 | 淘汰 |
|-----|-----|------|------|------|
| ROI (G/AC) | > 3x | 1.5-3x | 1.0-1.5x | < 1.0x |
| 净利率 | > 15% | 5-15% | 0-5% | < 0% |
| ROAS | > 5x | 3-5x | Break-Even ~ 3x | < Break-Even |
| Break-Even ROAS | < 2x | 2-3x | 3-4x | > 4x |
| 贡献毛利率 | > 45% | 30-45% | 20-30% | < 20% |
| 毛利率 | > 65% | 50-65% | 40-50% | < 40% |
| MER (全渠道) | > 4x | 2.5-4x | 1.5-2.5x | < 1.5x |

---

## 6. 数据源映射（每个变量从哪里拿）

| 变量 | 数据源 | 获取方式 |
|------|-------|---------|
| P, d | Shopify Admin GraphQL `orders` query | 实时 |
| t | Avalara AvaTax / WTO 静态表 | 实时或查表 |
| c | Shopify Payments 费率表 / Stripe API | 查表 |
| SC | Easyship API `POST /rates` | 实时按重量+体积+地址 |
| COGS | OneBound 1688 API `item_get` | 月度更新 |
| RR | Shopify Returns API + NRF 报告 | 季度 |
| U | Stripe 费率表 | 查表（$0.30）|
| CPM, CTR, CVR | Meta Marketing API / TikTok Marketing API | 近实时（自家数据）|
| CPM 行业 benchmark | WordStream / Triple Whale / AdAmigo | 季度报告 |
| AC | 平台自家 spend 字段 | 实时 |

详见 `哈奇米_数据源对照表_v1.0.xlsx` 的「公式映射」sheet。

---

## 7. 关键设计选择（为什么这样写）

### 7.1 为什么 ROI = G / AC 而不是 (G-AC) / AC？

两种都是行业 standard，但 `G / AC` 有 3 个优势：

1. 跟 ROAS 同量级（ROAS = 6.0x, ROI = 1.5x，关系直观）
2. 跟 Marketing Mix Modeling、Triple Whale、Northbeam 等工具默认口径一致
3. 沟通方便（"ROI = 1.5x" 一眼懂）

`(G-AC) / AC` 是 Net ROI，等价表达 `= ROI - 1`，财务报表口径。两者**等价**，只是表达不同。

### 7.2 为什么 SC + COGS 不乘 (1-RR)？

因为不管订单退不退，发货已经发生。退货时损失的是「没收到的销售收入」+「不可退手续费」，**不是又损失一次 SC + COGS**。

正确处理是用"概率混合期望"：

```
保单情况 × (1-RR) + 返单情况 × RR
= (1-RR)(NetSales(1-c-a) - SC - COGS) + RR × (-(SC+COGS+U))
= (1-RR) × NetSales × (1-c-a) - (SC+COGS) - RR × U   ← SC+COGS 合并出来
```

### 7.3 为什么 RL 里不放 SUAC（每单广告费）？

如果把 SUAC 放在 RL（return loss）里再乘 RR，然后 `ROI = (G-AC)/AC` 又扣一次 AC，广告费会被**双重扣减 RR × AC**。

正确做法：RL 仅包含「现金损失」部分（COGS + SC + U），广告费 AC 单独算（已经包含全部花费）。

### 7.4 为什么用一件代发 + 路径 A？

跨境家居家具早期阶段：
- 一件代发：无海外仓存货成本，资金占用低
- 路径 A 弃货：货值 < 逆向物流时（90% 小件家居都是这样），直接送给客户最划算
- 跟 Shopify Returnless Refund 功能配合天然

如果未来切到海外仓（FBA 等），公式要加入仓储分摊、逆向物流、二手转售等变量。

---

## 8. 待扩展场景（未来版本）

| 场景 | 需要新增变量 | 公式变化 |
|------|----------|--------|
| Amazon FBM | CPC 替代 CPM；Referral 15%；OR (Organic Ratio) | N 公式变；新增 ACoS/TACoS |
| Amazon FBA | + FBA 履约费 + 仓储费 + 长期仓储费 | COGS 替换成 Landed Cost |
| TikTok Shop | + Affiliate 分成 a 15-25%；+ 直播 GPM | a 不再为 0 |
| 海外仓发货 | + 仓储费 + 头程分摊 + 逆向物流（路径 C） | 退货路径变 |
| 多产品多市场 | SKU × Market × Channel 矩阵 | 公式不变，输入维度扩展 |

---

**版本历史：**
- v1.0 (2026-05-19)：初版，独立站 + Meta/TikTok 一件代发模式

**待办：**
- v1.1：Amazon FBM 版本
- v1.2：TikTok Shop 版本（含达人分成 + GPM）
- v1.3：海外仓 + 多退货路径自动选择

