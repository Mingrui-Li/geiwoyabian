# 《给我压扁！》Figma Gap Analysis 与 v1 范围锁定

版本：1.0（用户已确认）
任务：GWP-013
Run ID：`gwp-013-20260828-01`
目标文件：`mini-game` / `83pqrCcig644vC20QXM5G1`
共享 Page：`shanliyoubao` / `11:7101`

## 1. Discovery 结论

### 1.1 仓库侧

- 仓库没有 Cocos、前端工程、CSS、Tailwind、theme object 或 `*.tokens.json`；当前不存在可直接同步的生产代码 token 或组件实现。
- v1 设计系统的产品来源是 `docs/UI_DESIGN_WORKFLOW.md`、`docs/design/VISUAL_DIRECTION.md` 与 `docs/design/COMPONENT_INVENTORY.md`。
- 唯一批准视觉方向是 B“充气贴纸工坊”。批准资产只提供色彩、轮廓、材质和构图输入，不能当作最终 Figma 组件或屏幕。

### 1.2 Figma 文件与编辑边界

- 锚点 `11:7101` 是共享 Page 本身，不是本项目 Frame 或 Section。
- 创建前 Page 有 8 个其他项目顶层 Section；最右边界是 `x=19650`，最下边界是 `y=12600`。
- 用户确认范围后已创建唯一顶层 Section `GWP_给我压扁`（`337:139`），实际边界为 `x=20050, y=0, width=6400, height=14000`，与原有最右节点保留 400 设计像素间隔。
- 创建后 Page 有 9 个顶层 Section；新 Section 为空，原有 8 个顶层节点的 ID、名称和边界与创建前一致。
- 所有 Section 外节点只作边界检查；不移动、不重命名、不锁定、不重用其内部节点。

### 1.3 文件级本地设计系统现状

| 类型 | 现状 | 结论 |
|---|---|---|
| 变量集合 | 2 个集合、18 个变量 | 全部无 code syntax，全部使用 `ALL_SCOPES`；命名和用途属于邻近项目，不复用、不修改 |
| 组件 | 文件级共 76 个 component、12 个 component set；其中 Section `02 Components` 有 28 个 standalone component | 既有组件属于共享 Page 上的其他项目，命名、视觉与 API 均不符合本项目，不复用、不包装 |
| Text styles | 7 个 | 使用 `Source Han Sans SC Regular` 为主，层级属于邻近项目；不修改，新的样式使用 `GWP/` 前缀 |
| Effect styles | 1 个 | `effect.handDrawnShadow` 为手绘棕色硬阴影，与批准的短柔和贴纸偏移阴影冲突，不复用 |
| Paint styles | 15 个 | 森林、木材、竹子等邻近项目色板，与批准色板冲突，不复用 |
| Grid styles | 1 个 | 375×667 邻近项目网格，与本项目 360×800 / 375×812 / 393×873 基准不一致，不复用 |
| 远程变量集合 | 0 个已启用集合 | 没有可在 Plugin API 中直接检查或 alias 的远程变量 |
| 字体 | Page 使用 `Source Han Sans SC Regular`；环境可用 `Noto Sans SC` 7 个字重 | GWP-014 必须重新验证实际可加载字体与授权，不继承邻近项目字体决定 |

### 1.4 Libraries 与搜索记录

`get_libraries` 已先于任何 `search_design_system` 调用完成，且没有下一页：

- 已添加：Material 3 Design Kit、Simple Design System、iOS and iPadOS 26/27、watchOS 26、visionOS 26、macOS 26/27。
- 可添加：0；`libraries_available_to_add_next_offset = null`。
- scoped token/style broad search 没有返回可复用变量或样式。
- scoped component search 与后续最小参数诊断均被官方 Starter MCP 限额拒绝；完整错误为“reached the Figma MCP tool call limit on the Starter plan”。
- 本地 `figma-mcp-rust 0.2.0` 已成功启动为 `LEADER`，但其 73 个工具不包含远程 library search；它用于后续无 REST 限额的本地文件读写。

因此不能声称远程库“没有组件”。v1 方案明确不把远程库作为依赖：Material/Apple 的视觉语言、状态 API 与本项目 70 个游戏组件不匹配，且跨库依赖会削弱后续 Cocos 映射的确定性。后续若再次获得远程搜索能力，只能把结果作为审计证据；任何改为 import/wrap 的决定必须先更新本文并再次确认。

## 2. Gap 分类

### 2.1 可复用

- 仓库批准的 6 个色彩锚点和 9 份批准视觉输入可作为取样与构图证据。
- Figma 环境可用的中文字体候选可进入 GWP-014 实测；当前不直接复用邻近项目 Text Style。
- 共享 Page 和锚点可复用为入口，但不复用任何 Section 外节点。

### 2.2 需包装

- 当前无批准包装项。
- 远程库资产搜索未完成，因此不能预先批准任何 Material/Simple DS wrapper。

### 2.3 需新建

