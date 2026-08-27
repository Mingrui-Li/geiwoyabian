# Repository working agreement

## Mandatory session startup

Every new window or conversation must:

1. Read this file completely.
2. Read `docs/START_HERE.md` and `docs/STATUS.md`.
3. Inspect `git status --short --branch` and recent commits.
4. Read the selected `docs/tasks/GWP-xxx.md` task card and all of its required references.
5. Start only when the task is `READY` and every dependency is `DONE`.
6. Claim the task by setting its card to `IN_PROGRESS` before implementation.

Do not infer the next task from chat history. Repository status and task cards control execution.

## Product source of truth

- Read `docs/PROJECT_PLAN.md` before changing gameplay behavior or scope.
- Read `docs/ROADMAP.md` before starting a milestone.
- Read `docs/UI_DESIGN_WORKFLOW.md` before designing or implementing player-facing UI.
- Update the relevant document when a product or technical decision changes.

## Multi-window ownership

- Serial handoff is the default for this OPC project.
- Parallel work is allowed only when every involved task card has `parallel_safe: true`, uses a separate branch/worktree, and has non-overlapping `edit_scope` entries.
- Only the integration window may update `docs/STATUS.md`, unlock dependencies, merge task branches, or move a task from `REVIEW` to `DONE`.
- Feature windows must not edit public coordination files unless their task explicitly includes them.
- Never work on a task already marked `IN_PROGRESS` by another window.
- Preserve all unrelated or user-owned changes. If an overlap cannot be avoided, stop and record the conflict in the task card.

## Engineering constraints

- Target Cocos Creator 3.8.7+ and TypeScript.
- Keep core gameplay independent from Douyin APIs. All platform calls belong behind a platform adapter.
- Prefer data-driven item variants over item-specific scripts.
- The game uses deterministic sprite deformation, masks, particles, tweening, and camera feedback. Do not introduce soft-body simulation without a measured need.
- The complete v1.0 is intentionally local-first and does not need a gameplay backend.
- Keep the first interactive package small; do not load later chapter art before it is needed.
- Figma is the source of truth for all final player-facing screens. Do not invent final UI directly in Cocos.
- gpt-image-2 outputs are visual inputs, not finished screen designs. Compose, align, tokenize, and validate them in Figma before implementation.
- Use exact Figma nodes plus screenshots when implementing UI, and perform a visual parity pass before considering a screen complete.

## Code conventions

- Use English identifiers and Chinese player-facing copy.
- Prefer small components with explicit state transitions over large scene controllers.
- Put tuning values in typed configuration rather than hardcoding them in components.
- Platform integrations, ads, recording, sharing, and analytics must be replaceable with no-op implementations for local development.

## Change discipline

- Do not edit `.idea/` or other user-local IDE files.
- Do not add progression, monetization, social, or content systems before the core feel milestone passes its acceptance test.
- Do not reduce the product target to a prototype or MVP. Milestones are validation stages on the way to the complete v1.0 scope in `docs/PROJECT_PLAN.md`.
- Do not add leaderboards, guilds, a home/base system, story, or multiplayer; these are permanent product exclusions.
- Verification should include a Cocos build check and a playable interaction check once the project is initialized.

## Mandatory task handoff

Before ending an implementation conversation:

- Run the task's verification steps and `git diff --check`.
- Fill in the task card's completion record with actual changes, files, verification, risks, and follow-ups.
- Move the task to `REVIEW`, not `DONE`.
- Record cross-cutting decisions in `docs/DECISIONS.md` and note which source documents need synchronization.
- Leave the worktree in a state another window can understand without reading the conversation.
