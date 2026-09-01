# GWP 组件接口

## 基础交互组件（GWP-015）

本文件记录 `GWP_给我压扁 / 02_Components / Base` 在 GWP-015 冻结的基础组件接口。Figma 文件 `mini-game` 是视觉源，节点 ID 与截图用于后续屏幕设计和 Dev Handoff 精确定位。

## 复用结论

执行前已在当前文件、`02_Components` 子树与本地组件清单中查询 Button、IconButton、Segment、Status、Progress、Toast 与 Loading。现有命中均属于页面左侧旧项目（`237:*`），变量、命名、状态矩阵和 GWP Section 边界均不兼容；GWP Section 内没有可包装的正式组件。因此本任务新建 7 个 GWP 组件集，并建立 8 个仅供这些组件复用的内部图标原子。未引入远程库，也未修改 Section 外节点。

## 冻结矩阵

| 组件 | Figma ID | Variant 矩阵 | 数量 | 公开属性 | 使用与禁止场景 |
|---|---|---|---:|---|---|
| `GWP/A-Button` | `352:516` | Role `Primary/Secondary/Danger` × Size `M/L` × State `Default/Pressed/Disabled/Loading` | 24 | `Label`、`Show Leading Icon`、`Leading Icon` | 明确动作；同屏不得出现多个 Primary，不得用图片烘焙文字。Danger 与 Loading 保留语义预设。 |
| `GWP/A-IconButton` | `352:623` | Role `Neutral/Emphasis/Back/Close` × Size `44/52` × State `Default/Pressed/Disabled` | 24 | `Icon`、`Show Badge` | 紧凑图标动作；不得缩小 44px 触控区。Back/Close 固定语义默认图标，Neutral/Emphasis 可交换图标。 |
| `GWP/A-SegmentedControl` | `352:866` | Items `2/3` × 合法 Selected `None/1/2[/3]` × State `Default/Pressed/Disabled` | 21 | `Item 1/2/3` | 同层内容切换；不得承载页面主导航或超过 3 项。 |
| `GWP/A-StatusPill` | `352:911` | Tone `Info/Success/Warning/Locked/Completed` × Emphasis `Default/Emphasized` | 10 | `Label`、`Show Icon`、`Icon` | 短状态；不得放长句或替代按钮。非 Info Tone 保留语义文案和图标预设。 |
| `GWP/A-Progress` | `352:978` | Kind `Linear/Stars/Loading` × State `Default/Loading/Completed/Error` | 12 | `Label`、`Show Label` | 真实进度或结果；不得用动画制造虚假进度。Linear 默认值可编辑，结果与星级状态保留语义预设。 |
| `GWP/C-Toast-InlineMessage` | `353:1023` | Kind `Toast/Inline` × Tone `Info/Success/Error/Offline` | 8 | `Message`、`Show Icon`、`Icon` | Toast 用于短暂反馈，Inline 保留上下文；不得用 Toast 承载必须确认的信息。非 Info Tone 保留语义预设。 |
| `GWP/A-Loading` | `353:1052` | Context `Startup/Local/Button` | 3 | `Label`、`Show Label` | 真实等待；不得使用无结束条件的装饰性旋转。Startup/Button 保留上下文文案。 |

合计 7 个组件集、102 个受控 Variant。图标通过 INSTANCE_SWAP 或语义固定实例复用，不为每个图标建立 Variant。

## 内部图标原子

`GWP/Icon/Default` `352:391`、`Back` `352:393`、`Close` `352:395`、`Check` `352:397`、`Warning` `352:399`、`Offline` `352:401`、`Lock` `352:403`、`Spinner` `352:405`。

这些原子只为基础组件提供可交换实例和语义预设，不作为玩家界面直接排版单元。

## 设计与可访问性约束

- 所有组件根节点使用 Auto Layout；交互尺寸为 44、48 或 52px，满足最小触控区要求。
- 颜色、间距、圆角、描边、字体、尺寸与状态 opacity 均绑定 GWP Foundations；组件审计没有发现硬编码 Paint 或根节点 Auto Layout 缺失。
- Pressed/Disabled 分别绑定 `GWP / Opacity/pressed` `0.88` 与 `GWP / Opacity/disabled` `0.38`。Disabled 与 Locked 容器使用 `surface` token 保持文字可读，状态仍由 opacity 与语义图标表达。
- TEXT、BOOLEAN 与 INSTANCE_SWAP 只连接可安全定制的子节点；危险、加载、错误、断网、锁定等语义预设不会被公共默认值覆盖。
- 组件说明已写入 Figma Component Set description；对应文档框架 ID 见 `STATE.json`。

## 验证证据

- [Button](./screenshots/gwp-015-a-button.png)
- [IconButton](./screenshots/gwp-015-a-icon-button.png)
- [SegmentedControl](./screenshots/gwp-015-a-segmented-control.png)
- [StatusPill](./screenshots/gwp-015-a-status-pill.png)
- [Progress](./screenshots/gwp-015-a-progress.png)
- [Toast / InlineMessage](./screenshots/gwp-015-c-toast-inline-message.png)
- [Loading](./screenshots/gwp-015-a-loading.png)

最终节点扫描结果为 15 个 `GWP/` 命名节点：7 个 Component Set 与 8 个内部 Component；页面仍为原 8 个 Section 加 `GWP_给我压扁`，Section 外 ID 和边界未变化。

## 导航与内容组件（GWP-016）

