# CTR / CVR 打法实施手册（深度展开版）

> 配套文件：CTR与CVR打法清单_SOTA实操版.md（速查）
> 本文件 = 每个名词 + 每个打法都展开到"能直接照做"

---

# 第一部分 · 视频 CTR 提升打法

## 1. 黄金 3 秒 Hook —— 为什么决定生死

### Hook Rate 是什么
**Hook Rate = 3-Second Video Plays ÷ Impressions**。Meta Ads Manager 里能直接调出来，TikTok 叫 "6-Second View Rate"。它衡量的不是有多少人看完，而是**有多少人愿意停下来不滑走**。

为什么这是生死线？因为 Meta 和 TikTok 的算法核心机制：**Hook Rate 高 → 算法判定素材有吸引力 → 把素材推送给更精准的人群 → 下游 CVR 自然抬升**。Hawky AI 实测过 40% Hook Rate 这条线后，CVR 通常翻倍。反之 Hook Rate < 25% 的素材，CPM 会被算法惩罚，越投越贵。

**实操判读**：
- < 25% → 立即关停，换素材
- 25-30% → 边缘，迭代 Hook 再试
- 30-40% → 良好，可以加预算
- 40%+ → 顶级，进入 scaling 阶段

### Pattern Interrupt（模式打断）是什么
人脑对"预期外的信号"会本能停顿 0.3-0.5 秒，这就是 Pattern Interrupt 创造的窗口。具体三类：

**视觉打断**：违和构图（产品出现在不该出现的地方，比如冰箱里的化妆品）、超大特写第一帧、慢动作开场、倒放（"先看结果再看过程"）、极端机位（鱼眼/俯视/手机贴脸）。

**听觉打断**：开场 0.5 秒突然爆发的音效、安静中突然说话、Q 版音效配真人画面、流行歌曲卡点突然换 BGM。

**信息打断**：开场就是反问（"为什么医生都讨厌这个 $20 产品？"）、矛盾陈述（"我已经 30 年没用过洗发水了"）、悬念（"这个东西改变了我的睡眠..." + 黑屏 1 秒）、超具体数字（"7 天瘦 5cm"比"快速瘦身"强 3-5 倍）。

### 三层叠加 Hook 怎么做（手把手）
**第 0 秒**：文字 Hook 上屏，6-10 个字。例："你的脸正在老化"、"医生都不告诉你"、"99% 人不知道"。
**第 1.5 秒**：口播 Hook，与文字呼应或制造反差。例：文字"老化"，口播"但其实和年龄无关"。
**第 2 秒**：视觉跳变，至少做一次 jump cut（跳剪），产品/人脸/对比图突然出现。

这三层叠加的逻辑是**多感官同时刺激**——用户即使在静音状态（70% 移动端默认静音），也能被文字 + 视觉留住。

### Hook Stacking（Hook 叠加）
不是三层叠加（那是 0-2 秒内），Hook Stacking 是**前 5-7 秒连续用 2-3 个独立 Hook**。例：

- 0-2s：文字 Hook"你的皮肤为什么暗沉？"+ 特写脏脸毛巾
- 2-4s：第二个 Hook，UGC 真人出镜"我用了 3 年高端护肤品都没用"
- 4-6s：第三个 Hook，对比图 before/after + 突出 7 天数据

每个 Hook 都给用户一个"再看 2 秒"的理由，链式留住到 Solution 段。

### 实例参考（直接抄）
- **Pattern Interrupt + 数字 + 痛点**：「我用 X 7 天解决了 Y」
- **Masking Reveal**：开场不让你看到产品，第 3-5 秒才揭示
- **POV 视角**：「POV: 你刚发现这个东西能…」
- **反问开场**：「为什么没人告诉我…」「这是合法的吗？」
- **超具体证言**：「我 47 岁，这是我用过最…」（年龄/数字越具体越停得住）

---

## 2. UGC 爆款五段式 —— 不是"找达人拍视频"那么简单

