# 《给我压扁！》组件与变体清单

版本：1.0-draft
目标：为后续 Figma 变量、组件和屏幕组装提供锁定清单。所有交互组件使用 Auto Layout；颜色、间距、圆角、字体、描边、阴影和动效均绑定设计变量。

## 1. 全局组件规则

- 触控热区最小 44×44 逻辑设计单位；主按钮高度 52，次按钮与列表动作高度不低于 48，图标按钮视觉尺寸 24–28 但外层 44×44。
- 状态命名统一为 `Default / Pressed / Disabled / Selected / Loading / Error`，适用时追加 `Locked / Completed / Badge`。
- 尺寸变体只允许 `S / M / L`；不得以复制组件后改尺寸代替变体。
- 360×800 为主尺寸；组件宽度默认 `Fill container`，内容区水平边距 16，393 宽时最大内容宽 361。
- 组件组合超过 30 个时拆成子组件，避免状态与尺寸笛卡尔积。
- 游戏 HUD 组件使用安全区容器，不得与中央舞台、压头运动路径和中下部长按区域争抢空间。

## 2. 原子组件

| ID | 组件 | 主要属性/变体 | 状态 | 使用屏幕 |
|---|---|---|---|---|
| A-Button | 文本按钮 | `Role=Primary/Secondary/Danger/Cancel/Rewarded/Share`；`Size=M/L`；前/后图标可选 | Default, Pressed, Disabled, Loading | S01、S04–S08、S10、S12–S24 |
| A-IconButton | 图标按钮 | `Role=Neutral/Back/Close/Pause/Settings/Sound`；`Size=44/52` | Default, Pressed, Disabled, Badge | S02、S05–S11、S14、S19–S22 |
| A-Switch | 开关 | 标签、说明、系统受限标记 | Off, On, Pressed, Disabled, Error | S10、S16、S21、S22 |
| A-Slider | 滑杆 | `Role=Volume/Preview/Charge`；数值标签可选 | Default, Pressed, Disabled | S21、S22 |
| A-SegmentedControl | 分页选择 | 2/3 项；文字型 | Default, Selected, Pressed, Disabled | S15、S16、S19 |
| A-FilterChip | 筛选标签 | 文字、数量、清除图标 | Default, Selected, Pressed, Disabled | S14、S20 |
| A-Progress | 线性进度 | `Role=Loading/Theme/Achievement`；标签可选 | Default, Loading, Completed, Error | S01、S05、S07、S20 |
| A-StarRating | 星级 | 0–3 星；紧凑/结果尺寸 | Empty, Earned, New, Perfect | S04、S08、S12 |
| A-StatusBadge | 状态胶囊 | `Info/Success/Warning/Danger/Offline/New/Completed` | Default, Emphasized | S05、S13、S17、S20、S22 |
| A-LockBadge | 锁定胶囊 | 锁图标、条件短文案 | Locked, NearUnlock | S06–S08、S14–S16、S19 |
| A-MaterialBadge | 材质标签 | 脆性/弹性/爆浆/嵌套/不稳定 | Default, Discovered | S15 |
| A-NumberTicker | 数字滚动 | 分数/高度/连击 | Idle, Increasing, NewRecord | S11、S12、S18 |
| A-Spinner | 小型加载 | 16/24/32 | Active | 所有局部加载场景 |
| A-Divider | 分隔 | 水平/垂直 | Default | 列表与设置组件内部 |
| A-Scrim | 遮罩 | 普通/危险/暂停 | Hidden, Visible | S10、S13、S23、S24 |

## 3. 导航与内容组件

