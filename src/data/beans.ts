// 豆子类型（筛豆游戏用）
export type BeanType = 'good' | 'green' | 'broken' | 'worm'

// 处理法类型
export type ProcessMethod = 
  | 'washed' 
  | 'natural' 
  | 'honey' 
  | 'red-honey'
  | 'black-honey'
  | 'white-honey'
  | 'anaerobic-lactic'
  | 'anaerobic-washed'
  | 'anaerobic-natural'
  | 'anaerobic-48h'
  | 'wet-hulled'
  | 'yeast-washed'
  | 'enzyme-washed'
  | 'jasmine-process'
  | 'passion-fruit-washed'
  | 'lychee-honey'
  | 'blend'
  | 'special'

// 完整豆单（25种，来自用户提供的豆单）
export interface CoffeeBean {
  id: string
  name: string
  origin: string
  farm: string
  process: ProcessMethod
  processName: string
  roast: 'light' | 'medium'
  flavors: string[]
}

export const coffeeBeans: CoffeeBean[] = [
  // 1-5
  {
    id: 'honey-citrus',
    name: '蜂蜜柑橘',
    origin: '埃塞俄比亚',
    farm: '克希尔',
    process: 'washed',
    processName: '水洗',
    roast: 'light',
    flavors: ['柑橘', '焦糖', '柠檬皮', '蜂蜜']
  },
  {
    id: 'geisha-grama',
    name: '格兰瑰夏',
    origin: '埃塞俄比亚',
    farm: '格拉娜',
    process: 'washed',
    processName: '水洗',
    roast: 'light',
    flavors: ['华丽香气', '草莓', '苹果', '柠檬', '复合香气']
  },
  {
    id: 'red-honey-adors',
    name: '红蜜阿朵',
    origin: '埃塞俄比亚',
    farm: '阿多斯',
    process: 'red-honey',
    processName: '红蜜',
    roast: 'light',
    flavors: ['菠萝', '柚子', '桂圆', '芒果', '黄桃', '樱桃', '黄糖']
  },
  {
    id: 'autumn-berry',
    name: '秋野浆果颂',
    origin: '萨尔瓦多',
    farm: '帕卡斯',
    process: 'natural',
    processName: '日晒',
    roast: 'light',
    flavors: ['草莓', '甜橙', '杏子', '柚子', '莓果']
  },
  {
    id: 'obsidian',
    name: '黑曜石',
    origin: '哥斯达黎加',
    farm: '拉斯拉哈斯',
    process: 'black-honey',
    processName: '拉斯拉哈斯黑蜜',
    roast: 'light',
    flavors: ['葡萄柚', '酒香', '果酱', '蓝莓', '坚果']
  },
  // 6-10
  {
    id: 'red-berry',
    name: '小红莓',
    origin: '哥伦比亚',
    farm: '棕榈树庄园',
    process: 'anaerobic-lactic',
    processName: '厌氧控制乳酸菌发酵',
    roast: 'light',
    flavors: ['小红莓', '黑醋栗', '莓果', '奶糖', '果汁饱满', '扎实口感']
  },
  {
    id: 'charlotte',
    name: '夏洛特',
    origin: '印度尼西亚',
    farm: '印尼铁皮卡',
    process: 'wet-hulled',
    processName: '湿刨法',
    roast: 'light',
    flavors: ['柑橘', '香料', '牛奶']
  },
  {
    id: 'cherry-vision',
    name: '远景有落樱',
    origin: '哥伦比亚',
    farm: '远景庄园',
    process: 'yeast-washed',
    processName: '水果酵母厌氧发酵水洗',
    roast: 'light',
    flavors: ['覆盆子糖浆', '复合莓果', '榛子巧克力', '香料余韵', '洛神花茶']
  },
  {
    id: 'passion-palm',
    name: '棕榈树与百香果',
    origin: '哥伦比亚',
    farm: '棕榈树庄园',
    process: 'passion-fruit-washed',
    processName: '百香果浸渍水洗',
    roast: 'light',
    flavors: ['百香果', '桃子', '柠檬干', '西柚', '绿茶', '柑橘酸质']
  },
  {
    id: 'grape-fairy',
    name: '葡萄仙子',
    origin: '哥伦比亚',
    farm: '弗洛缇娜庄园',
    process: 'anaerobic-washed',
    processName: '水果厌氧水洗',
    roast: 'light',
    flavors: ['葡萄干', '枣干', '黑巧', '莓果果酱', '乌龙茶', '豆蔻', '杏仁余韵']
  },
  // 11-15
  {
    id: 'lychee-changan',
    name: '长安荔枝',
    origin: '哥伦比亚',
    farm: '秘密庄园',
    process: 'lychee-honey',
    processName: '荔枝发酵蜜处理',
    roast: 'light',
    flavors: ['荔枝汽水', '柑橘', '黄糖甜感', '荔枝果茶']
  },
  {
    id: 'twilight-orange',
    name: '暮光之橙',
    origin: '哥伦比亚',
    farm: '希望庄园',
    process: 'washed',
    processName: '水洗',
    roast: 'light',
    flavors: ['荔枝', '甘蔗', '水蜜桃', '杨桃', '奶油', '甜橙']
  },
  {
    id: 'venus-geisha',
    name: '维纳斯瑰夏',
    origin: '巴拿马',
    farm: '维纳斯庄园',
    process: 'natural',
    processName: '日晒',
    roast: 'light',
    flavors: ['杨桃', '水蜜桃', '蜂蜜', '热带水果', '茉莉花', '百香果']
  },
  {
    id: 'flower-geisha',
    name: '鲜花瑰夏',
    origin: '哥伦比亚',
    farm: '鲜花庄园',
    process: 'washed',
    processName: '水洗',
    roast: 'light',
    flavors: ['花香', '树莓', '橙子', '柠檬', '杏桃', '红茶']
  },
  {
    id: 'divine-garden',
    name: '蒂薇莎花园',
    origin: '哥斯达黎加',
    farm: '蒂薇莎庄园',
    process: 'white-honey',
    processName: '白蜜',
    roast: 'light',
    flavors: ['冰镇柠檬汁', '红茶', '杨桃', '高甜感']
  },
  // 16-20
  {
    id: 'alo',
    name: 'Alo',
    origin: '埃塞俄比亚',
    farm: '班莎Hatesa',
    process: 'natural',
    processName: '经典日晒',
    roast: 'light',
    flavors: ['荔枝', '芒格', '龙眼', '波罗蜜']
  },
  {
    id: 'gonjobe-princess',
    name: 'Gonjobe公主',
    origin: '埃塞俄比亚',
    farm: '阿科露批次',
    process: 'anaerobic-natural',
    processName: '厌氧日晒',
    roast: 'light',
    flavors: ['复合浆果', '桃子', '高甜度', '暖香料', '红茶', '柑橘']
  },
  {
    id: 'winter-tea',
    name: '冬日么么茶',
    origin: '埃塞俄比亚',
    farm: '阿拉玛处理站',
    process: 'enzyme-washed',
    processName: '酵素水洗',
    roast: 'light',
    flavors: ['薄荷', '花香', '绿茶', '西瓜糖', '蜂蜜']
  },
  {
    id: 'spring-jasmine',
    name: '春日茉莉',
    origin: '埃塞俄比亚',
    farm: '赫拉庄园',
    process: 'jasmine-process',
    processName: '新鲜茉莉花窨制',
    roast: 'light',
    flavors: ['茉莉花香', '柑橘', '蜂蜜', '茶感']
  },
  {
    id: 'blossom',
    name: '花漾',
    origin: '埃塞俄比亚',
    farm: '戈帝贝',
    process: 'anaerobic-48h',
    processName: '48小时厌氧日晒',
    roast: 'light',
    flavors: ['玫瑰', '荔枝', '芒果', '红心芭乐', '百香果', '樱桃果']
  },
  // 21-25（包含2个拼配 + 2个稀有 + 1个完美）
  {
    id: 'shui-mo-sky',
    name: '水墨天字一号',
    origin: '水墨',
    farm: '水墨特制',
    process: 'blend',
    processName: '拼配',
    roast: 'medium',
    flavors: ['花香', '果味', '酸质明亮']
  },
  {
    id: 'shui-mo-earth',
    name: '水墨地字一号',
    origin: '水墨',
    farm: '水墨特制',
    process: 'blend',
    processName: '拼配',
    roast: 'medium',
    flavors: ['黑巧', '焦糖', '杏仁']
  },
  {
    id: 'jade-geisha',
    name: '翡翠庄园瑰夏',
    origin: '巴拿马',
    farm: '翡翠庄园',
    process: 'natural',
    processName: '日晒',
    roast: 'light',
    flavors: ['茉莉', '水蜜桃', '佛手柑', '柠檬', '樱桃']
  },
  {
    id: 'blue-mountain',
    name: '蓝山一号',
    origin: '牙买加',
    farm: '牙买加斯东尼',
    process: 'washed',
    processName: '水洗',
    roast: 'medium',
    flavors: ['圆润平滑', '茶树花香', '碧根果', '巧克力', '黑莓']
  },
  {
    id: 'colombia-perfect',
    name: '哥伦比亚完美',
    origin: '哥伦比亚',
    farm: '完美庄园',
    process: 'washed',
    processName: '水洗',
    roast: 'light',
    flavors: ['兰花', '果香', '花香', '甜橙']
  },
]

