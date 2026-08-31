# 《给我压扁！》Figma Foundations v1

版本：1.0
任务：`GWP-014`
Run ID：`gwp-014-20260831-01`
Figma：`mini-game` / Page `shanliyoubao` (`11:7101`) / Section `GWP_给我压扁` (`337:139`)

## 1. 结论

- 已在共享文件内建立 7 个 `GWP /` 变量集合、80 个变量和 7 个单一 `Default` mode。
- 80/80 变量均有明确 scope，未使用 `ALL_SCOPES`；80/80 均有唯一 WEB code syntax，格式为 `var(--gwp-...)`。
- 9 个 Semantic Color 全部使用 `VARIABLE_ALIAS` 指向 Color Primitive，没有复制 raw value。
- 已建立 7 个 Text Style、5 个 Effect Style 和 1 个 Grid Style；不建立 Paint Style。
- 已按 `docs/UI_DESIGN_WORKFLOW.md` 建立 10 个单 Page 一级 Frame，并在 `01_Foundations` 内建立 7 个文档区。
- 未创建组件、正式屏幕、原型或 Cocos 内容。

完整的 collection、variable、style、frame 和文档节点 ID 见 [`STATE.json`](./STATE.json)。

## 2. figma-mcp-rust 强制门禁

正式变量写入前完成以下验证：

1. 重新列出 `figma-mcp-rust 0.2.0` 的 73 个工具。
2. 使用仓库内 development plugin 扩展 `docs/figma/tooling/figma-mcp-rust-gwp014/`，通过现有 `create_variable.value` 字符串承载原子 envelope。
3. 创建临时集合 `GWP / Capability Probe`（`VariableCollectionId:348:139`）和变量 `probe/value`（`VariableID:348:140`）。
4. 写入并读回 `scopes=["WIDTH_HEIGHT"]`、`WEB=var(--gwp-capability-probe)` 和 description。
5. 精确删除临时集合并确认正式创建前无 probe 残留。

扩展同时拒绝 `ALL_SCOPES`、验证 scope/platform、支持同类型 alias，并在原子创建失败时删除刚创建的变量。

## 3. 变量总览

| Collection | ID | Mode | 数量 | 类型与用途 |
|---|---|---:|---:|---|
| `GWP / Color Primitives` | `VariableCollectionId:348:141` | `Default` | 6 | raw COLOR，`scopes=[]` |
| `GWP / Color Semantics` | `VariableCollectionId:348:142` | `Default` | 9 | alias COLOR，按用途限定 fill/text/stroke/effect |
| `GWP / Layout` | `VariableCollectionId:348:143` | `Default` | 24 | spacing、radius、stroke、size |
| `GWP / Opacity` | `VariableCollectionId:348:144` | `Default` | 4 | 状态透明度 |
| `GWP / Motion` | `VariableCollectionId:348:145` | `Default` | 4 | 确定性时长，单位 ms |
| `GWP / Layer` | `VariableCollectionId:348:146` | `Default` | 8 | 运行时层级 |
| `GWP / Typography` | `VariableCollectionId:348:147` | `Default` | 25 | family/style/size/line-height/letter-spacing |

### 3.1 Code syntax 规则

所有 WEB syntax 使用 `var()` 包装且唯一：

- Color：`var(--gwp-color-{name})`
- Layout：`var(--gwp-spacing-*)`、`var(--gwp-radius-*)`、`var(--gwp-stroke-*)`、`var(--gwp-size-*)`
- Opacity：`var(--gwp-opacity-*)`
- Motion：`var(--gwp-motion-*)`
- Layer：`var(--gwp-layer-*)`
- Typography：`var(--gwp-type-*)`

变量路径中的 `/` 转换为 `-`。示例：`text/primary` → `var(--gwp-color-text-primary)`，`duration/impact-pause` → `var(--gwp-motion-duration-impact-pause)`。Android、iOS 和 Cocos 名称等正式工程建立后再补充，不在本任务伪造。

### 3.2 Color Primitives

| Name | Value | Scope |
|---|---|---|
| `yellow/500` | `#FFC83D` | `[]` |
| `red/500` | `#FF5D55` | `[]` |
| `ink/900` | `#243145` | `[]` |
| `mint/500` | `#63D7B0` | `[]` |
| `cream/100` | `#FFF4DE` | `[]` |
| `white/0` | `#FFFFFF` | `[]` |

### 3.3 Color Semantics

