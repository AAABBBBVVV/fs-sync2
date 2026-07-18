<p align="center">
  <img src="public/icon.svg" width="80" height="80" alt="Feishu Sync">
  <h1 align="center">一款超好用的棋牌室、台球厅、桌游吧、茶楼、民宿时长计费系统</h1>
  <p align="center">
    专为线下场所打造的时长计费云管系统
  </p>
  <p align="center">
    <a href="https://feishu-sync-production.up.railway.app/">
      <img src="https://img.shields.io/badge/demo-online-brightgreen?style=for-the-badge" alt="在线体验">
    </a>
    <a href="https://github.com/exerciseyuan-ai/feishu-sync">
      <img src="https://img.shields.io/badge/⭐_Star_on_GitHub-lightgrey?style=for-the-badge" alt="Star">
    </a>
    <a href="https://railway.app">
      <img src="https://img.shields.io/badge/deploy-on_Railway-blueviolet?style=for-the-badge" alt="Railway">
    </a>
  </p>
</p>

<p align="center">
  免费好上手 ⭐ 欢迎 Star<br>
  🌐 在线体验：https://feishu-sync-production.up.railway.app/<br>
  这是一套开箱即用的计时计费解决方案<br>
  让棋牌室、桌游吧、茶楼、台球厅、民宿等场所，轻松实现数字化运营
</p>

---

## 痛点：线下计时计费，你真的管得清吗？

| 问题 | 传统方式 | 带来的麻烦 |
|------|----------|------------|
| **计时混乱** | 全靠手工记 | 漏单、纠纷不断 |
| **计费复杂** | 最低消费、超时单价、计费单位，手算算不清 | 错收漏收，客户不满 |
| **状态不清** | 对讲机、微信群沟通房间状态 | 忙起来一团乱 |
| **结算麻烦** | 手写小票，计算器对账 | 效率低，易出错 |
| **数据散落** | 价格和规则散落在 Excel 和纸质本上 | 更新不同步 |

**Feishu Sync 一次性解决**——计时自动、计费智能、状态可视、结算一键完成。

---

## 核心功能

### ⏰ 智能计时计费

- **一键开始/结束计费：** 房间状态自动切换，计时精确到秒
- **自定义计费规则：** 最低消费、最低时长、超时单价、计费单位（分钟）全部可配
- **固定时长设置：** 支持限时包场模式，倒计时提醒，超时自动加收
- **实时费用预览：** 使用中房间随时查看当前费用明细（基础费 + 超时费 + 消费 + 借支）

### 🏠 房间周期管理

- 房间支持多种类型（V01 桌球 / V888 麻将等），灵活扩展
- **状态流转：** 空闲 → 使用中 → 待打扫 → 打扫中 → 停用，每一步都有对应操作
- 拖拽排序，房间展示顺序随心调
- 房间详情弹窗集成所有操作（开始计费、设置时长、消费、借支、结算、打扫等）

### 🧾 完整结算与订单体系

- 结算时自动生成唯一订单号，记录开始/结束时间、使用时长、各项费用
- **消费小票打印**（支持自定义抬头），结账即打单，专业又快捷
- 订单管理支持按时间、房间类型、订单号筛选与搜索
- **一键导出 Excel**，对账、报表轻松搞定

### 🛒 商品消费（辅助功能）

- 商品管理：名称、分类、价格、库存、售卖状态
- 使用中的房间可添加商品消费，费用自动累加至总账
- 库存自动扣减，支持低库存预警

### ☁️ 飞书数据同步（锦上添花）

- 商品数据支持从**飞书表格一键同步**，价格和库存维护更省心
- 纯本地配置，凭证不上传云端，安全可控

---

## 为什么选 Feishu Sync？

| 对比项 | 传统手工方式 | Feishu Sync |
|--------|------------|-------------|
| 计时 | 凭记忆、手表 | 系统自动计时，精确到分钟 |
| 计费 | 心算 + 草稿纸 | 规则引擎自动计算，杜绝错误 |
| 房间状态 | 对讲机、微信群 | 看板实时更新，一目了然 |
| 结算 | 手写单据 | 一键结算，自动生成订单与小票 |
| 对账 | 月底翻账本 | 订单可导出 Excel，随时对账 |
| 数据维护 | 改 Excel 再通知 | 飞书同步或后台直接编辑，实时生效 |

---

## 适合谁用？

- **棋牌室 / 麻将馆** — 按小时计费，超时加收，包场限时
- **桌球厅 / 台球俱乐部** — 多桌计时，灵活规则
- **桌游吧 / 剧本杀店** — 按场次或时长收费，商品消费一站式结算
- **茶楼 / 民宿** — 包间计时，小商品售卖
- **任何需要计时收费的线下空间**

---

## 技术亮点

- **纯前端 + 轻量后端：** HTML/CSS/JS + Node.js，部署简单
- **本地缓存 + 云端同步：** 数据可存 localStorage，也可通过飞书备份
- **PWA 支持：** 可安装到手机桌面，像原生 App 一样使用
- **开源免费：** 代码完全开放，可自由二次开发

---

## 快速上手

### 本地运行

```bash
git clone https://github.com/exerciseyuan-ai/feishu-sync.git
cd feishu-sync
node server.js
# 访问 http://localhost:3000
```

### 一键部署 Railway

1. [Fork 本仓库](https://github.com/exerciseyuan-ai/feishu-sync/fork) 到你的 GitHub 账号
2. 登录 [Railway.app](https://railway.app)，点击 New Project → Deploy from GitHub repo
3. 选择本仓库，Railway 自动检测 Node.js 并启动
4. 部署完成即获得域名，无需任何额外配置

### 部署至 Render

1. Fork 本仓库
2. 登录 [Render.com](https://render.com)，New + → Web Service
3. Start Command 设为 `node server.js`
4. Deploy

---

## 飞书同步配置（可选）

1. 在 [飞书开发者后台](https://open.feishu.cn/app) 创建企业自建应用
2. 开启权限：`drive:drive.readonly`（读取云文档）、`sheets:sheet`（读写表格）
3. 发布应用，获取 App ID 和 App Secret
4. 在飞书多维表格中创建商品列表（含「名称」「价格」「单位」「分类」等列）
5. 在云管中点击 **商品管理 → 从飞书同步**，填入凭证和表格链接即可

---

## 项目结构

```
feishu-sync/
├── server.js              # Web 服务器 + 飞书 API 代理
├── package.json           # 项目配置
├── public/
│   ├── 3.0.0.html         # 主应用（含完整 UI 和业务逻辑）
│   ├── manifest.json      # PWA 清单
│   ├── sw.js              # Service Worker
│   └── icon.svg           # 应用图标
└── README.md
```

---

## 截图

> 欢迎贡献截图！部署后可截图并提交 PR。

| 工作台 | 房间操作面板 | 结算小票 |
|--------|-------------|----------|
| Dashboard 概览卡片 | 计时计费与状态管理 | 一键打印消费小票 |

---

<p align="center">
  <strong>Feishu Sync</strong> — 让计时计费回归简单，让线下经营更从容
  <br>
  即刻部署，免费使用，你的门店管理好帮手
  <br><br>
  <a href="https://github.com/exerciseyuan-ai/feishu-sync">GitHub 仓库</a>
  ·
  <a href="https://feishu-sync-production.up.railway.app/">在线体验</a>
  ·
  <a href="https://github.com/exerciseyuan-ai/feishu-sync/issues">反馈建议</a>
  <br><br>
  <sub>Made with ❤️ by exerciseyuan-ai</sub>
</p>