### 什么是 UGC（User-Generated Content）广告
不是真的"用户自发"，是**模仿用户口吻拍的广告**——手持手机视角、自然光、口语化、非专业演员。为什么有效？因为它在信息流里和真实视频混在一起，用户在意识到"这是广告"之前已经被内容吸进去了。Segwise 数据：UGC 比传统 TVC 广告效果 +28%，获客成本 -217%。

### 五段式具体脚本模板

**Hook (0-3 秒)**：开场即点名人群或痛点。
模板：「如果你也 [痛点描述]，那这条视频你必须看完」
例："如果你也每天熬夜，但又怕长痘..."

**Problem (3-10 秒)**：30 秒内的"共情建立期"。说自己以前的挣扎，试过什么没用——这一段不要提产品。
模板：「我之前试过 A、B、C，结果 [负面后果]」
例："我以前买过药店的、网红推的，每次都过敏..."

**Solution (10-18 秒)**：产品第一次出现。手持产品 + 近景操作 + real-life 场景（卧室、卫生间、办公桌，不要摄影棚）。
模板：「直到我朋友/医生/姐姐推荐我用 [产品]」
例："直到我闺蜜让我试这个，第一次用的时候我..."

**Proof (18-25 秒)**：证据。最强的顺序：
1. Before/After 对比图（视觉冲击）
2. 第三方数据（"7 天减少 60% 红血丝"——FDA/临床数据加分）
3. 多人证言（截图三条 review，0.5 秒一闪）

**CTA (25-30 秒)**：Dual-Coded（口播 + 屏幕文字同步）。
- ❌ 弱 CTA："Learn more" / "Visit our website"
- ✅ 强 CTA："Get yours today" / "Tap below before it sells out" / "Use code SAVE20 for 20% off"

加 urgency：「限时 24h」「库存只剩 50 件」（**真稀缺才用**，假倒计时会被 Meta 惩罚账户）。

### 关键执行细节
- **时长 25-35 秒**：Reels/TikTok 黄金长度，太短没空间讲故事，太长 retention 崩
- **9:16 竖版**：横版在 Reels CTR 比 9:16 低 35%（Meta 官方）
- **永远加字幕**：70% 用户静音观看，没字幕等于没声音
- **第一帧不要黑屏 / Logo**：信息流自动播放时 Logo 第一帧 = 直接被识别为广告划走

---

## 3. 抄爆款的工具与方法（详细步骤）

### Meta Ad Library 怎么用
**网址**：facebook.com/ads/library

**操作步骤**：
1. 选 Country（你的目标市场）→ 选 "All Ads" → 输入竞品品牌名
2. 筛选条件：Platform = Facebook/Instagram，Active status = Active
3. 关键筛选：**点开广告看 "Started running on" 日期**——跑满 30/60/90 天的基本盈利，因为亏钱的早就关了
4. 拆解 4 件事：① Hook 首句 ② Offer 结构（折扣/赠品/bundle） ③ 视觉模板（光线、机位、配色） ④ CTA 文案

**避坑**：单条新广告 ≠ 盈利。要"长寿命（>30 天） + 多变体同投（同一品牌跑 3-5 个变体）"双条件才算真爆款。

### TikTok Creative Center 怎么用
**网址**：ads.tiktok.com/business/creativecenter

**最有用的两个模块**：
- **Top Ads**：按"行业 + 地区 + 7/30 天"双窗口看 Top 表现。每周拉 15-20 条，建一个 50-100 条的素材参考库
- **Top Products**：看哪些品在涨，配合 Trend Discovery 模块判断品类红利期

**抄作业方法**：选定一条爆款 → 截前 5 秒每秒一帧 → 列出"视觉元素 / 文字 / 口播 / 音效" → 用同样结构换你的产品拍一条。

### Foreplay（业内最专业的 swipe 工具）
**核心功能**：Chrome 插件一键收藏 Meta/TikTok 广告，AI 自动拆 Hook/Testimonial/CTA 段落，"Briefs"功能批量生成脚本。