| Name | Alias target | Scope |
|---|---|---|
| `brand` | `yellow/500` | `FRAME_FILL, SHAPE_FILL, STROKE_COLOR` |
| `accent` | `mint/500` | `FRAME_FILL, SHAPE_FILL, STROKE_COLOR` |
| `success` | `mint/500` | `FRAME_FILL, SHAPE_FILL, TEXT_FILL, STROKE_COLOR` |
| `warning` | `yellow/500` | `FRAME_FILL, SHAPE_FILL, TEXT_FILL, STROKE_COLOR` |
| `danger` | `red/500` | `FRAME_FILL, SHAPE_FILL, TEXT_FILL, STROKE_COLOR, EFFECT_COLOR` |
| `surface` | `cream/100` | `FRAME_FILL, SHAPE_FILL` |
| `text/primary` | `ink/900` | `TEXT_FILL` |
| `text/secondary` | `ink/900` | `TEXT_FILL` |
| `disabled` | `ink/900` | `FRAME_FILL, SHAPE_FILL, TEXT_FILL, STROKE_COLOR` |

### 3.4 Layout

| Group | Name = value | Scope |
|---|---|---|
| spacing | `spacing/4=4`, `spacing/8=8`, `spacing/12=12`, `spacing/16=16`, `spacing/24=24`, `spacing/32=32`, `spacing/48=48` | `GAP` |
| radius | `radius/8=8`, `radius/12=12`, `radius/20=20`, `radius/28=28`, `radius/pill=999` | `CORNER_RADIUS` |
| stroke | `stroke/sticker-white=5`, `stroke/sticker-ink=3`, `stroke/control=2`, `stroke/focus=3` | `STROKE_FLOAT` |
| size | `size/touch-min=44`, `size/action-min=48`, `size/button-primary=52` | `WIDTH_HEIGHT` |
| size | `size/canvas-min-width=320`, `size/canvas-base-width=360`, `size/canvas-base-height=800` | `WIDTH_HEIGHT` |
| size | `size/content-gutter=16`, `size/content-max-width=361` | `WIDTH_HEIGHT` |

### 3.5 Opacity、Motion 与 Layer

| Collection | Name = value | Scope |
|---|---|---|
| Opacity | `disabled=0.38`, `secondary=0.72`, `scrim=0.56`, `pressed=0.88` | `OPACITY` |
| Motion | `duration/click=120`, `duration/transition=220`, `duration/reward=420`, `duration/impact-pause=60` | `[]` |
| Layer | `background=0`, `machine=100`, `item=200`, `effects=300`, `hud=400`, `scrim=500`, `modal=600`, `system=700` | `[]` |

### 3.6 Typography Variables

| Kind | Name = value | Scope |
|---|---|---|
| family | `family/display="Noto Sans SC"`, `family/body="Noto Sans SC"` | `FONT_FAMILY` |
| style | `style/regular="Regular"`, `style/strong="Bold"` | `FONT_STYLE` |
| size | `display=36`, `page-title=28`, `card-title=20`, `body=16`, `caption=14`, `number=32`, `micro=12` | `FONT_SIZE` |
| line-height | `display=44`, `page-title=36`, `card-title=28`, `body=24`, `caption=20`, `number=38`, `micro=16` | `LINE_HEIGHT` |
| letter-spacing | `display=-0.5`, `page-title=-0.25`, `card-title=0`, `body=0`, `caption=0`, `number=0`, `micro=0` | `LETTER_SPACING` |

## 4. 字体与 Text Style

