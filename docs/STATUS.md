# 项目状态

最后更新：2026-09-01
维护者：当前任务执行窗口
目标版本：完整 v1.0

## 当前阶段

**D3：Figma组件系统**

项目已纠正为设计先行顺序。正式路线为：完整界面规格 → gpt-image-2视觉基准 → Figma设计系统 → 24类界面、状态、适配、原型和审计 → Figma设计冻结 → Cocos工程与玩法。

## 下一动作

**认领并执行 `GWP-017`：Figma游戏HUD与结算组件。**

在`GWP_给我压扁/02_Components/Gameplay`内逐个建立GameplayHUD、PressureMeter、ComboBadge、PressResult、TutorialCoachmark、ItemQueue/LevelProgress、TowerSummary、StarResult/ScoreSummary、SharePreview与PausePanel。必须复用GWP-014 Foundations、GWP-015基础组件和GWP-016内容组件。全部Figma操作只使用`figma-mcp-rust`与仓库内唯一命名companion plugin；不得调用官方Figma MCP，不得创建正式屏幕或修改Cocos工程。

## 活跃任务

- 当前无活跃任务；`GWP-017`已解锁，等待下一窗口认领。

## READY

- `GWP-017`：Figma游戏HUD与结算组件

## 设计任务依赖链

```text
GWP-010 UI体验规格
→ GWP-011 三套gpt-image-2视觉方向
→ GWP-012 用户选择并固化视觉基准
→ GWP-013 Figma发现、范围锁定、Section与状态台账
→ GWP-014 Figma变量、样式和Foundations
→ GWP-015 基础交互组件
→ GWP-016 导航与内容组件
→ GWP-017 游戏HUD与结算组件
→ GWP-018 用户流程与线框原型
→ GWP-019 首次体验与主流程高保真界面
→ GWP-020 长期内容与模式高保真界面
→ GWP-021 系统、分享、广告与异常状态界面
→ GWP-022 三尺寸响应式适配
→ GWP-023 可点击原型与动效规格
→ GWP-024 设计系统与可访问性审计
→ GWP-025 全量逐屏视觉QA
→ GWP-026 用户评审、设计冻结与Dev Handoff
```

`GWP-010`至`GWP-016`已`DONE`，`GWP-017`当前为`READY`；`GWP-018`至`GWP-026`保持`BLOCKED`，按上述顺序逐一解锁。所有Figma写任务`parallel_safe: false`，禁止并行修改设计文件。从GWP-015起采用单一执行窗口闭环：同一窗口完成实现、真实验收、修复、主线集成、标记DONE和后续解锁，不再另开审阅集成对话。

## Cocos硬门禁

- `GWP-030`至`GWP-037`全部依赖设计冻结链，其中`GWP-030`直接依赖`GWP-026`。
- `GWP-026`未`DONE`前，不得初始化、实现或合入正式Cocos工程、灰盒、玩法、场景、HUD或导航。
- 独立分支`codex/gwp-001-cocos-init`包含提前完成的初始化实验，保持隔离且不得合入`main`。设计冻结后由`GWP-030`审查是否复用。

## 已取消的旧任务

- `GWP-001`至`GWP-008`：旧的工程优先链，已标记`CANCELLED`并由`GWP-030`至`GWP-037`取代。

## 已完成

