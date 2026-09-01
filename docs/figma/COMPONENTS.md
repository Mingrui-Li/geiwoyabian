# GWP 基础交互组件

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