**用法**：
1. 装 Chrome 插件
2. 刷信息流时看到好广告点收藏 → 自动按"行业 / Hook 类型 / 形式"归类
3. 周末复盘时用 "AI Brief" 把 5-10 条爆款合成一份脚本模板
4. 模板交给 UGC 达人或 AI 工具量产

Gymshark 7 亿美金广告打法已被 Foreplay 公开复刻——这家用的就是"用 Foreplay 系统化复用爆款结构"。

### PiPiADS（TikTok 专用）
**适合做什么**：5000 万+ TikTok 广告库，"Winning Products" 按 spend 表现筛品。最大用途不是抄广告，是**反向找品**——看现在哪些品在 TikTok 起量、跑了多久、用什么 Hook。

### Atria（一站式自动化）
**杀手锏**：连你自己的 Meta/TikTok 账户 → 拉竞品广告 → AI 改写脚本 → 一键批量上传到 Ads Manager。适合已经有素材方法论、想把"找爆款 → 改脚本 → 发布"流程从 5 小时压到 30 分钟的团队。

---

## 4. 测试节奏与迭代（精确到天）

### 创意衰退周期
- **Meta**：拉新（cold audience）3-4 周开始疲劳，retargeting 6-8 周
- **TikTok**：几天到 2 周即衰，TikTok 用户对重复素材容忍度极低

为什么衰退这么快？因为 Meta/TikTok 算法都有"频次惩罚"——同一用户看到同一素材超过 3-5 次后，算法主动降权。

### 换素材频率
- **Meta**：每 2-4 周一批新素材（5-10 条/批）
- **TikTok**：每周一批新素材（3-5 条/周）

**顶级账户标准**：50-70 条/周新素材产出量。听起来很多？但用 AI 工具栈（Foreplay 找 Hook → Arcads/Creatify 量产）一个人就能做到。

### 测试结构（CRO 思维做素材测试）

**第一步：Hook 测试（48-72 小时）**
- 同一产品、同一 Solution/Proof/CTA，只换前 3 秒 Hook
- 跑 3-4 个变体，每个变体 $20-50/天
- 看 Hook Rate（首要） + CTR（次要） + ATC rate（参考）
- Hook Rate < 25% → 立即关停
- Hook Rate > 35% + CTR > 1.5% → 进入第二步

**第二步：Angle 测试（情绪 vs 理性）**
- 同一 Hook，换 Solution 段的"卖点角度"
- 例：理性「医学数据」vs 情绪「妈妈终于睡了整觉」
- 跑 7 天，看 ROAS

**第三步：Proof 形式测试**
- Before/After vs 数据数字 vs 多人证言 vs 专家背书
- 这一步影响 ATC → Purchase 的转化，可以测 14 天

### 预警系统
设一个"红线指标"：**单条素材 CTR 7 天内下滑 10%**——这是创意疲劳的早期信号。出现就立即换素材，不要等 ROAS 崩。等 ROAS 崩才换，预算已经烧了一半。

---

## 5. AI 制作工具栈使用细节

### 工具对比与场景

| 工具 | 适合做什么 | 一条成本 | 上手难度 |
|---|---|---|---|
| Arcads | UGC 真人 AI 演员，付费投流主力 | $3-5 | 中 |
| Creatify | 贴产品 URL 自动出视频 | $1-3 | 低 |
| HeyGen | 多语言本地化（同脚本变 10 国语言） | $2-4 | 中 |
| Topview.ai | 电商产品向，自动接 Meta Ads Manager | $1-2 | 低 |
| Captions | AI 字幕 + 口型/表情增强 Hold Rate | $1 | 极低 |

### 推荐组合工作流

**新手起步（一周内能落地）**：
1. Foreplay 收集 20 条爆款（1 小时）
2. 用 ChatGPT/Claude 写 10 条脚本（参考爆款结构，1 小时）
3. Creatify 一键生成 10 条视频（30 分钟）
4. Captions 加字幕 + 优化（30 分钟）
5. 投 Meta，3-4 变体一组测 Hook

