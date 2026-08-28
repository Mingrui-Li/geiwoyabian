# 《给我压扁！》批准视觉资产台账

版本：1.0
任务：GWP-012
方向：B“充气贴纸工坊”
生成日期：2026-08-28
生成模式：Codex 内置 `image_gen`，带 GWP-011 B 方向本地参考图

## 1. 状态定义

| 状态 | 含义 | 后续使用 |
|---|---|---|
| `approved-screen` | 已通过方向、竖屏构图与手机可读性检查的整屏视觉基准 | 可导入 Figma 参考区，不可直接当成最终界面 |
| `approved-reference` | 已通过方向、轮廓、光向、材质或透明边检查的资产锚点 | 可用于 Figma Foundations、组件质感和后续资产生产参考 |
| `preview-only` | 从批准整屏机械缩放得到的精确 360×800 检查图 | 只用于 QA，不导入组件或 Dev Handoff |
| `candidate` | 探索候选，尚未批准 | 仅用于追溯，不进入正式设计 |
| `rejected` | 明确不采用或存在阻断缺陷 | 禁止导入 Figma 或 Cocos |

本台账中的“批准”只表示视觉方向与参考资产批准，不代表 Figma 屏幕、组件或 Cocos 生产资产已冻结。

## 2. 批准整屏基准

| ID | 用途 | 文件与像素 | 状态 | 透明背景 | 生成源 | Figma 导入计划 |
|---|---|---|---|---|---|---|
| `SCR-HOME-BASE-01` | 主入口视觉层级、色量、机器/卡片/底栏关系 | [`baseline_home_v01.png`](../../design/approved/gwp-012-puffy-sticker/screens/baseline_home_v01.png)，841×1870 | `approved-screen` | 否，完整背景 | `P07-HOME`；背景、机器、传送带、物品和面板批准锚点 | 放入项目 Section 的视觉基准参考区并锁定；Figma 以组件重建卡片、入口和文字，不从图中切按钮 |
| `SCR-GAME-BASE-01` | 游戏舞台、压头/纸箱中心线、HUD 安全带、长按区 | [`baseline_game_v01.png`](../../design/approved/gwp-012-puffy-sticker/screens/baseline_game_v01.png)，841×1870 | `approved-screen` | 否，完整背景 | `P08-GAME`；背景、机器、传送带和物品批准锚点 | 放入游戏 HUD 参考区；叠加安全区与热区检查层，不把整图作为正式 HUD 背景导出 |
| `SCR-RESULT-BASE-01` | 高塔、冲击锤、粒子密度和结果面板层级 | [`baseline_result_v01.png`](../../design/approved/gwp-012-puffy-sticker/screens/baseline_result_v01.png)，841×1870 | `approved-screen` | 否，完整背景 | `P09-RESULT` + `P10-RESULT-CLEANUP` | 放入高塔/结果参考区；高塔、锤、面板与文字在后续组件和屏幕任务中分层重建 |

三张源图宽高比一致，均为正式竖屏构图；没有沿用 GWP-011 B 结果候选的横向构图或等比留白。

## 3. 批准资产锚点

