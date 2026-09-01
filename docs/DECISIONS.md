# 决策日志

只记录会影响多个任务、后续窗口很可能重新讨论或返工成本较高的决策。状态使用 `ACCEPTED`、`PROPOSED`、`SUPERSEDED`。

## D-001：完整产品而非MVP

- 日期：2026-08-26
- 状态：ACCEPTED
- 决策：原型与垂直切片只是验证阶段，最终目标是内容和UI完整、可正式运营的v1.0。
- 影响：任何任务不得以“先做MVP”为由取消正式UI、完整内容或打磨阶段。

## D-002：永久排除重型外围系统

- 日期：2026-08-26
- 状态：ACCEPTED
- 决策：不开发排行榜、公会、家园、剧情和多人对战。
- 影响：留存依靠玩法变化、图鉴、模式、外观、每日订单和内容更新。

## D-003：正式视觉生产链

- 日期：2026-08-26
- 状态：ACCEPTED
- 决策：正式视觉固定使用 gpt-image-2 生成素材，Figma MCP完成设计系统与界面，Cocos依据精确节点和截图1:1实现。
- 影响：灰盒可以先验证交互，但正式UI不得绕过Figma。

## D-004：技术栈

- 日期：2026-08-26
- 状态：ACCEPTED
- 决策：Cocos Creator 3.8.7+、TypeScript、竖屏2D。
- 影响：所有工程任务和平台适配按该栈设计。

## D-005：视觉假物理

- 日期：2026-08-26
- 状态：ACCEPTED
- 决策：优先使用精确形变曲线、Tween、遮罩、粒子、停顿、震屏和音效制造压扁感，不默认引入软体物理。
- 影响：只有测试证明真实物理带来显著收益时才重新评估。

## D-006：本地优先

- 日期：2026-08-26
- 状态：ACCEPTED
- 决策：完整v1.0不依赖玩法服务端；进度和个人最佳使用本地数据，今日订单由版本化规则与本机日期确定性生成，离线完整可玩。
- 影响：平台接口必须隔离，存档需要版本迁移与异常恢复；网络只限制广告、分享发布等平台能力，不能限制今日订单。

## D-007：多窗口滚动拆解

- 日期：2026-08-27
- 状态：SUPERSEDED（由D-018的跨对话大工作流替代）
- 决策：路线图保留长期方向，只细化当前与下一阶段；新窗口通过START_HERE、STATUS和独立任务卡继续工作。
- 影响：不依赖聊天上下文，不提前创建大量会过期的细任务。

## D-008：默认串行、有限并行

- 日期：2026-08-27
- 状态：SUPERSEDED（任务完成流程由D-016替代；串行与有限并行边界继续有效）
- 决策：OPC默认使用串行接力；只有任务明确标记 `parallel_safe: true` 且编辑范围不重叠时，才能用独立分支/工作树并行。
- 影响：只有集成窗口更新公共状态、合并分支和将任务置为DONE。

## D-009：Figma完整设计前置于所有Cocos工作

- 日期：2026-08-27
- 状态：SUPERSEDED（设计先行原则保留，具体门禁由D-018替代）
- 决策：先完成D0界面规格、gpt-image-2视觉基准、Figma设计系统、24类正式界面、全部状态、三尺寸适配、可点击原型和Dev Handoff；`GWP-026`设计冻结后才允许开始或合入Cocos工作。
- 影响：旧的`GWP-001`至`GWP-008`工程优先链被取消。已完成但未合入的Cocos初始化分支保留隔离，设计冻结后可作为新工程任务的参考，不能提前合入`main`。

## D-010：Figma 使用共享 Page 内的项目分区