**成熟期（一周 50 条标准）**：
- Foreplay 找 Hook（系统化）
- Arcads 量产真人 UGC（多演员 × 多脚本）
- HeyGen 做多市场本地化（一条英文 → ID/TH/VN/MX）
- Motion 追踪每条素材衰退情况
- Triple Whale 校准 ROAS 归因

### 关键警告
AI UGC 不是万能。**美妆、护肤、医疗品类**用户能识破 AI 演员 → CTR 反而低。这些品类**仍然推荐真人 UGC**，AI 工具只用来生成 B-roll 和字幕。

---

# 第二部分 · 独立站 CVR 提升打法

## 1. PDP（Product Detail Page）—— 最关键的单页面

### 为什么 PDP 决定 CVR
广告流量进站 → 90% 第一站就是 PDP。PDP 的"首屏 3 秒"和广告"前 3 秒"一样关键。Mobiloud 数据：PDP 优化能带来 10-30% CVR 提升，超过所有其他单一页面。

### 首屏元素绝对优先级（移动端）
按从上到下顺序：
1. **主图/视频**（占屏 60-70%）：第一帧就要展示产品最强卖点
2. **产品名 + 价格 + 评分**（一行）
3. **变体选择**（颜色/尺码 chip）
4. **ATC 按钮**（大、亮、对比色）

把以下挪到第 2-3 屏：详细描述、Reviews 详情、Bundle 选项、FAQ、Cross-sell。

**为什么这个顺序？** 移动用户决策路径 = 看图 → 看价 → 点 ATC。Foursixty 实测过早展示评分密度和详细描述反而**拉低决策速度**——信息过载是 PDP 第一杀手。

### PDP 视频怎么做
- **位置**：替换主图，自动播放（静音，循环）
- **长度**：15 秒以内
- **内容结构**：第 1-3 秒展示产品使用场景，4-10 秒展示卖点（材质特写/功能演示），11-15 秒展示效果或多人使用
- **效果**：CVR +10-30%、停留 +80%、退货 -12-18%（因为用户更清楚自己买的是什么）

### Sticky ATC（移动端必装）
**是什么**：用户向下滚动 PDP 时，底部固定显示一个"加入购物车"按钮，始终在视线内。

**为什么必装**：移动端 60-80% 用户会滚动越过原 ATC 按钮看详细信息。如果没有 sticky，他们想买时还要滚回去——这中间流失大量订单。

**实测效果**：ATC 点击 +10%、订单 CVR +9%。移动端 +14.2%，桌面端 +6.1%。

**怎么装**：Shopify 主题大多自带（Dawn / Sense / Studio 等 2.0 主题），或装 app 如 "EasyTabs" / "Hexa Sticky ATC"。

### Bundle 阶梯（提 AOV 的最简单方法）
**位置**：ATC 按钮上方，做成 3 个 chip。

**具体定价（产品单价 $29 为例）**：
- 单件 $29
- Buy 2 save 10% → $52.20（save $5.80）
- Buy 3 save 15% → $73.95（save $13.05）

**阈值原则**：第一阶梯定在**当前 AOV 之上 10-20%**。如果你 AOV 是 $35，第一阶梯做 $42-50 最佳。

**效果**：AOV +20-35%，对消耗品类（护肤、保健、宠物粮、清洁用品）效果最强。

---

## 2. 移动端专项（70% 流量在此）

### Core Web Vitals 是什么
Google 用三个指标衡量页面体验，直接影响 SEO 排名和 CVR：

- **LCP (Largest Contentful Paint)**：最大内容元素加载完成时间。目标 **< 2.5 秒**。这通常是 PDP 主图——主图慢一秒，53% 用户跳出。
- **INP (Interaction to Next Paint)**：用户首次交互的响应时间（取代了 FID）。目标 **< 200ms**。
- **CLS (Cumulative Layout Shift)**：页面加载时元素的视觉位移。目标 **< 0.1**。元素跳来跳去会让用户误点错的按钮。

