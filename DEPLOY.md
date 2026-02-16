# 部署到 GitHub Pages

## 已完成的步骤
- [x] Git 仓库已初始化
- [x] 代码已提交（2 个 commit）
- [x] 生产构建已通过（`npm run build`）

## 你需要做的（一次性）

### 1. 在 GitHub 上创建仓库
1. 打开 https://github.com/new
2. 仓库名填：**water-ink-coffee**（必须与项目 `base` 一致）
3. 选择 Public，**不要**勾选 “Add a README”
4. 点击 Create repository

### 2. 关联并推送代码
在项目根目录执行（把 `YOUR_USERNAME` 换成你的 GitHub 用户名）：

```bash
git remote add origin https://github.com/YOUR_USERNAME/water-ink-coffee.git
git push -u origin main
```

### 3. 发布到 GitHub Pages
```bash
npm run deploy
```

### 4. 开启 Pages
1. 仓库页面 → **Settings** → **Pages**
2. Source 选 **Deploy from a branch**
3. Branch 选 **gh-pages**，目录选 **/ (root)**，Save
4. 等 1～2 分钟，访问：**https://YOUR_USERNAME.github.io/water-ink-coffee/**

## 之后更新部署
改完代码后：
```bash
npm run build
git add .
git commit -m "你的说明"
git push
npm run deploy
```
