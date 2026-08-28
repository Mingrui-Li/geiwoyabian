# GWP-012 rejected inputs and iterations

本目录只记录拒绝边界，不包含任何批准资产。后续 Figma 窗口不得从这里或 GWP-011 候选目录导入正式设计。

## 未入选主方向

- A“软陶工业玩具”：历史文件仍位于 `design/visual-exploration/gwp-011/direction-a-clay-industrial/candidates/`。用户未选择；主要风险是手作颗粒与边缘不完美的跨批次漂移和缩小脏污。
- C“糖果机械模型”：历史文件仍位于 `design/visual-exploration/gwp-011/direction-c-candy-machine/candidates/`。用户未选择；主要风险是透明、折射、高光、视频压缩和图层排序成本。

两套方向的整套材质、轮廓与光影语言均禁止混入 B。若未来要吸收局部特征，必须由用户重新明确指定。

## 未自动升级的 B 候选

`design/visual-exploration/gwp-011/direction-b-puffy-sticker/candidates/` 仍是 `candidate`：

- HOME 与 GAME 的机器软硬程度、缝线密度存在漂移。
- RESULT 原图比例偏宽，360×800 比较预览依赖等比留白。
- 视觉语言板把纸箱也做得过于像缝线气垫，不能作为五类材质差异的最终规则。

用户选择 B 只批准方向，不会把这些候选文件自动变成批准资产。

## GWP-012 拒绝迭代

- RESULT 第一轮：锤柄贴近右侧边界并被截断；塔块带星形、心形、棋盘格等未批准图标语义。第二轮移除语义图标、改为纯色块，并把完整锤体移入安全区。
- 液压机、传送带、面板套件和母题套件的首轮透明输出：图像视觉上出现棋盘格，但 PNG 文件没有 alpha。它们未复制进批准目录；只批准完成背景提取且通过 RGBA/四角透明检查的替代文件。

这些中间图保留在图像工具的生成历史中用于审计，没有复制进仓库，避免拒绝位图增加仓库体积或被误导入。完整迭代提示词与原因见 `design/visual-exploration/gwp-012/PROMPTS.md` 和 `design/visual-exploration/gwp-012/QA.md`。

## 唯一批准入口

后续设计只能从 `design/approved/gwp-012-puffy-sticker/` 和 `docs/design/ASSET_REGISTER.md` 中状态为 `approved-screen` 或 `approved-reference` 的条目取用。