### 移动速度 = 钱
Google + SOASTA 数据：
- 移动端速度 **+1 秒 → CVR +27%**
- 移动端 LCP 每改进 **0.1 秒 → 零售 CVR +8.4%**
- 53% 用户在 3 秒内不加载完就跳出

### 怎么提速（按 ROI 顺序）
1. **季度审计 Shopify Apps**：每装一个 app 注入 JS，5-6 个未用 app 就能拖 2 秒。打开 Shopify Admin → Apps → 删半年没用的
2. **图片懒加载 + WebP**：所有 PDP 图转 WebP 格式（体积 -30%），首屏外的图懒加载
3. **删未用的字体**：常见错误是同时装 3-4 个 Google Fonts，每个 50-100KB
4. **第三方脚本审计**：Google Analytics、Facebook Pixel、TikTok Pixel 这些必须保留；其他 chat widget、wishlist app、quiz app 看 ROI 决定
5. **用 Lighthouse 跑分**：Chrome DevTools 自带，目标 Mobile 分数 > 70

### 表单字段砍到 6-8 个
Baymard 调研：电商 checkout 平均 11.8 个字段，最优 6-8 个。可以砍掉的：
- 第二地址行（合并到第一行）
- 公司名（B2C 不需要）
- 称谓（Mr/Ms 完全多余）
- 电话号码确认
- 出生日期（除非品类需要）

**保留必要的**：Email、姓、名、地址、城市、邮编、国家、电话（订单沟通）。

### Tap-to-Text SMS 收集
**普通方式**：用户手输手机号 → 移动键盘弹出数字键盘 → 易输错
**Tap-to-Text**：Klaviyo Smart Opt-in 自动一键 → 用户只需点"Send"，手机自动打开短信预填"YES"发到 Klaviyo 短码

**效果**：完成率从手输的 5-8% 提升到 15-25%。

---

## 3. Checkout / Cart（漏斗最底层）

### Shop Pay 是什么 / 为什么必开
**Shop Pay = Shopify 跨店统一钱包**。用户在任何一家 Shopify 店买过一次后，钱包就保存了：地址、信用卡、邮箱、电话。下次任何 Shopify 店看到 "Shop Pay" 按钮 → 一键支付，不用再输信息。

**官方数据**：相对普通 checkout 提升 1.72×，移动端 1.91×，回头客 +18%，全渠道平均 +9% CVR。

**怎么开**：Shopify Admin → Settings → Payments → Shop Pay → Enable。**默认是开的**，但很多卖家在加自定义 checkout 时不小心关掉了。检查一下。

### 加速支付按钮顺序
购物车页面顶部三件套：**Apple Pay + Google Pay + Shop Pay**。

为什么放顶部？因为 70% iOS 用户、80% Android 用户钱包里已经有付款方式，不用再手输。一按指纹/Face ID 就完成支付。放底部 → 用户已经开始填表单 → 加速支付的意义没了。

### Baymard 关键 5 条 checkout 优化（解锁 35% CVR 上限）

**1. Guest checkout 最显眼**
强制用户注册才能 checkout → 24% 用户直接放弃。Guest checkout 按钮要**比"创建账户"更大、更亮**。注册账户的诱因放在订单完成后（"创建账户保存订单信息"）。

**2. 表单字段 ≤ 8 个**
见上文。

**3. 解释为何要敏感信息**
用户讨厌被问电话号码和详细地址。在字段旁加一行 8pt 灰字：「我们用电话做发货通知」「邮编用来计算运费」。一句话能挽回 5-10% 完成率。

**4. 第三方支付**
减少手输信用卡的步骤。除了 Apple/Google/Shop Pay，加 PayPal、Klarna（分期）、Afterpay。

