// 背景颜色 - 20种多彩随机（包含冷暖各种调性）
export const backgroundColors = [
  // 暖调
  '#F5E6D3', // 暖杏
  '#E8D4C4', // 驼色
  '#F0E5D8', // 米黄
  '#E5DDD0', // 沙色
  '#D4C4B0', // 麦色
  // 冷调
  '#E0E5E5', // 灰青
  '#D8E0E3', // 雾蓝
  '#E3E0D8', // 灰绿
  '#D9E2DC', // 薄荷灰
  // 粉调
  '#F0E0E0', // 藕粉
  '#E8D8D8', // 豆沙
  '#F5E8E0', // 桃粉
  // 绿调
  '#E0E5D8', // 竹青
  '#D8E0D0', // 苔绿
  '#E5EBE0', // 嫩绿
  // 蓝调
  '#E0E8F0', // 天青
  '#D8E0E8', // 薰衣草
  '#E5E8F0', // 淡蓝
  // 黄调
  '#F5F0E0', // 鹅黄
  '#F0EBD8', // 象牙
]

// 禅字颜色 - 10种多彩墨色（1%金色，其余9种各11%，无白色，颜色更鲜明）
export const zenColors = [
  // 金色（1%概率）
  '#D4A84B', // 亮金色
  // 墨黑（11%）
  '#1A1A1A',
  // 深蓝（11%）
  '#1E3A5F',
  // 墨绿（11%）
  '#2D4A3E',
  // 赭红（11%）
  '#8B3A3A',
  // 黛紫（11%）
  '#4A3A6B',
  // 靛青（11%）
  '#2E4A62',
  // 棕红（11%）
  '#6B3A2A',
  // 墨蓝（11%）
  '#2A3A5A',
  // 深咖（11%）
  '#4A3A2A',
]

// 获取禅字随机颜色（1%金色，其余均分，无白色）
export function getRandomZenColor(): string {
  const r = Math.random()
  if (r < 0.01) {
    return zenColors[0] // 金色 1%
  }
  // 其余9种颜色各11%
  const idx = 1 + Math.floor((r - 0.01) / 0.11)
  return zenColors[Math.min(9, Math.max(1, idx))]
}

// 签名颜色 - 24种多彩深色系
export const signatureColors = [
  // 深咖系
  '#3D3028', '#4A3C30', '#5A4838', '#6B5440',
  // 深灰系
  '#2A2A2A', '#3A3A3A', '#4A4A48', '#5A5A58',
  // 墨青系
  '#2F3530', '#3A4038', '#454A42', '#505550',
  // 深棕系
  '#4A3628', '#5A4230', '#6A4E38', '#7A5A40',
  // 暗红系
  '#4A2828', '#5A3030', '#6A3838', '#7A4040',
  // 暗紫系
  '#3A2838', '#4A3048', '#5A3858', '#6A4068',
]

// 人格颜色权重（50%黑 / 45%白 / 5%金）
export type PersonalityColor = 'black' | 'white' | 'gold'

export const personalityBlack = '#1A1A1A'
export const personalityWhite = '#F8F5F0'
export const personalityGold = '#C4A574'

// 金色边框色
export const goldBorderColor = 'rgba(196, 165, 116, 0.7)'

// 点缀红色
export const berryRedColor = '#B86858'

// 咖啡果实颜色
export const coffeeCherryColor = '#C44B4B'
export const coffeeLeafColor = '#5A7A5A'
export const coffeeBeanColor = '#6B4E3D'

// 装饰金色
export const accentGoldColor = 'rgba(196, 165, 116, 0.5)'

// 获取随机人格颜色
export function getRandomPersonalityColor(): { color: PersonalityColor; goldEdge: boolean } {
  const r = Math.random()
  if (r < 0.5) {
    return { color: 'black', goldEdge: false }
  } else if (r < 0.95) {
    return { color: 'white', goldEdge: false }
  } else {
    return { color: 'gold', goldEdge: true }
  }
}

// 获取人格颜色值
export function getPersonalityColorValue(color: PersonalityColor): string {
  switch (color) {
    case 'black': return personalityBlack
    case 'white': return personalityWhite
    case 'gold': return personalityGold
    default: return personalityBlack
  }
}

// 书法字体列表（10种考究手写体 - 精选优质字体）
export const calligraphyFonts = [
  '"Ma Shan Zheng", cursive',
  '"Long Cang", cursive',
  '"Liu Jian Mao Cao", cursive',
  '"ZCOOL XiaoWei", serif',
  '"ZCOOL QingKe HuangYou", serif',
  '"Noto Serif SC", serif',
  '"ZCOOL KuaiLe", cursive',
  '"Ma Shan Zheng", cursive',
  '"Long Cang", cursive',
  '"ZCOOL XiaoWei", serif',
]

// 毛笔字体（专门用于禅字 - 更有力量感）
export const brushFonts = [
  '"Ma Shan Zheng", cursive',
  '"Long Cang", cursive',
  '"Liu Jian Mao Cao", cursive',
  '"Ma Shan Zheng", cursive',
  '"Long Cang", cursive',
  '"Liu Jian Mao Cao", cursive',
  '"Ma Shan Zheng", cursive',
  '"Long Cang", cursive',
  '"Ma Shan Zheng", cursive',
  '"Long Cang", cursive',
]

// 获取随机毛笔字体（用于禅字）
export function getRandomBrushFont(): string {
  return brushFonts[Math.floor(Math.random() * brushFonts.length)]
}

// 随机获取书法字体
export function getRandomCalligraphyFont(): string {
  return calligraphyFonts[Math.floor(Math.random() * calligraphyFonts.length)]
}

// 获取随机签名颜色
export function getRandomSignatureColor(): string {
  return signatureColors[Math.floor(Math.random() * signatureColors.length)]
}

// 获取随机背景色
export function getRandomBackgroundColor(): string {
  return backgroundColors[Math.floor(Math.random() * backgroundColors.length)]
}
