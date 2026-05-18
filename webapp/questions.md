# 待用户确认的问题

## 已自行决策（按 brief「关键设计决策」覆盖）

| 决策 | 选择 | 备注 |
|---|---|---|
| Next.js 版本 | **v16.2.6**（latest），不是 v15 | v16 在 App Router / SSG 上向后兼容，区别主要在 `params: Promise<...>` 异步签名；这一点我已遵守。 |
| Tailwind CSS | **v4**（create-next-app 默认） | 旧版用 tailwind.config.js；v4 用 CSS `@theme` 配置，全局色板写在 `globals.css`。 |
| shadcn/ui | **手写复制**（Tabs/Tooltip/Popover/Dialog） | brief 写"手动 init"。没跑 `shadcn init` CLI（会改 components.json 等）；直接基于 Radix 写组件文件，遵循 shadcn 风格。 |
| 状态管理 | **React 内置** | useState/useReducer，无 Zustand/Redux。 |
| 多语言 | **v1 中文** | 专业术语保留英文（GPSR、FBA 等）。 |
| 数据库 / ORM | **无** | 全 JSON import + Zod 校验。 |
| API Routes | **无** | 纯静态。`country/[iso]` 用 `dynamicParams=false`。 |
| 32 国 ISO 边界数据 | **world-atlas 110m**，离线 cache 到 `public/world-110m.json` | numeric→alpha3 映射写死在 `src/lib/iso-codes.ts`（32 个）。其他 145 国保留灰色默认底色但不进入 hover/click。 |
| 国家详情 SSG 范围 | **全 32 国**预渲染 | 没有数据的 31 国进入"数据待补"占位页（参考 brief 验收 checklist）。 |
| 政策时间轴 | **横向自定义 SVG/div 时间轴**（不是 ScatterChart） | 视觉效果更接近 wireframe；事件密度低（目前 2 条）时 ScatterChart 不够紧凑。 |
| 对比页选 4 国 | 加 URL 参数 `?selected=POL,DEU` 同步 | 方便从国家详情页跳进来。 |

## 真正需要你确认的点

1. **lucide-react v1.16 包很小**（按需 tree-shake）。如果你之前的项目用了不同 icon 库（如 react-icons / heroicons），告诉我我可以切。
2. **第一次启动需要你设置** `.env.local`：
   ```
   NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxxxxxxxxxxx
   ```
   没 token 时首页地图会显示"缺少 token"提示页（其它 4 个页都正常）。
3. 添加新国家的流程见 `docs/data-update-flow.md`：每加一国需要在 `src/lib/data.ts` 注册 1 行 `import`。如果你想要更自动化（比如 fs glob），让我知道——但静态 import 是 Next.js 静态分析的 happy path，能让 Zod 校验在构建时跑、运行时无 IO。
4. **是否要 ISR / "after deploy" hook 自动校验？** 现在 `pnpm build` 前会先 `pnpm validate`，本地和 Vercel 都生效。
5. **PDF 导出** wireframe 里 country header 有"导出 PDF"按钮，目前没实现（v1 不在 brief 任务清单里）。需要的话告诉我。
6. **TopSku tab？** brief 提到 8 个 tab 不含 TopSku（数据未交付）。我把 SKU 相关合并放进"品类"tab 备用（poland.json 当前的 top_skus 字段是 `_status: pending_sellersprite_apify`，所以暂未展示数据）。