| ID | 组件 | 结构与变体 | 状态 | 使用屏幕 |
|---|---|---|---|---|
| C-SafeArea | 安全区容器 | Top/Bottom/Both；胶囊区偏移 | Default | 全部屏幕 |
| C-SurfacePanel | 通用面板 | `Plain/Raised/Inset`；标题槽、正文槽、动作槽可选 | Default, Loading, Disabled, Error | S05–S08、S12、S16–S22 |
| C-TopBar | 顶部栏 | `Home/Page/Game`；返回、标题、设置/成就/暂停槽 | Default, Scrolled, Offline | S05–S10、S14–S22 |
| C-ResourceCapsule | 顶部资源胶囊 | `Star/CollectionMaterial`；图标、数值、增量 | Default, Updating, New, Error | S05、S07、S12 |
| C-BottomNav | 四项底部导航 | 闯关/模式/图鉴/外观 | Default, Selected, Badge, Disabled | S05、S06、S14、S19 |
| C-LoadingPanel | 加载面板 | 插画、阶段、进度、说明、重试槽 | Loading, Slow, Error, Offline, Completed | S01 |
| C-JourneyHeroCard | 继续关卡主卡 | 主题、关卡名、进度、主动作 | Default, Loading, Locked, Completed, Error | S05 |
| C-ThemeProgress | 主题进度条 | 名称、关卡数、星数 | Default, Completed | S05 |
| C-DailyTeaser | 今日订单提醒卡 | 日期、完成度、规则短句 | New, InProgress, Completed, DateChanged | S05 |
| C-ModeCard | 模式卡 | 插画、标题、规则、记录、动作 | Default, Pressed, Locked, Completed, Loading, Error | S06 |
| C-ThemeCard | 主题大卡 | 背景、代表物品、进度、奖励 | Default, Selected, Locked, Completed, Loading, Error | S07 |
| C-LevelCard | 关卡卡 | 关号、星级、状态 | Default, Selected, Locked, Completed, Perfect, Loading | S08 |
| C-LevelDetailBar | 关卡详情条 | 名称、件数、最佳分、动作 | Default, Locked, Loading, Error | S08 |
| C-NavPreview | 导航解锁预览 | 四项入口、逐项高亮 | Hidden, Revealing, Completed | S04 |
| C-CollectionGrid | 图鉴网格 | 3 列/320 宽 2 列；增量加载 | Default, Loading, Empty, Error | S14 |
| C-CollectionCell | 图鉴格 | 缩略图、名称、三结果点 | Unknown, Discovered, Partial, Completed, Loading, Error | S14 |
| C-ItemDetailCard | 物品详情卡 | 大图、名称、材质、记录 | Default, Loading, Error | S15 |
| C-ResultVariantCard | 三结果卡 | 插画、结果名、发现提示、最佳记录 | Locked, Discovered, Selected, Completed | S15 |
| C-ItemPicker | 物品选择器 | 搜索不提供；主题筛选+网格 | Default, Loading, Empty, Error | S16 |
| C-SelectedQueue | 已选队列 | 1–10 件、拖动排序、移除 | Empty, Default, Full, Error | S16 |
| C-DailyOrderCard | 今日订单主卡 | 日期、进度、规则、成绩 | Default, Loading, Locked, Completed, DateChanged, Error | S17 |
| C-RuleModifier | 规则变化条 | 图标、标题、一句说明 | Default, Warning | S17 |
| C-ItemPreviewStrip | 物品预览条 | 12 件缩略图、完成勾选 | Default, InProgress, Completed, Loading | S17 |
| C-EndlessSummary | 连续压摘要 | 最佳/本次、件数、主动作 | Ready, NoRecord, Result, NewRecord, Error | S18 |
| C-SpeedStages | 速度阶段 | 0/5/10/15+ 件 | Default, Current, Completed | S18 |
| C-SkinPreviewStage | 外观预览舞台 | 机器+背景插槽 | Default, Loading, Error, ReducedMotion | S19 |
| C-SkinCard | 外观卡 | 缩略图、名称、条件 | Default, Selected, Applied, Locked, Loading, Error | S19 |
| C-AchievementRow | 成就行 | 图标、名称、说明、进度、奖励 | Hidden, InProgress, Completed, Claimed, Error | S20 |
| C-SettingsSection | 设置分组 | 标题、设置行、危险动作 | Default, Disabled, Error | S21 |
| C-SelectRow | 设置选择行 | 标签、当前值、进入箭头 | Default, Pressed, Disabled | S21 |
| C-VideoPreview | 视频预览 | 画面、播放、进度、静音 | Generating, Ready, Playing, Paused, Error, Empty | S22 |
| C-CoverPicker | 封面选择 | 3 张候选 | Default, Selected, Loading, Error | S22 |
| C-ShareStatus | 分享状态 | 平台状态、说明、动作槽 | Ready, Publishing, Success, Cancelled, Error, Offline, Unknown | S22 |

## 4. 游戏专用组件