| ID | 用途 | 文件与像素 | 状态 | 透明背景 | 生成源 | Figma 导入计划 |
|---|---|---|---|---|---|---|
| `MCH-PRESS-BASE-VISUAL` | 液压机形体、结构分块、警示色和轮廓基准 | [`mch_press_base_visual_anchor_v01.png`](../../design/approved/gwp-012-puffy-sticker/machine/mch_press_base_visual_anchor_v01.png)，1214×1295 RGBA | `approved-reference` | 是，真实 alpha | `P01-PRESS` + `P11-PRESS-ALPHA` + `P15-PRESS-EDGE-CLEANUP` | 作为机器组件和皮肤预览的锁定视觉锚点；后续另按机架/压头/活塞/警示灯/底座拆层，不把当前单图当作动画资产 |
| `MCH-CONVEYOR-01-VISUAL` | 传送带视角、皮带节奏、护栏与滚轮材质 | [`mch_conveyor_01_visual_anchor_v01.png`](../../design/approved/gwp-012-puffy-sticker/machine/mch_conveyor_01_visual_anchor_v01.png)，1536×1024 RGBA | `approved-reference` | 是，真实 alpha | `P02-CONVEYOR` + `P12-CONVEYOR-ALPHA` | 作为舞台和皮肤预览锚点；正式生产另拆皮带循环层、滚轮、机身和前沿遮挡层 |
| `ITM-BASELINE-TRIO-01` | 快递纸箱/橡皮鸭/纸杯的脆性、弹性、爆浆材质差异 | [`itm_baseline_box_duck_cup_idle_v01.png`](../../design/approved/gwp-012-puffy-sticker/items/itm_baseline_box_duck_cup_idle_v01.png)，1672×941 RGBA | `approved-reference` | 是，真实 alpha | `P03-ITEM-TRIO` | 导入三份裁切实例做材质对照；后续按单物品 1024×1024 透明画布重新生产 idle/compressed/under/over，不把拼板直接用于游戏 |
| `BG-WORKSHOP-01-VISUAL` | 首主题“桌面乱成团”的背景色量、边缘装饰与中央净空 | [`bg_workshop_01_visual_anchor_v01.png`](../../design/approved/gwp-012-puffy-sticker/backgrounds/bg_workshop_01_visual_anchor_v01.png)，841×1870 | `approved-reference` | 否，完整背景 | `P04-BACKGROUND` | 作为 360/375/393 画板背景与裁切测试输入；后续主题资产生产再拆远层、装饰簇和台面 |
| `TEX-PANEL-UI-KIT-01` | Raised 面板、主/次动作表面和进度槽的质感基准 | [`tex_panel_ui_surface_kit_v01.png`](../../design/approved/gwp-012-puffy-sticker/ui/tex_panel_ui_surface_kit_v01.png)，1536×1024 RGBA | `approved-reference` | 是，真实 alpha | `P05-PANEL-KIT` + `P13-PANEL-ALPHA` | 用于取样描边、阴影、圆角和高光；在 Figma 用变量、效果和 Auto Layout 重建，不直接发布位图按钮或文字面板 |
| `DEC-FX-MOTIF-KIT-01` | 压力箭头、压扁块、压力波、完美冲击、奖励纸屑、回弹波 | [`dec_fx_motif_kit_v01.png`](../../design/approved/gwp-012-puffy-sticker/effects/dec_fx_motif_kit_v01.png)，1662×946 RGBA | `approved-reference` | 是，真实 alpha | `P06-MOTIF-KIT` + `P14-MOTIF-ALPHA` | 可裁切为构图参考；简单母题在 Figma 重绘为矢量，粒子数量、轨迹和调色由后续动效/引擎规范实现 |

## 4. 360×800 验收预览

| ID | 文件 | 状态 | 说明 |
|---|---|---|---|
| `PREVIEW-HOME-360` | [`baseline_home_360x800.png`](../../design/approved/gwp-012-puffy-sticker/previews/baseline_home_360x800.png) | `preview-only` | 从 `SCR-HOME-BASE-01` 机械缩放，无额外构图或留白 |
| `PREVIEW-GAME-360` | [`baseline_game_360x800.png`](../../design/approved/gwp-012-puffy-sticker/previews/baseline_game_360x800.png) | `preview-only` | 从 `SCR-GAME-BASE-01` 机械缩放，无额外构图或留白 |
| `PREVIEW-RESULT-360` | [`baseline_result_360x800.png`](../../design/approved/gwp-012-puffy-sticker/previews/baseline_result_360x800.png) | `preview-only` | 从 `SCR-RESULT-BASE-01` 机械缩放，无候选稿式等比留白 |

## 5. 候选与拒绝资产的物理边界

