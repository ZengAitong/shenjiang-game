# 轮回修正（文字修仙 MUD · 走格子地图）

一个手机端 **文字 MUD 修仙游戏**：固定手绘的格子世界地图，四方向移动、一步一格，走到哪触发哪的文字描述与事件。纯前端 PWA，可云端编译成 Android APK。

## 玩法

- **格子地图探索**：36×26 手绘世界（无量神宫、天柱山、灵草坡、灵石矿区、万妖林、东海、仙人遗迹、归墟），坐标制，进入新区域会记录文字描述
- **走格子移动**：四方向一步一格，山/水不可通行；移动消耗寿元
- **地图物件**：灵草/矿脉可采集；小妖/大妖/区域 BOSS 可战斗；宗门（顿悟/招募神将）、练功房（闭关×3）、坊市（买卖）、传送阵、遗迹（随机机缘）；野外有随机遭遇
- **回合战斗**：带暴击，生命战后不恢复（打坐/丹药恢复）；战败返回出生点并折损寿元
- **修仙体系**：凡人→炼气→筑基→结丹→元婴→化神→合体→大乘→渡劫（各含初期/中期/后期/巅峰），气海阈值突破；属性、气海、神识、力量、速度、寿元、天道
- **寿元与轮回**：行动消耗寿元、突破提升寿元；寿元耗尽强制轮回，元婴后可主动轮回（保留神将、天道、轮回点）
- **无挂机收益**：一切靠行动；天道按现实时间缓慢累积（原设定）

## 目录结构

```
index.html / manifest.webmanifest / sw.js    PWA 外壳
css/style.css                                样式
data/world.js                                ★ 世界地图（手绘/区域/BOSS/图例）
data/realms.js                               境界表（气海阈值/属性/寿元）
data/paths.js                                流派与灵根
data/heroes.js                               神将
data/items.js                                材料/丹药/装备
js/util.js / data.js / store.js              工具/数据访问/存档
js/systems.js                                移动/采集/战斗/修炼/建筑/轮回
js/ui.js / app.js                            界面/入口
android/                                     Android WebView 壳（云端编译 APK）
.github/workflows/build-apk.yml              GitHub Actions 打包 APK
```

## 怎么改地图

`data/world.js` 里的 `map` 是 36 行字符串图，图例：

`#`山 `~`水 `.`平原 `f`森林 `r`路 `c`灵草 `m`矿脉 `g`小妖 `G`大妖 `B`区域BOSS `s`宗门 `d`练功房 `b`坊市 `p`传送阵 `x`遗迹 `@`出生点

区域在 `zones`（矩形范围+名称+描述）；BOSS 数值在 `monsters`，按区域映射见 `bossByZone`。改完 push 即生效。

## 部署

- **网页**：GitHub Pages（`https://zengaitong.github.io/shenjiang-game/`）
- **APK**：push 后 GitHub Actions 自动编译，产物在仓库 Actions → build-apk → Artifacts