**5. 字段自动填充**
所有 input 加 `autocomplete` 属性（如 `autocomplete="email"` `autocomplete="postal-code"`），手机会自动调出已存信息。

---

## 4. 落地页（LP）

### 为什么付费流量不能直接打首页/PDP
首页是"探索式"，PDP 是"决策式"，但付费流量来的用户**心智状态在中间**——他们刚被 Hook 钩进来，需要一个**专门的销售页**完成"再 Hook → 信任建立 → 决策"链路。

直接打首页 → 用户不知道点哪、决策路径太长 → 跳出。直接打 PDP → 信任建立不够 → 加车率低。

### LP 工具选型

| 工具 | 适合 | Lighthouse 移动分 | 价格 |
|---|---|---|---|
| **Replo** | 付费流量页（速度第一） | 79 | $99-249/月 |
| **Shogun** | 内容驱动 LP / CMS 库 | 60 | $39-499/月 |
| **Zipify** | 直效漏斗（Ezra Firestone 模板） | 65 | $67-199/月 |
| **PageFly** | 便宜，但速度差 | 52 | $19-99/月 |

**关键差距**：Replo Lighthouse 79 vs PageFly 52，这 27 分的差距让 Meta 流量 CVR 损失 12-18%——因为速度直接影响 LCP，LCP 影响 CVR。

### Hero 区只放 1 个 CTA
**问题**：30%+ 站点的 Hero 区有 3-4 个 CTA 按钮（"Shop Now" + "Learn More" + "View Collection" + "Subscribe"）。

**结果**：用户陷入选择悖论，所有按钮 CTR 都低。

**正解**：Hero 区只放一个 CTA。其他 CTA 移到下方各 section（比如下方 review section 用"Read Reviews"）。

---

## 5. 邮件 / SMS（Klaviyo Flows）

### Welcome Flow（拉新最关键流程）

**Klaviyo 2025 标杆**：placed-order rate 1.97%（在所有 flow 类型里第二高，仅次于 cart abandonment）。

**3 封邮件标准结构**：

**邮件 1（即时，订阅后 0 分钟）**：欢迎 + 折扣码 + 品牌故事
- 主题：「Welcome to [Brand] — here's your 10% off」
- 内容：欢迎语 + 折扣码 + 一句创始人故事（不超过 50 字）+ Best Seller 3 件
- CTA：「Shop with 10% off」

**邮件 2（24 小时后）**：社会证明
- 主题：「See why 50,000+ customers love [Product]」
- 内容：3-4 条 review 截图 + UGC 视频（如有）+ 媒体报道（如有）
- CTA：「Read more reviews」

**邮件 3（72 小时后）**：Best Seller + Urgency
- 主题：「Our #1 best seller is selling fast」
- 内容：突出 1 个 Best Seller 产品的所有理由
- CTA：「Get yours before [紧迫期限]」
- 提醒折扣码即将过期

### Cart Abandonment Flow（CVR 最高的 flow）

**Klaviyo 2025 标杆**：RPR $3.65、CVR 3.33%、open 50.5%、CTR 6.25%。Top 10% 账户 open rate 65%+。

**3 封邮件节奏**：

**邮件 1（1 小时后）**：温和提醒
- 主题：「You left something behind」
- 内容：购物车产品图 + 价格 + 一键回到 checkout 按钮
- 不要给折扣（太早给折扣会训练用户故意弃车）

**邮件 2（24 小时后）**：社会证明 + FAQ
- 主题：「Here's what others say about [产品名]」
- 内容：3 条 review + 1 个常见问题 FAQ（运费/退货政策）
- CTA：「Complete your order」

**邮件 3（72 小时后）**：折扣 + 紧迫感
- 主题：「Last chance — 10% off your cart」
- 内容：10-15% 折扣码 + 24 小时倒计时 + 库存信息（如适用）
- CTA：「Use code SAVE10 now」

### 2-Step Opt-in（提 2-3× 注册率）
**普通弹窗**：一次问 email + phone → 完成率 8-12%