- 方向 A 历史候选：`design/visual-exploration/gwp-011/direction-a-clay-industrial/candidates/`，状态 `rejected-as-main-direction`。
- 方向 C 历史候选：`design/visual-exploration/gwp-011/direction-c-candy-machine/candidates/`，状态 `rejected-as-main-direction`。
- 方向 B 原始探索：`design/visual-exploration/gwp-011/direction-b-puffy-sticker/candidates/`，状态仍为 `candidate`；它们没有因用户选中方向而自动升级为批准资产。
- GWP-012 的中间拒绝原因和禁止导入说明位于 `design/visual-exploration/gwp-012/rejected/README.md`。
- 唯一批准根目录是 `design/approved/gwp-012-puffy-sticker/`。候选、拒绝和批准资产没有共用目录。

## 6. 生成追溯与处理记录

- 完整提示词、输入参考角色和迭代记录见 `design/visual-exploration/gwp-012/PROMPTS.md`。
- 生成器未暴露可记录的种子、固定输出尺寸或质量参数；因此不伪造种子。所有批准文件以仓库内路径和 SHA-256 追溯。
- 三张 360×800 预览由 macOS `sips -z 800 360` 从批准源图机械缩放；没有重绘、补边或信箱留白。
- 四张首轮“棋盘格透明”输出经文件检查发现无 alpha，已通过背景提取迭代替换；只有修正后的 RGBA 文件进入批准目录。
- RESULT 首稿因锤柄贴近裁切边界且方块含未批准图标语义而拒绝；批准稿仅保留纯色方块并将完整锤体移入安全区。

### SHA-256

| ID | SHA-256 |
|---|---|
| `BG-WORKSHOP-01-VISUAL` | `6bf39e42af12d13f6a3cab601cf2385aee25a10a7b6a8ada13514c00f9d89bcc` |
| `DEC-FX-MOTIF-KIT-01` | `5f3587e05ef3ba0ecce5cee68a62b3f8991cb3749e8e03a9314e18ca847c1109` |
| `ITM-BASELINE-TRIO-01` | `e03abb9153145bed60eb63ddce16d376539d36cddc3d5f5c652e70408d54afb3` |
| `MCH-CONVEYOR-01-VISUAL` | `8d81ca4fe8120812d71e6b0a7c970ad1e0e9fa46aced0eb934e3d2c799da44c4` |
| `MCH-PRESS-BASE-VISUAL` | `32efbdcf253330f7eff14bf3bf981ad9ac320fe844bab0532d6e288433709ab4` |
| `SCR-GAME-BASE-01` | `7a448fa7a10ffa3169f22fd826f6aa21c8967032c443c125e5b1e753527e6f7a` |
| `SCR-HOME-BASE-01` | `be4a68578f1445582a42a7ab8620a142a33e160fb5600f5d19ffa017db23d3ee` |
| `SCR-RESULT-BASE-01` | `9b69fbd925604e5c9ecce2ec2f07e03722fe628db71ab3f3acd9b0d0199e36b9` |
| `TEX-PANEL-UI-KIT-01` | `a089534d4057431dbbac79b047e1f0715f01f079412c8a1fd5e63637bd57e01e` |

预览哈希不作为设计源身份；它们可从对应批准整屏重新生成。

## 7. QA 结论与后续边界

- 三张整屏和六类资产锚点已通过尺寸、方向、光向、色彩、轮廓、文字/品牌/水印和透明通道检查，详情见 `design/visual-exploration/gwp-012/QA.md`。
- 当前机器、传送带、物品拼板、面板拼板和母题拼板足以启动 Figma Foundations、首批组件质感与核心构图验证。
- 它们不是 Cocos 可直接入库的最终分层素材；GWP-026 设计冻结前也不得导入 Cocos `assets/`。
- 生成位图中的空白面板不是最终交互组件。正式组件必须在 Figma 中完成变量、状态、Auto Layout、触控热区和响应式验证。