- 唯一顶层 Section `GWP_给我压扁`。
- 下文锁定的 80 个 v1 变量、7 个 Text Style、5 个 Effect Style、1 个 Grid Style。
- `COMPONENT_INVENTORY.md` 锁定的 70 个组件；创建顺序固定为原子 → 导航/内容 → 游戏专用 → 模态/状态。
- 后续单 Page 一级 Frame、24 类屏幕、适配、原型与 Dev Handoff，均由后续任务创建，本任务不提前写入。

### 2.4 冲突与处理

| 冲突 | 处理决定 |
|---|---|
| 锚点是共享 Page，不是项目容器 | 新建唯一顶层 Section，不以锚点或邻近 Section 为 parent |
| 文件级变量/样式无法按 Section 隔离 | 所有集合、样式和组件名使用 `GWP` 前缀；不修改任何现有定义 |
| 现有变量均为 `ALL_SCOPES` 且无 code syntax | 不修复他人变量；本项目所有变量明确 scope 与 code syntax |
| 现有组件是散装 standalone component | 不转换、不组合、不包装；本项目从独立 foundations 创建 component set |
| 现有视觉为森林木质风格 | 以批准的“充气贴纸工坊”色板、轮廓与短柔偏移阴影为唯一视觉输入 |
| Figma Starter 每集合仅 1 mode | v1 没有明/暗主题要求；所有集合使用单一 `Default` mode，不伪造 Light/Dark |
| 正式字体尚未决定 | 本任务锁定 7 个文字角色和 token 槽位；字体家族、字重可加载性与授权在 GWP-014 决定 |
| TextStyle 在 headless Plugin API 中不能绑定变量 | GWP-014 创建变量与原始值一致的 Text Style，并在台账记录这个工具限制；不伪造绑定成功 |
| 官方 library search 受 Starter 限额阻断 | 记录失败，不把错误解释为空结果；v1 不依赖远程库，后续可用时再审计 |

## 3. v1 变量精确清单

所有集合只有一个 `Default` mode；所有变量禁止 `ALL_SCOPES`。WEB code syntax 使用 `var(--gwp-...)`，Android/iOS/Cocos 映射名在正式工程建立后补充。

### 3.1 `GWP / Color Primitives`（6 个 COLOR，`scopes=[]`）

| 变量 | 值 |
|---|---|
| `yellow/500` | `#FFC83D` |
| `red/500` | `#FF5D55` |
| `ink/900` | `#243145` |
| `mint/500` | `#63D7B0` |
| `cream/100` | `#FFF4DE` |
| `white/0` | `#FFFFFF` |

### 3.2 `GWP / Color Semantics`（9 个 COLOR）

| 变量 | 初始映射 | scope |
|---|---|---|
| `brand` | `yellow/500` | `FRAME_FILL, SHAPE_FILL, STROKE_COLOR` |
| `accent` | `mint/500` | `FRAME_FILL, SHAPE_FILL, STROKE_COLOR` |
| `success` | `mint/500` | `FRAME_FILL, SHAPE_FILL, TEXT_FILL, STROKE_COLOR` |
| `warning` | `yellow/500` | `FRAME_FILL, SHAPE_FILL, TEXT_FILL, STROKE_COLOR` |
| `danger` | `red/500` | `FRAME_FILL, SHAPE_FILL, TEXT_FILL, STROKE_COLOR, EFFECT_COLOR` |
| `surface` | `cream/100` | `FRAME_FILL, SHAPE_FILL` |
| `text/primary` | `ink/900` | `TEXT_FILL` |
| `text/secondary` | `ink/900`，由 opacity token 控制弱化 | `TEXT_FILL` |
| `disabled` | `ink/900`，由 opacity token 控制弱化 | `FRAME_FILL, SHAPE_FILL, TEXT_FILL, STROKE_COLOR` |

### 3.3 `GWP / Layout`（24 个 FLOAT）

- `spacing/4`, `spacing/8`, `spacing/12`, `spacing/16`, `spacing/24`, `spacing/32`, `spacing/48`；scope `GAP`。
- `radius/8`, `radius/12`, `radius/20`, `radius/28`, `radius/pill=999`；scope `CORNER_RADIUS`。
- `stroke/sticker-white=5`, `stroke/sticker-ink=3`, `stroke/control=2`, `stroke/focus=3`；scope `STROKE_FLOAT`。
- `size/touch-min=44`, `size/action-min=48`, `size/button-primary=52`, `size/canvas-min-width=320`, `size/canvas-base-width=360`, `size/canvas-base-height=800`, `size/content-gutter=16`, `size/content-max-width=361`；scope `WIDTH_HEIGHT`。

### 3.4 `GWP / Opacity`（4 个 FLOAT，scope `OPACITY`）

- `disabled=0.38`
- `secondary=0.72`
- `scrim=0.56`
- `pressed=0.88`

### 3.5 `GWP / Motion`（4 个 FLOAT，`scopes=[]`，单位 ms）

- `duration/click=120`
- `duration/transition=220`
- `duration/reward=420`
- `duration/impact-pause=60`

### 3.6 `GWP / Layer`（8 个 FLOAT，`scopes=[]`）

- `background=0`, `machine=100`, `item=200`, `effects=300`, `hud=400`, `scrim=500`, `modal=600`, `system=700`。

