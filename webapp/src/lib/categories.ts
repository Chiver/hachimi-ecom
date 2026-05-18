/** 12 大类映射（中文）。Single source of truth for category labels. */
export const CATEGORY_LABEL: Record<string, string> = {
  apparel: "服装鞋帽",
  beauty: "美妆个护",
  home: "家居家具",
  electronics: "3C 电子",
  baby: "母婴用品",
  pet: "宠物用品",
  outdoor: "户外运动",
  auto: "汽配",
  health: "健康保健",
  toys: "玩具",
  kitchen: "厨房用品",
  garden: "园艺工具",
};

export const CATEGORY_CODES = Object.keys(CATEGORY_LABEL) as Array<
  keyof typeof CATEGORY_LABEL
>;

export function categoryLabel(code: string): string {
  return CATEGORY_LABEL[code] ?? code;
}