Figma `available fonts` 实测 `Noto Sans SC` 可加载 `Black, Bold, DemiLight, Light, Medium, Regular, Thin`；v1 只使用 `Regular` 和 `Bold`。Noto CJK Sans 官方仓库声明采用 [SIL Open Font License 1.1](https://github.com/googlefonts/noto-cjk/blob/main/Sans/LICENSE)，允许随软件嵌入与再分发，但发布字体文件时必须保留许可证。

| Text Style | Weight | Size / Line / Letter |
|---|---|---|
| `GWP/Type/Display` | Bold | `36 / 44 / -0.5px` |
| `GWP/Type/PageTitle` | Bold | `28 / 36 / -0.25px` |
| `GWP/Type/CardTitle` | Bold | `20 / 28 / 0` |
| `GWP/Type/Body` | Regular | `16 / 24 / 0` |
| `GWP/Type/Caption` | Regular | `14 / 20 / 0` |
| `GWP/Type/Number` | Bold | `32 / 38 / 0` |
| `GWP/Type/Micro` | Regular | `12 / 16 / 0` |

当前 Figma/Rust 路径不能把 Text Style 的 font fields 绑定到变量；样式以变量相同的已验证原始值建立，不伪报绑定。

## 5. Effect 与 Grid Style

| Effect Style | Type | Color / alpha | Offset | Radius / Spread |
|---|---|---|---|---|
| `GWP/Effect/Sticker/Default` | Drop shadow | Ink / `0.18` | `-2, 4` | `6 / 0` |
| `GWP/Effect/Sticker/Pressed` | Drop shadow | Ink / `0.16` | `-1, 2` | `3 / 0` |
| `GWP/Effect/Surface/Raised` | Drop shadow | Ink / `0.14` | `-3, 8` | `16 / 0` |
| `GWP/Effect/Focus` | Drop shadow | Mint / `0.55` | `0, 0` | `8 / 2` |
| `GWP/Effect/Impact/Highlight` | Drop shadow | Yellow / `0.65` | `0, 0` | `12 / 2` |

`GWP/Grid/Mobile/SafeColumns`：`COLUMNS / STRETCH / count=4 / gutter=16 / offset=16`，用于 360px 主基准。`figma-mcp-rust 0.2.0` 的 column-grid 写入路径忽略自定义 grid color/opacity，因此当前保留 Figma 默认 10% 红色辅助线；几何参数已读回通过，后续不得把辅助线颜色当成产品色。

## 6. 单 Page Frame 结构

`GWP_给我压扁` (`337:139`) 内恰有以下 10 个一级 Frame：

| Frame | ID |
|---|---|
| `00_Cover` | `348:241` |
| `01_Foundations` | `348:242` |
| `02_Components` | `348:243` |
| `03_User_Flows` | `348:244` |
| `04_Core_Screens` | `348:245` |
| `05_Modes_And_Collection` | `348:246` |
| `06_Overlays_And_States` | `348:247` |
| `07_Prototype` | `348:248` |
| `08_Dev_Handoff` | `348:249` |
| `99_Archive` | `348:250` |

任务卡中的 “Getting Started” 作为 `00_Cover` 内的上手路径内容实现；一级 Frame 以 `docs/UI_DESIGN_WORKFLOW.md` 的冻结结构为准，不增加未编号 Frame。

`01_Foundations` 内的 7 个区域：

| Region | ID | Children | Screenshot |
|---|---|---:|---|
| Color | `348:251` | 21 | `gwp-014-foundation-color.png` |
| Typography | `348:252` | 16 | `gwp-014-foundation-typography.png` |
| Spacing | `348:253` | 16 | `gwp-014-foundation-spacing.png` |
| Radius & Stroke | `348:254` | 20 | `gwp-014-foundation-radius-stroke.png` |
| Opacity & Layer | `348:255` | 11 | `gwp-014-foundation-opacity-layer.png` |
| Effects | `348:256` | 13 | `gwp-014-foundation-effects.png` |
| Motion | `348:257` | 11 | `gwp-014-foundation-motion.png` |

## 7. 验证与证据

- 变量读回：7 collections、80 variables、7 Default modes、80 explicit scopes、80 unique WEB syntaxes、9 aliases，全部通过。
- 样式读回：7 Text、5 Effect、1 Grid，名称与数值通过。
- Region metadata：7 个区域边界互不重叠，children 计数为 `21 / 16 / 16 / 20 / 11 / 13 / 11`。
- Visual QA：逐张检查文字裁切、重叠、阴影越界和浅色可见性；cream/white 色块补描边，Opacity 样本补显式解析值后复检通过。
- `figma-mcp-rust` 的 opacity variable binding 在当前导出路径中没有显示解析值，因此文档样本使用与 token 相同的显式值；变量本身的 value/scope/code syntax 已独立读回通过。后续组件阶段必须重新验证 opacity binding，不得根据本画板宣称组件绑定已通过。
- Page 边界：仍为 9 个顶层 Section；原有 8 个 Section 的 ID、名称和边界与 GWP-013 一致，项目 Section 保持 `20050,0,6400×14000`。

证据文件：

- [`gwp-014-cover.png`](./screenshots/gwp-014-cover.png)
- [`gwp-014-foundations-overview.png`](./screenshots/gwp-014-foundations-overview.png)
- [`gwp-014-foundation-color.png`](./screenshots/gwp-014-foundation-color.png)
- [`gwp-014-foundation-typography.png`](./screenshots/gwp-014-foundation-typography.png)
- [`gwp-014-foundation-spacing.png`](./screenshots/gwp-014-foundation-spacing.png)
- [`gwp-014-foundation-radius-stroke.png`](./screenshots/gwp-014-foundation-radius-stroke.png)
- [`gwp-014-foundation-opacity-layer.png`](./screenshots/gwp-014-foundation-opacity-layer.png)
- [`gwp-014-foundation-effects.png`](./screenshots/gwp-014-foundation-effects.png)
- [`gwp-014-foundation-motion.png`](./screenshots/gwp-014-foundation-motion.png)
