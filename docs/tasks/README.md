# 任务卡目录

任务卡是单个开发窗口的工作合同。一个任务应能在一个对话中完成，范围过大时必须先拆分。

## 快速查询

```bash
rg -n '^status: READY$' docs/tasks/GWP-*.md
rg -n '^status: IN_PROGRESS$' docs/tasks/GWP-*.md
rg -n '^status: REVIEW$' docs/tasks/GWP-*.md
rg -n '^status: BLOCKED$' docs/tasks/GWP-*.md
```

## 编号

- `GWP-000`：仓库与流程基线。
- `GWP-001`–`099`：P0/P1工程与核心手感。
- `GWP-100`–`199`：P2视觉方向与Figma设计系统。
- `GWP-200`–`299`：P3垂直切片。
- `GWP-300`–`399`：P4完整系统和全流程UI。
- `GWP-400`–`499`：P5完整内容生产。
- `GWP-500`–`599`：P6留存、分享和商业化。
- `GWP-600`–`699`：P7性能、审核和发布。

## 状态更新规则

任务窗口可以执行：

- `READY → IN_PROGRESS`
- `IN_PROGRESS → REVIEW`
- `IN_PROGRESS → BLOCKED`，但必须写明阻塞证据和下一步

只有集成窗口可以执行：

- `BLOCKED → READY`
- `REVIEW → DONE`
- 依赖变化与任务取消

## 任务卡质量要求

每张卡必须包含：

- 单一、可验证的目标。
- 前置依赖。
- 明确的编辑范围与禁止范围。
- 可观察的交付物。
- 可以执行的验收方式。
- 完成后的交接位置。

复制 `TASK_TEMPLATE.md` 创建新卡。不要复用已有编号，也不要删除完成卡。