// 处理法中文映射
export const processMethodNames: Record<ProcessMethod | 'perfect', string> = {
  'washed': '水洗',
  'natural': '日晒',
  'honey': '蜜处理',
  'red-honey': '红蜜',
  'black-honey': '黑蜜',
  'white-honey': '白蜜',
  'anaerobic-lactic': '厌氧乳酸菌',
  'anaerobic-washed': '厌氧水洗',
  'anaerobic-natural': '厌氧日晒',
  'anaerobic-48h': '48h厌氧',
  'wet-hulled': '湿刨',
  'yeast-washed': '酵母水洗',
  'enzyme-washed': '酵素水洗',
  'jasmine-process': '茉莉花窨制',
  'passion-fruit-washed': '百香果浸渍',
  'lychee-honey': '荔枝蜜处理',
  'blend': '拼配',
  'special': '特调',
  'perfect': '完美'
}

// 豆评句库（与人格/评测对应，一句话说清这款豆子与你的关系）
const BEAN_COMMENTS: Record<string, string[]> = {
  '静水流深': ['深潭无波，这杯豆子也一样耐品。', '不争不抢，风味自在杯中。', '和你一样，这杯经得起细品。'],
  '春风化雨': ['温润的一杯，像你的手冲一样柔和。', '润物无声，风味慢慢化开。', '温柔冲煮，配这款豆子刚好。'],
  '破茧成蝶': ['蜕变后的你，值得这一杯。', '冲煮时的专注，和这款豆子很搭。', '敢冲敢品，风味自然绽放。'],
  '守拙归朴': ['返璞归真的一杯，简单却扎实。', '不花哨，正好衬你的性子。', '朴素豆子，喝得出本味。'],
  '云卷云舒': ['自在冲煮，风味随缘呈现。', '不执着手法，这杯豆子也从容。', '聚散如云，杯中自有天地。'],
  '细水长流': ['细水长流的手冲，配这款豆子正好。', '慢慢来，风味会一一展开。', '持久温柔，豆子也经得起细品。'],
  '厚积薄发': ['积累的功夫，都在这杯里。', '冲煮时的沉稳，衬得起这款豆。', '不鸣则已，一冲见真章。'],
  '返璞归真': ['剥去繁复，这杯豆子见真淳。', '归朴之选，喝的是本味。', '简单冲煮，豆子自己会说话。'],
  '随遇而安': ['随缘冲煮，风味自然来。', '不强求，这杯豆子刚好衬你。', '遇豆则安，杯中自有欢喜。'],
  '从容不迫': ['从容注水，豆子从容回应。', '不急不躁，风味刚刚好。', '稳扎稳打，配这款豆子刚好。'],
  '温润如玉': ['温润手冲，玉质豆香。', '和你一样，这杯经得起时间。', '柔而不弱，风味清晰可辨。'],
  '虚怀若谷': ['空杯心态，装得下这款豆子的好。', '谦冲品饮，风味愈品愈足。', '虚心注水，豆子报以饱满。'],
  '大智若愚': ['大巧若拙，这杯豆子也是。', '笨拙地认真冲，豆子懂。', '不求机巧，但求心安一杯。'],
  '淡泊明志': ['淡泊冲煮，风味不争自显。', '心静下来，豆子的好才喝得出来。', '清心一品，正是这款豆的脾气。'],
  '宁静致远': ['宁静注水，风味致远。', '和你一样，这杯耐得住细品。', '静中得味，豆子与心境相映。'],
  '行云流水': ['行云流水的注水，配这款豆子刚好。', '一气呵成，风味流畅展开。', '自在冲煮，豆子也自在回应。'],
  '刚柔并济': ['刚柔之间，这杯豆子拿捏得刚好。', '手法有张弛，风味有层次。', '冲煮如人，豆子衬得起。'],
  '宠辱不惊': ['不论分数高低，这杯豆子都衬你。', '冲煮时的淡定，豆子懂。', '宠辱不惊，杯中自有定见。'],
  '去留无意': ['注水去留无意，风味自然来。', '不执着结果，这杯豆子刚好。', '随性冲煮，豆子报以惊喜。'],
  '上善若水': ['上善若水，注水如你，豆子如镜。', '善冲善品，风味与心境相合。', '水善利万物，这杯豆子亦然。']
}

