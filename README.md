# 水墨春秋·新年咖啡签

6 幕互动式网页体验，通过挑豆、研磨、注水、品茗、签名，最终生成专属「水墨咖啡签」卡片。

## 在线体验

部署后访问: `https://username.github.io/water-ink-coffee/`

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 在浏览器打开 http://localhost:5173
```

## 构建

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 部署到 GitHub Pages

```bash
# 一键部署（需要先 git init 并推送到 GitHub）
npm run deploy
```

### 手动部署步骤

1. 创建 GitHub 仓库 `water-ink-coffee`
2. 在仓库设置中启用 GitHub Pages
3. Source 选择: `gh-pages` branch
4. 运行 `npm run deploy`

## 项目结构

```
src/
├── app/                    # 应用核心
│   ├── App.tsx            # 根组件
│   ├── App.css            # 全局样式
│   ├── SceneManager.tsx   # 场景管理器
│   ├── store.tsx          # 全局状态 (Context + Reducer)
│   └── types.ts           # TypeScript 类型定义
│
├── scenes/                # 6幕场景
│   ├── Scene1_Mood.tsx    # 心境选择
│   ├── Scene2_SelectBeans.tsx  # 挑豆游戏 (25分)
│   ├── Scene3_Grind.tsx   # 研磨游戏 (30分)
│   ├── Scene4_Brew.tsx    # 注水游戏 (45分)
│   ├── Scene5_TasteAndSign.tsx # 品茗+签名
│   └── Scene6_RenderCard.tsx   # 成像+分享
│
├── components/            # 共享组件
│   ├── SignaturePad.tsx   # 手写签名板
│   └── ShareCardCanvas.ts # 卡片生成 Canvas
│
├── data/                  # 数据文件
│   ├── zen.ts            # 禅字库 (20个)
│   ├── colors.ts         # 颜色系统
│   ├── personality.ts    # 人格融合句库
│   └── beans.ts          # 豆子数据与结果逻辑
│
├── utils/                 # 工具函数
│   ├── random.ts         # 随机值生成
│   ├── scoring_*.ts      # 各游戏评分逻辑
│   └── download.ts       # 文件下载
│
└── styles/               # 样式文件
    └── base.css          # 基础样式
```

## 关键文件说明

| 文件 | 功能 |
|------|------|
| `src/utils/scoring_selectBeans.ts` | 挑豆评分算法 |
| `src/utils/scoring_grind.ts` | 研磨评分算法 |
| `src/utils/scoring_brew.ts` | 注水评分算法 |
| `src/components/ShareCardCanvas.ts` | 卡片 Canvas 渲染 |
| `src/components/SignaturePad.tsx` | 手写签名组件 |

## 扩展指南

### 添加人格句

编辑 `src/data/personality.ts`:
```typescript
export const regularSentences: PersonalitySentence[] = [
  { text: '你的新句子...' },
  // ... 添加到 60 条
]
```

### 添加禅字

编辑 `src/data/zen.ts`:
```typescript
export const zenWords: ZenWord[] = [
  {
    word: '新字',
    explanation: '解释...',
    blessings: [
      { main: '祝福主句...', sub: '祝福副句...' }
    ]
  }
]
```

## 技术栈

- React 18 + TypeScript
- Vite (构建工具)
- CSS Animations + requestAnimationFrame
- Canvas (签名与卡片生成)

## 许可

MIT