**2-step opt-in**：
- **Step 1**：「Get 10% off + free shipping」收 email → 完成率 25-35%
- **Step 2（用户提交 email 后）**：「Want exclusive VIP drops? Add your phone」收 SMS → 在已注册 email 用户里 40-50% 会留 phone

总结：把"一次要太多"拆成"两次要适量"，整体多收 2-3× 的联系方式。

---

## 6. 价格与 Offer 策略

### 动态免运进度条
**是什么**：购物车顶部显示「再加 $15 免运费」的进度条，加车时实时变化。

**对比效果**（Baymard 测试）：
- 静态横幅「满 $50 免运费」：AOV +2-3%
- 动态进度条 + 数字实时变化：AOV +7-15%
- 加上"还差 X 件可解锁 X 礼品"：AOV +3-5×

**阈值计算**：
- 当前 AOV $35 → 免运阈值 $45-50（之上 20-30% 最优）
- 太低（$40）→ 大部分订单自然过线，没意义
- 太高（$65）→ 太遥远用户放弃凑单

### 阶梯包定价

**3 阶梯标准（产品 $29）**：
- 1 件：$29（基准）
- 2 件：10% off → $52.20
- 3 件：15% off → $73.95

**关键原则**：第一阶梯定在当前 AOV 之上 **10-20%**。让"刚好够格升级"的用户最多。

### 倒计时的红线
**真稀缺**才用倒计时，例：
- 「订单 22:00 前下单，今天发货」（每天循环，是真的）
- 「最后 23 件库存」（真实库存）
- 「黑五优惠 48 小时」（真实活动）

**假倒计时**绝对不要用：
- 每个用户访问都重置的倒计时
- 永远不会过期的"限时优惠"

Baymard 把这些标为 dark pattern，**对短期 CVR 提升明显，但 LTV 严重受损**——用户买了一次后发现是骗局就不会回购。Meta 也开始惩罚使用 dark pattern 的账户。

---

## 7. A/B 测试体系

### 工具选型按流量

| 月流量 | 推荐工具 | 价格 | 为什么 |
|---|---|---|---|
| < 10k sessions | **GrowthBook**（免费贝叶斯）/ Shopify 原生 | 免费 | 流量小，需要更敏感的统计方法 |
| 10k-50k | **Convert** / Neat | $99-299/月 | 平衡功能与价格 |
| 50k+ | **VWO** | $309+/月 | 企业级，统计强 |

### 贝叶斯 vs 频率主义（为什么重要）
- **频率主义**（传统 A/B）：需要预设样本量，达到 95% 显著才能停。流量小的店要等 6-8 周才能出结果。
- **贝叶斯**：实时更新概率，"B 比 A 好的概率是 X%"，可以早停。流量小的店快 30%。

GrowthBook 是开源贝叶斯工具的代表，免费。VWO 现在也支持贝叶斯。**流量 < 10k/月的店强烈建议用贝叶斯**——否则你永远拿不到统计显著结果。

### 测试停止条件（必须三个都满足）
1. ✅ 达到预设样本量（MDE 5% 的话约 5000-10000 转化/组）
2. ✅ 95% 统计显著（贝叶斯则是 95%+ 概率）
3. ✅ 至少跑满 14 天（覆盖一个完整业务周期，工作日 vs 周末，月初 vs 月末）

**任何一个不满足都不要停**。早停是 A/B 测试最大的坑——你以为赢了，实际上是噪音。

### 测试优先级（影响 × 流量 = ROI）

按 ROI 顺序：
1. **Checkout**（流量纯度最高 + 影响最大）
   - 测试：guest checkout 位置、字段顺序、加速支付按钮位置
2. **PDP ATC 区**（流量第二大 + 影响第二大）
   - 测试：ATC 按钮颜色/大小、Bundle 阶梯定价、sticky ATC 出现时机
3. **LP Hero 区**（影响大但流量需要付费拉）
   - 测试：Hook 文案、Hero 图/视频、CTA 文案