const FALLBACK_BEAN_COMMENTS = [
  '与你此刻心境最相衬的一杯。',
  '稳扎稳打的手冲，配这款豆子刚好。',
  '慢下来品，正是这款豆子的脾气。',
  '这杯豆子，像你的手冲一样有分寸。',
  '冲煮与品饮，都值得这一杯。'
]

function pickBeanComment(personalityType: string): string {
  const list = BEAN_COMMENTS[personalityType] || FALLBACK_BEAN_COMMENTS
  return list[Math.floor(Math.random() * list.length)]
}

// 豆单结果
export interface BeanResult {
  type: 'common' | 'geisha' | 'blueMountain' | 'perfect'
  name: string
  process: ProcessMethod | 'perfect'
  processName: string
  flavors: string[]
  specialText?: string
  /** 与评测对应的一句话豆评 */
  beanComment?: string
}

// 根据人格类型匹配处理法
export function matchProcessMethod(personalityType: string): ProcessMethod {
  const mapping: Record<string, ProcessMethod[]> = {
    '静水流深': ['washed', 'white-honey'],
    '春风化雨': ['natural', 'honey'],
    '破茧成蝶': ['anaerobic-lactic', 'anaerobic-natural', 'anaerobic-48h'],
    '守拙归朴': ['washed', 'blend'],
    '云卷云舒': ['natural', 'red-honey'],
    '细水长流': ['washed', 'white-honey'],
    '厚积薄发': ['yeast-washed', 'anaerobic-washed'],
    '返璞归真': ['washed', 'blend'],
    '随遇而安': ['natural', 'blend'],
    '从容不迫': ['washed', 'white-honey'],
    '温润如玉': ['white-honey', 'washed'],
    '虚怀若谷': ['washed', 'natural'],
    '大智若愚': ['blend', 'washed'],
    '淡泊明志': ['washed', 'natural'],
    '宁静致远': ['washed', 'white-honey'],
    '行云流水': ['natural', 'lychee-honey'],
    '刚柔并济': ['blend', 'honey'],
    '宠辱不惊': ['washed', 'natural'],
    '去留无意': ['natural', 'red-honey'],
    '上善若水': ['washed', 'jasmine-process']
  }
  
  const methods = mapping[personalityType] || ['washed', 'natural', 'honey']
  return methods[Math.floor(Math.random() * methods.length)]
}