GWP-016 严格执行“gpt-image-2视觉输入 → Figma原生重建”的顺序。无文字组件视觉板先生成并导入 `02_Components/Content` 的 `Content/Image-2 Reference v02`，随后才建立正式组件。Image-2只提供造型、配色和材质锚点；标题、状态、布局、变量与交互属性全部保留为Figma原生可编辑结构。

### 冻结矩阵

| 组件 | Figma ID | Variant 矩阵 | 数量 | 公开属性与状态验证 | 使用与禁止场景 |
|---|---|---|---:|---|---|
| `GWP/C-TopBar` | `355:2882` | Context `Home/Page` × State `Default/Scrolled/Offline` | 6 | `Title`、`Show Back/Resource/Settings`；断网胶囊同时使用图形与文字 | 非游戏页顶部导航；不得覆盖平台胶囊和安全区。 |
| `GWP/C-BottomNav` | `355:2009` | Selected `Journey/Mode/Collection/Skin` × State `Default/Badge/Disabled` | 12 | 四项标签、选中、红点与禁用 | 仅四个主导航根页；详情页和游戏中不常驻。 |
| `GWP/C-ModeCard` | `355:2062` | State `Default/Selected/Locked/Completed` | 4 | `Title`、`Description`、`Show Preview`；验证两行长中文 | 模式选择；锁定必须显示可验证条件。 |
| `GWP/C-ThemeCard` | `355:2127` | State `Default/Selected/Locked/Completed` | 4 | 主题预览与 `0/45`、`9/45`、`45/45` 进度 | 主题选择；背景预览不得烘焙标题与星数。 |
| `GWP/C-LevelCard` | `355:2670` | State `Default/Current/Locked/Completed/Perfect` | 5 | `Level`、`Show Reward`；0–3星、奖励提示和锁定条件 | 15关网格；Locked不可触发开始动作。 |
| `GWP/C-CollectionCell` | `355:2194` | State `Unknown/Discovered/Partial/Completed` | 4 | `Name`、`Show Thumbnail`；剪影与 `0/3`–`3/3` | 图鉴网格；未知态不暴露名称或真实缩略图。 |
| `GWP/C-ItemDetailCard` | `355:2738` | Result `Perfect/Under/Over` × State `Default/Empty` | 6 | `Title`、`Material`、`Show Preview`；长中文、0、999、99,999与空态 | 图鉴详情；三类结果必须保留文字语义。 |
| `GWP/C-SkinCard` | `355:2308` | State `Locked/Unlockable/Selected/Applied` | 4 | `Title`、`Show Preview`；解锁条件与使用中状态 | 外观选择；Selected与Applied不得混为同一动作。 |
| `GWP/C-RewardCard` | `355:2393` | Kind `Reward/Item/Theme/Skin` × State `Granted/Claimed` | 8 | `Show Reward Art`；四类奖励使用不同可编辑插画 | 奖励结果；不得重复发放已领取内容。 |
| `GWP/C-UnlockPanel` | `355:2500` | Kind `Item/Theme/Skin` × State `Revealing/Ready` | 6 | `Title`、`Show Reward`；内部复用RewardCard实例 | 新内容揭示；Revealing状态不可执行收下动作。 |
| `GWP/C-AchievementCard` | `355:2811` | State `Pending/InProgress/Completed/Claimed` | 4 | `Title`、`Description`；徽章、长中文和 `0/3`–`3/3` | 成就列表；Completed与Claimed必须明显区分。 |

合计 11 个 Component Set、63 个受控 Variant。全部根节点使用 Auto Layout，颜色、间距、圆角、描边、字体、尺寸和状态透明度复用 GWP Foundations；逐组构建审计没有发现硬编码 Paint 或根节点 Auto Layout 失败。

### 视觉与内容约束

- 组件视觉延续GWP-012批准的充气贴纸工坊：奶油白表面、工业黄、薄荷绿、深墨蓝外框与抬升阴影；禁止退回几何圆点占位图。
- 机器、工坊、纸箱、橡皮鸭、礼盒、未知剪影和成就徽章均为Figma原生分层图形，可替换、缩放和继续精修；Image-2参考图不承载最终文字或交互状态。
- 颜色之外始终保留中文状态、图形或星级区别；断网、锁定、空态、完成和已领取不能只靠颜色表达。
- 正式屏幕组装仍由GWP-018至GWP-021执行；这些组件不得被当作已经冻结的完整页面。

### 验证证据

- [gpt-image-2组件视觉板](../../design/wip/gwp-016-content-components/component-board-v02.png)
- [TopBar](../../design/wip/gwp-016-content-components/figma-topbar-set-v04.png)
- [BottomNav](../../design/wip/gwp-016-content-components/figma-bottom-nav-set-v02.png)
- [ModeCard](../../design/wip/gwp-016-content-components/figma-mode-card-set-v02.png)
- [ThemeCard](../../design/wip/gwp-016-content-components/figma-theme-card-set-v02.png)
- [LevelCard](../../design/wip/gwp-016-content-components/figma-level-card-set-v03.png)
- [CollectionCell](../../design/wip/gwp-016-content-components/figma-collection-cell-set-v02.png)
- [ItemDetailCard](../../design/wip/gwp-016-content-components/figma-item-detail-set-v03.png)
- [SkinCard](../../design/wip/gwp-016-content-components/figma-skin-card-set-v02.png)
- [RewardCard](../../design/wip/gwp-016-content-components/figma-reward-card-set-v02.png)
- [UnlockPanel](../../design/wip/gwp-016-content-components/figma-unlock-panel-set-v02.png)
- [AchievementCard](../../design/wip/gwp-016-content-components/figma-achievement-card-set-v03.png)