- 日期：2026-08-27
- 状态：ACCEPTED
- 决策：正式设计使用指定的 [mini-game Figma 入口](https://www.figma.com/design/83pqrCcig644vC20QXM5G1/mini-game?node-id=11-7101)；受当前方案限制，不新建独立 Page，而是在共享 Page 内维护顶层 `GWP_给我压扁` Section。Figma工具链遵循D-014。
- 影响：所有 Figma 读写必须先定位该 Section、确认节点所有权，并保护同一 Page 上其他项目的节点；逻辑页面改用 Section 内一级 Frame 组织。

## D-011：锁定24类屏幕与四项主导航

- 日期：2026-08-27
- 状态：SUPERSEDED（四项主导航继续有效；24张独立画板要求由D-018取消）
- 决策：v1.0正式UI范围锁定为`SCREEN_SPEC.md`中的24类屏幕；常驻主导航固定为“闯关 / 模式 / 图鉴 / 外观”，设置与成就使用页面级入口，不新增商城、个人中心、排行榜或社交页。
- 影响：后续Figma信息架构、组件覆盖、可点击原型和Cocos导航必须使用相同屏幕编号与入口关系；新增独立屏幕必须先更新规格和决策日志。

## D-012：锁定首次三件教学与入口解锁顺序

- 日期：2026-08-27
- 状态：ACCEPTED
- 决策：首次体验依次使用震动闹钟、橡皮鸭和纸杯，完成三次按压与一次三层高塔粉碎后才展示完整导航；教学不可跳过，欠压或过压也继续流程且不制造传统失败。
- 影响：GWP-011视觉探索必须覆盖这三件物品与首次舞台；Figma首次流程、动效和文案必须保持该顺序，后续首个Cocos材质验证组合仍按独立任务规定执行。

## D-013：锁定克制的激励广告边界

- 日期：2026-08-27
- 状态：ACCEPTED
- 决策：激励广告只允许出现在关卡前神秘物品、结果页双倍图鉴材料、外观单局体验和分享特效包装四类可选奖励点；不在连续按压中弹出，不使用焦虑倒计时，不把基础关卡继续权或正式进度绑定广告。
- 影响：Figma的S23必须明确收益、取消、加载、跳过、不可用和只发一次的结果状态；Cocos平台适配需要保证广告失败、取消、断网或回执未知时不扣权益、不回滚本地进度。

## D-014：Figma工具链固定为figma-mcp-rust

- 日期：2026-08-28
- 状态：ACCEPTED
- 决策：后续所有Figma查询、创建、修改和删除统一使用已安装的`figma-mcp-rust`与本地插件桥接，禁止调用官方Figma MCP。v1不依赖远程design library。
- 影响：新窗口必须先确认`figma-mcp-rust`为LEADER且插件已连接；不能因官方MCP限额或远程搜索缺失降低验收标准。GWP-014已在仓库内提供并实测companion plugin扩展，解决0.2.0缺失的variable scope、code syntax、alias与读回能力；后续需要这些能力的任务必须运行`docs/figma/tooling/figma-mcp-rust-gwp014/`清单对应的唯一命名开发插件，不能退回未扩展版本。

## D-015：Figma Foundations v1 基线

- 日期：2026-08-31
- 状态：ACCEPTED
- 决策：v1 Foundations固定使用7个单mode集合与80个变量、`Noto Sans SC Regular/Bold`、7个Text Style、5个Effect Style和1个四列移动网格；所有变量必须有明确scope和`var(--gwp-...)` WEB syntax，Semantic Color只alias Primitive。`Getting Started`作为`00_Cover`内容，不新增一级Frame。
- 影响：GWP-015及后续Figma任务必须复用`docs/figma/FOUNDATIONS.md`与`docs/figma/STATE.json`中的精确ID，不复制token或另选字体/阴影。当前工具路径的TextStyle字段绑定、column-grid颜色和opacity binding导出限制必须保留为已知风险；尤其opacity用于组件前必须重新验证。该决定不改变产品范围。

## D-016：任务采用单一执行窗口闭环

- 日期：2026-08-31
- 状态：SUPERSEDED（无独立审阅原则保留；工作流改为可跨多个对话）
- 决策：从GWP-015开始取消“执行窗口完成后进入REVIEW、再由独立集成窗口审阅”的双窗口模式。认领任务的同一执行窗口负责实现、真实环境验收、修复、合并自己的任务分支、更新公共状态、标记DONE并解锁紧邻后续任务。
- 影响：任务生命周期改为`BLOCKED → READY → IN_PROGRESS → DONE`（失败时可回到`BLOCKED`）；不再创建单独审阅集成对话。验收标准不降低，执行窗口必须独立读取真实Figma/运行构建或测试，不能只采信自己的完成记录。`AGENTS.md`、`START_HERE.md`、`DEVELOPMENT_WORKFLOW.md`和任务模板已同步。

## D-017：Figma基础交互组件与语义预设基线

- 日期：2026-09-01
- 状态：ACCEPTED
- 决策：v1基础交互层固定为Button、IconButton、SegmentedControl、StatusPill、Progress、Toast/InlineMessage与Loading七个Component Set，共102个受控Variant，并以8个内部图标Component提供实例复用。TEXT、BOOLEAN和INSTANCE_SWAP只暴露可安全定制的节点；Danger、Loading、Error、Offline、Locked、Completed等状态保留语义文案和图标预设，不允许公共默认值覆盖。Disabled与Locked使用`surface`容器配合Foundation opacity token，保持状态弱化与文字可读同时成立。
- 影响：GWP-016及后续Figma任务必须优先组合这些精确组件ID，不复制近似Frame或重新建立基础状态矩阵。仓库伴生插件已扩展组件创建、属性连接、语义预设与审计能力，后续仍须运行`docs/figma/tooling/figma-mcp-rust-gwp014/`中的唯一命名开发插件。

## D-018：剩余开发压缩为UI与代码两个工作流

- 日期：2026-09-01
- 状态：ACCEPTED
- 决策：停止按组件、流程、屏幕、适配、原型、审计和交接拆任务。剩余工作只保留`GWP-017`完整Figma UI与`GWP-030`完整Cocos开发两个工作流；每个工作流可以跨多个对话持续推进。`GWP-018`至`GWP-026`并入GWP-017，`GWP-031`至`GWP-037`并入GWP-030。
- 影响：旧24类规格只作防遗漏参考，不要求24张独立画板；不再要求逐组件截图、逐节点metadata、重复SHA证明或单独Dev Handoff任务。Figma完整UI仍先于Cocos，用户确认GWP-017后直接进入GWP-030。产品完整v1.0范围和永久排除项不变。