// 根据处理法推荐豆子
export function recommendBean(process: ProcessMethod): CoffeeBean {
  // 先找匹配的豆子
  const candidates = coffeeBeans.filter(b => b.process === process)
  
  // 如果没有匹配的（如perfect），随机返回
  if (candidates.length === 0) {
    // 排除稀有豆（翡翠瑰夏、蓝山、哥伦比亚完美）
    const commonBeans = coffeeBeans.filter(b => 
      b.id !== 'jade-geisha' && b.id !== 'blue-mountain' && b.id !== 'colombia-perfect'
    )
    return commonBeans[Math.floor(Math.random() * commonBeans.length)]
  }
  
  return candidates[Math.floor(Math.random() * candidates.length)]
}

// 计算最终豆子结果
export function calculateBeanResult(
  totalScore: number,
  personalityType: string
): BeanResult {
  const addComment = (r: BeanResult): BeanResult => ({
    ...r,
    beanComment: pickBeanComment(personalityType)
  })

  // 95+ 稀有豆逻辑
  if (totalScore >= 95) {
    if (Math.random() < 0.1) {
      const perfectBean = coffeeBeans.find(b => b.id === 'colombia-perfect')!
      return addComment({
        type: 'perfect',
        name: perfectBean.name,
        process: 'perfect',
        processName: '完美',
        flavors: perfectBean.flavors,
        specialText: '这一杯，不需要解释。'
      })
    }
    if (Math.random() < 0.5) {
      if (Math.random() < 0.5) {
        const geisha = coffeeBeans.find(b => b.id === 'jade-geisha')!
        return addComment({
          type: 'geisha',
          name: geisha.name,
          process: geisha.process,
          processName: geisha.processName,
          flavors: geisha.flavors
        })
      } else {
        const blue = coffeeBeans.find(b => b.id === 'blue-mountain')!
        return addComment({
          type: 'blueMountain',
          name: blue.name,
          process: blue.process,
          processName: blue.processName,
          flavors: blue.flavors
        })
      }
    }
  }

  const process = matchProcessMethod(personalityType)
  const bean = recommendBean(process)
  return addComment({
    type: 'common',
    name: bean.name,
    process: bean.process,
    processName: bean.processName,
    flavors: bean.flavors
  })
}

// 生成筛豆子用的豆子
export interface Bean {
  id: string
  type: BeanType
  x: number
  y: number
  rotation: number
  bouncedOnce?: boolean
}

export function generateBeans(): Bean[] {
  const beans: Bean[] = []
  
  // 4颗问题豆
  beans.push(createBean('green', 0))
  beans.push(createBean('green', 1))
  beans.push(createBean('broken', 2))
  beans.push(createBean('worm', 3))
  
  // 20颗好豆
  for (let i = 4; i < 24; i++) {
    beans.push(createBean('good', i))
  }
  
  return shuffleBeans(beans)
}

function createBean(type: BeanType, id: number): Bean {
  return {
    id: `bean-${id}`,
    type,
    x: Math.random(),
    y: Math.random(),
    rotation: Math.random() * 360
  }
}

function shuffleBeans(beans: Bean[]): Bean[] {
  const shuffled = [...beans]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