4. **邮件 Subject Line**（流量小但快迭代）
   - 测试：emoji vs 无 emoji、长 vs 短、人称视角

---

# 第三部分 · 30 天落地路线图（每周一个里程碑）

## 第 1 周：速胜（Quick Wins）—— 0 学习成本，预期 CVR +1-2pp
- [ ] Shopify Admin 确认 Shop Pay 已开
- [ ] 购物车页加 Apple Pay + Google Pay + Shop Pay 三件套，放最顶部
- [ ] PDP 装 sticky ATC（移动端必须）
- [ ] PDP 主图换成 15 秒产品视频
- [ ] Checkout 表单砍到 8 字段以内
- [ ] 用 Lighthouse 跑 Mobile 分数，记录基线

## 第 2 周：创意系统（Creative Engine）
- [ ] 装 Foreplay Chrome 插件，本周收集 50 条爆款 swipe
- [ ] 列出 10 条 Hook 候选（参考 Pattern Interrupt 公式）
- [ ] 注册 Arcads 或 Creatify，量产 10 条 UGC 视频
- [ ] Meta 跑 3-4 条 Hook 变体测试（$30/天/变体）
- [ ] 关闭所有 Hook Rate < 25% 的素材

## 第 3 周：邮件 / SMS 系统（Klaviyo Flows）
- [ ] 设置 Welcome flow 3 封（即时 / 24h / 72h）
- [ ] 设置 Cart Abandonment 3 封（1h / 24h / 72h）
- [ ] 替换主站弹窗为 2-step opt-in（email → SMS）
- [ ] 对标基准：Welcome placed-order ≥ 1.5%，Cart Abandon CVR ≥ 3%

## 第 4 周：价格策略 + 测量体系
- [ ] 购物车顶部加动态免运进度条（阈值 = AOV × 1.25）
- [ ] PDP ATC 上方加 Bundle 阶梯（3 件 15% off）
- [ ] 接入 Triple Whale，做素材级 ROAS 归因
- [ ] 装 GrowthBook，跑第一个 A/B（Checkout 按钮顺序）
- [ ] 月底跑全栈复盘：Hook Rate / CTR / CVR / AOV / ROAS 五维对比第 1 周基线

---

# 第四部分 · KPI 生死线速查

| 指标 | 及格 | 顶级 | 红线行动 |
|---|---|---|---|
| Meta Hook Rate | 30% | 40%+ | < 25% 立即关停 |
| TikTok 3s VTR | 30% | 40%+ | < 30% 换 Hook |
| Meta Link CTR | 1.0% | 1.8%+ | 7 天跌 10% 换素材 |
| TikTok In-Feed CTR | 0.7% | 1.5%+ | 同上 |
| 站点级 CVR（DTC 中位） | 1.5% | 3%+ | < 1% 全栈诊断 |
| Mobile LCP | < 2.5s | < 1.8s | > 3s 砍 app + 改图 |
| Lighthouse Mobile | 70 | 90+ | < 50 换 LP 工具 |
| Checkout 完成率 | 55% | 70%+ | < 50% 查 Baymard 5 条 |
| Welcome flow placed-order | 1.5% | 2.5%+ | < 1% 重写邮件 1 |
| Cart Abandon CVR | 3.0% | 5%+ | < 2% 加 24h 折扣 |
| AOV | 当前 + 0% | 当前 + 20% | 上 Bundle + 免运进度条 |

来源：[Triple Whale](https://www.triplewhale.com/blog/tiktok-benchmarks) · [Hawky AI](https://hawky.ai/blog/hook-rate) · [Klaviyo](https://www.klaviyo.com/blog/abandoned-cart-benchmarks) · [Baymard](https://baymard.com/blog/current-state-of-checkout-ux) · [Think with Google](https://www.thinkwithgoogle.com/_qs/documents/4290/c676a_Google_MobileSiteSpeed_Playbook_v2.1_digital_4JWkGQT.pdf)