- `GWP-000`：规划与协作基线已合入`main`。
- `GWP-009`：设计先行路线修正已合入`main`，旧工程优先链已取消。
- `GWP-010`：完整UI体验规格已合入`main`；24类屏幕、状态矩阵、8条流程、正式中文文案、组件和资产需求已锁定。
- `GWP-011`：A“软陶工业玩具”、B“充气贴纸工坊”、C“糖果机械模型”三套完整视觉方向已合入`main`；用户已选择B作为后续固化输入。
- `GWP-012`：B“充气贴纸工坊”已固化为唯一正式视觉方向；三张竖屏基准、机器/传送带/背景/物品/面板/装饰批准资产、视觉规范和资产台账已验收并合入`main`。
- `GWP-013`：Figma文件、共享Page和编辑边界已发现；唯一项目Section `337:139`、gap analysis、80个变量/70个组件v1范围与可恢复状态台账已验收并合入`main`。
- `GWP-014`：Figma Foundations已通过真实文件复验；7个集合、80个变量、明确scope与WEB code syntax、9个semantic alias、7个文字样式、5个效果样式、1个移动网格、10个一级Frame及7个Foundations说明区域已验收并合入`main`。
- `GWP-015`：Figma基础交互组件已验收；7个Component Set、102个受控Variant、8个内部图标原子、选择性TEXT/BOOLEAN/INSTANCE_SWAP属性、语义状态预设、变量绑定与7张独立截图已冻结并合入`main`。
- `GWP-016`：先以ChatGPT内置gpt-image-2生成组件视觉板，再在Figma中原生重建导航与内容组件；11个Component Set、63个受控Variant、Image-2参考节点、长中文/0值/最大值/空态覆盖及11张独立截图已验收。
- 完整v1.0范围：5个主题、75关、至少50件物品、4种模式。
- 永久排除排行榜、公会、家园、剧情和多人对战。
- Figma唯一设计入口与共享Page编辑边界已记录。
- 设计先行硬门禁、26前置任务与后续Cocos替代任务已经建立。

## 当前已知风险

- GWP-012批准的机器、传送带、物品、面板和母题是Figma重建用视觉锚点，不是可直接导入Cocos的生产资产。
- `figma-mcp-rust 0.2.0`原始companion plugin缺少variable scope、code syntax、alias与完整读回能力；GWP-014已用仓库内唯一命名扩展解决并实测。后续窗口必须运行`docs/figma/tooling/figma-mcp-rust-gwp014/manifest.json`，不能误启未扩展插件。
- 当前工具路径不能把TextStyle字段绑定变量，COLUMNS grid忽略自定义辅助线颜色；opacity variable binding已由GWP-015在组件上完成绑定与视觉复验。
- 后续Figma任务禁止调用官方Figma MCP；v1不依赖远程design library，复用检查以`figma-mcp-rust`读取到的本地变量、样式和组件为准。
- 后续Figma设计必须延续B方向的白色贴纸衬边、深墨蓝外框、光向与材质差异，避免把纸箱、橡皮鸭、纸杯和所有UI都处理成同一种气垫质感。
- GWP-010已锁定的屏幕结构仍是Figma阶段的信息架构唯一来源；GWP-012视觉基准只能定义视觉语言，不能改写流程和内容层级。
- 旧Cocos初始化分支已提前产生，但不会影响设计先行主线，前提是保持不合入。

## 当前主线状态

- 集成分支：`main`
- 已集成修正规划分支：`codex/ui-first-planning-fix`
- 已集成UI规格分支：`codex/gwp-010-ui-spec`（提交`4124415`，审阅修正`0866e57`）
- 已集成视觉探索分支：`codex/gwp-011-visual-directions`（提交`e536424`）
- 已集成视觉基准分支：`codex/gwp-012-visual-baseline`（提交`210c83d`）
- 已集成Figma发现分支：`codex/gwp-013-figma-discovery`（提交`f0bacfb`）
- 已集成Figma Foundations分支：`codex/gwp-014-figma-foundations`（提交`25f016a`、`e281715`、`83ba12c`）
- 已集成Figma基础组件分支：`codex/gwp-015-base-components`
- 已集成Figma导航与内容组件分支：`codex/gwp-016-content-components`
- Cocos：主线未初始化，符合当前硬门禁
- Figma：项目Section `GWP_给我压扁`（`337:139`）已完成Foundations、基础交互组件及导航与内容组件；正式屏幕尚未开始
- 下一执行任务：`GWP-017`