### 3.7 `GWP / Typography`（25 个变量）

- STRING：`family/display`, `family/body`，scope `FONT_FAMILY`；`style/regular`, `style/strong`，scope `FONT_STYLE`。
- FLOAT / `FONT_SIZE`：`size/display=36`, `size/page-title=28`, `size/card-title=20`, `size/body=16`, `size/caption=14`, `size/number=32`, `size/micro=12`。
- FLOAT / `LINE_HEIGHT`：`line-height/display=44`, `line-height/page-title=36`, `line-height/card-title=28`, `line-height/body=24`, `line-height/caption=20`, `line-height/number=38`, `line-height/micro=16`。
- FLOAT / `LETTER_SPACING`：`letter-spacing/display=-0.5`, `letter-spacing/page-title=-0.25`, `letter-spacing/card-title=0`, `letter-spacing/body=0`, `letter-spacing/caption=0`, `letter-spacing/number=0`, `letter-spacing/micro=0`。

字体变量的实际字符串值在 GWP-014 通过 `get_fonts` / available fonts 实测后填写；不得凭记忆写入。

## 4. v1 样式精确清单

### Text Style（7 个）

`GWP/Type/Display`、`GWP/Type/PageTitle`、`GWP/Type/CardTitle`、`GWP/Type/Body`、`GWP/Type/Caption`、`GWP/Type/Number`、`GWP/Type/Micro`。

### Effect Style（5 个）

`GWP/Effect/Sticker/Default`、`GWP/Effect/Sticker/Pressed`、`GWP/Effect/Surface/Raised`、`GWP/Effect/Focus`、`GWP/Effect/Impact/Highlight`。

### Grid Style（1 个）

`GWP/Grid/Mobile/SafeColumns`。Paint Style 不建立；颜色统一由变量提供，避免双重来源。

## 5. v1 组件精确清单（70 个）

本清单以 `docs/design/COMPONENT_INVENTORY.md` 的 ID、属性、状态和使用屏幕为规范；本任务只锁范围，不创建组件。

### 原子（15）

`A-Button`, `A-IconButton`, `A-Switch`, `A-Slider`, `A-SegmentedControl`, `A-FilterChip`, `A-Progress`, `A-StarRating`, `A-StatusBadge`, `A-LockBadge`, `A-MaterialBadge`, `A-NumberTicker`, `A-Spinner`, `A-Divider`, `A-Scrim`。

### 导航与内容（33）

`C-SafeArea`, `C-SurfacePanel`, `C-TopBar`, `C-ResourceCapsule`, `C-BottomNav`, `C-LoadingPanel`, `C-JourneyHeroCard`, `C-ThemeProgress`, `C-DailyTeaser`, `C-ModeCard`, `C-ThemeCard`, `C-LevelCard`, `C-LevelDetailBar`, `C-NavPreview`, `C-CollectionGrid`, `C-CollectionCell`, `C-ItemDetailCard`, `C-ResultVariantCard`, `C-ItemPicker`, `C-SelectedQueue`, `C-DailyOrderCard`, `C-RuleModifier`, `C-ItemPreviewStrip`, `C-EndlessSummary`, `C-SpeedStages`, `C-SkinPreviewStage`, `C-SkinCard`, `C-AchievementRow`, `C-SettingsSection`, `C-SelectRow`, `C-VideoPreview`, `C-CoverPicker`, `C-ShareStatus`。

### 游戏专用（11）

`G-PressHUD`, `G-PressureBar`, `G-ItemProgress`, `G-ComboBadge`, `G-ResultLabel`, `G-TowerHUD`, `G-ChargeRing`, `G-TowerStack`, `G-ScoreTicker`, `G-LevelResultPanel`, `C-ResultBreakdown`。

### 模态、反馈与系统状态（11）

`C-PauseModal`, `C-RewardModal`, `C-RewardCard`, `C-AdRewardModal`, `C-ConfirmModal`, `C-ErrorModal`, `C-OfflineModal`, `C-RecoveryModal`, `C-Toast`, `C-RewardToast`, `C-EmptyState`。

## 6. 明确不创建

- 不创建明/暗模式、品牌换肤或多语言 mode；v1 当前没有这些产品要求，且 Starter 方案原生 mode 受限。
- 不建立 Material、Apple 或 Simple DS 远程依赖。
- 不导入候选/拒绝/preview-only 图片；本任务也不提前导入批准图。
- 不创建任何组件、正式屏幕、一级内容 Frame、原型或 Cocos 资产。
- 不新增排行榜、公会、家园、剧情、多人、个人中心或独立商城相关组件。

## 7. 用户确认记录

用户于 2026-08-28 回复“插件已连接，确认范围”，确认以下整体范围；随后才创建 Section：

1. 接受 80 个变量、7 个 Text Style、5 个 Effect Style、1 个 Grid Style 与 70 个组件的 v1 清单。
2. 接受 v1 不依赖远程 design library，全部组件在项目 Section 内本地创建。
3. 接受正式字体家族留到 GWP-014 实测和授权确认，当前只锁定角色与尺寸槽位。
4. 接受 Section 计划边界 `x=20050, y=0, 6400×14000`。
