# 数据更新流程

## 协作模型

```
Cowork（研究 Claude）            Claude Code / 工程
   ↓ 输出 country JSON              ↓ 实现 webapp
data/countries/germany.json  →  webapp/src/data/countries/germany.json
                                  ↓ git push
                                Vercel auto deploy
```

## 步骤详解

### 1. Cowork 产出符合 schema 的 JSON

参考 `data/countries/poland.json`。Schema 由 `webapp-spec/types.ts`（同 `webapp/src/types/index.ts`）的 Zod 定义。

### 2. 复制到 webapp 数据目录

```bash
cp ~/Desktop/hachimi-ecom/data/countries/germany.json \
   ~/Desktop/hachimi-ecom/webapp/src/data/countries/
```

### 3. 在 `src/lib/data.ts` 注册新国家

打开 `webapp/src/lib/data.ts`，在 `COUNTRY_FILES` 映射里加入一行：

```ts
import germanyRaw from "@/data/countries/germany.json";

const COUNTRY_FILES: Record<string, unknown> = {
  POL: polandRaw,
  DEU: germanyRaw, // ← 新增
};
```

> **为什么手动注册？** 因为 Next.js 静态导入必须在 build 时已知。我们用此方式让 Zod 在加载时校验每个国家的 JSON；新增国家是 1 行改动，5 秒搞定。

### 4. 本地校验 + 预览

```bash
pnpm validate    # 必须先过 Zod 校验
pnpm dev         # http://localhost:3000 — 地图上德国应变绿色可点击
```

### 5. 提交并发布

```bash
git add src/data/countries/germany.json src/lib/data.ts
git commit -m "data: add Germany country dossier"
git push
# → Vercel 自动 build + redeploy
```

## 修改既有国家数据

直接覆盖 `src/data/countries/{iso}.json`，无需改代码：

```bash
cp ~/Desktop/hachimi-ecom/data/countries/poland.json \
   ~/Desktop/hachimi-ecom/webapp/src/data/countries/
pnpm validate && pnpm dev
```

## 添加新词条

编辑 `webapp/src/data/glossary.json`，加入新 GlossaryEntry 对象（结构见 `src/types/index.ts` 的 `GlossaryEntrySchema`）。webapp 文案中匹配该 term 的位置自动启用悬浮解释。

## Schema 变更

Schema v1 已 frozen。新增字段是非破坏性的（JSON 不带新字段也通过校验）。任何破坏性变更需走 `webapp-spec/schema-changelog.md` 流程。