| ID | 组件 | 结构与变体 | 状态 | 使用屏幕 |
|---|---|---|---|---|
| G-PressHUD | 按压 HUD 容器 | `Tutorial/Level/Free/Daily/Endless`；顶部安全区、压力条槽、进度槽 | Ready, LoadingItem, Pressing, Resolving, Paused, Error | S02、S09、S16–S18 的游戏态 |
| G-PressureBar | 压力条 | 理想区、当前压力、破裂阈值；`AlwaysOn/Fade/Hidden` | Idle, Rising, Ideal, Danger, Locked | S02、S09 |
| G-ItemProgress | 物品进度 | `当前/总数` 或无限模式件数 | Default, Advancing, Completed | S02、S09、S17、S18 |
| G-ComboBadge | 连击徽章 | ×N；3/6/10 高潮 | Hidden, Default, Milestone3, Milestone6, Milestone10, Broken | S09、S18 |
| G-ResultLabel | 单件结果标签 | 完美/合格/欠压/过压 | Enter, Hold, Exit | S02、S09 |
| G-TowerHUD | 高塔 HUD 容器 | `Tutorial/Level/Daily/Endless` | Ready, Charging, Smashing, Settled, Error | S03、S11 |
| G-ChargeRing | 蓄力环 | 0–100%、理想释放窗 | Idle, Charging, Full, Released, ReducedMotion | S03、S11 |
| G-TowerStack | 高塔堆叠容器 | 方块槽、事故标记、受限倒塌 | Building, Ready, Falling, Settled, Fallback | S03、S11 |
| G-ScoreTicker | 倒塔分数 | 分数、高度、倍率 | Idle, Counting, NewRecord, Completed | S11 |
| G-LevelResultPanel | 关卡结果面板 | 星级、分数、统计、按钮槽 | Default, Saving, Saved, SaveError, ThemeComplete | S12 |
| C-ResultBreakdown | 结果分布 | 完美/合格/小意外 | Default, Animated, Completed | S12 |

## 5. 模态、反馈与系统状态组件

| ID | 组件 | 结构与变体 | 状态 | 使用屏幕 |
|---|---|---|---|---|
| C-PauseModal | 暂停弹窗 | 继续、快捷设置、重开、退出 | Default, Returning, SaveError | S10 |
| C-RewardModal | 奖励弹窗 | `FeatureUnlock/Unlock/Achievement`；单奖励/多奖励 | Revealing, Ready, Applied, Error | S04、S13、S20 |
| C-RewardCard | 奖励卡 | 物品/模式/外观/主题/材料 | Locked, Revealing, Granted, Claimed | S13、S23 |
| C-AdRewardModal | 激励广告弹窗 | `Confirm/Playing/Skipped/Granted/Unavailable` | 对应 Variant | S23 |
| C-ConfirmModal | 通用确认 | 普通/危险；标题、正文、双按钮 | Default, Loading, Error | S10、S18、S19、S21、S24 |
| C-ErrorModal | 错误弹窗 | 资源/保存/平台；重试+安全返回 | Default, Retrying, Persistent | S24 |
| C-OfflineModal | 断网弹窗 | 本地替代动作/重连 | Cached, NoCache, Retrying | S24 |
| C-RecoveryModal | 恢复弹窗 | 本局/存档；时间和影响 | Available, Restoring, Conflict, Error | S24 |
| C-Toast | 轻提示 | 保存/获得/离线/错误 | Info, Success, Warning, Error | 全局 |
| C-RewardToast | 小奖励提示 | 图鉴/成就/材料 | Enter, Hold, Exit | S09、S12、S20 |
| C-EmptyState | 空状态 | 插画、标题、说明、动作 | Collection, Achievement, Video, Generic | S05、S14、S17–S20、S22 |

## 6. 组件到资产槽位

| 组件 | 必需资产槽 | 禁止做法 |
|---|---|---|
| C-LoadingPanel | `ILL-BOOT-01`、`DEC-BRAND-01` | 将进度文字画进插画 |
| C-ModeCard | `ILL-MODE-01..03` | 每张卡使用不同渲染风格 |
| C-ThemeCard | `BG-WORKSHOP-01..05`、`DEC-THEME-*` | 用背景图承载标题和星数 |
| C-CollectionCell | `ITM-THUMB-*` | 在缩略图内写物品名 |
| C-ItemDetailCard | `ITM-DETAIL-*` | 把材质提示做成图片 |
| C-ResultVariantCard | `ITM-RESULT-*` | 将锁定提示烘焙进图 |
| C-SkinPreviewStage/C-SkinCard | `SKN-MACHINE-*`、`BG-WORKSHOP-*` | 预览角度和正式游戏角度不一致 |
| G-PressHUD/G-TowerHUD | `MCH-*`、`FX-*`、`ITM-*` | 用 HUD 面板长期遮挡舞台中心 |
| C-RewardModal/C-EmptyState | `ILL-UNLOCK-*`、`ILL-EMPTY-*` | 生成带中文按钮的整屏图 |
| C-VideoPreview | `VID-HIGHLIGHT`、`ILL-SHARE-CARD` | 在视频背景内嵌动态分数文字 |

## 7. 组件覆盖验收

- 24 类屏幕中的每个持久 UI 元素必须引用本清单中的组件；纯视觉舞台对象必须引用资产清单。
- 后续发现新增交互需求时，先更新本清单并评估是否复用现有组件，不能直接在屏幕里画局部按钮。
- Figma 组件创建顺序固定为：原子 → 导航/内容 → 游戏专用 → 模态/状态；变量和样式必须先完成。
- 所有组件须在 360、375、393 三种宽度下验证；游戏 HUD 额外检查中心舞台与长按热区遮挡。
