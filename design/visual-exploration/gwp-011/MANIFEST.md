# GWP-011 candidate manifest

生成模式：Codex 内置 `image_gen`
生成日期：2026-08-27
批准状态：全部为 `candidate`；本任务没有 `approved` 目录

## 方向 A：soft-clay industrial toy

| ID | 文件 | 像素 | 状态 |
|---|---|---:|---|
| DIR-A-HOME | `direction-a-clay-industrial/candidates/dir-a-home-v01.png` | 841×1870 | candidate |
| DIR-A-GAME | `direction-a-clay-industrial/candidates/dir-a-game-v01.png` | 841×1870 | candidate |
| DIR-A-RESULT | `direction-a-clay-industrial/candidates/dir-a-result-v01.png` | 841×1870 | candidate |
| DIR-A-SHEET | `direction-a-clay-industrial/candidates/dir-a-sheet-v01.png` | 1536×1024 | candidate |
| DIR-A-HOME-PREVIEW | `direction-a-clay-industrial/previews/dir-a-home-360x800.png` | 360×800 | preview |
| DIR-A-GAME-PREVIEW | `direction-a-clay-industrial/previews/dir-a-game-360x800.png` | 360×800 | preview |
| DIR-A-RESULT-PREVIEW | `direction-a-clay-industrial/previews/dir-a-result-360x800.png` | 360×800 | preview |

## 方向 B：puffy sticker workshop

| ID | 文件 | 像素 | 状态 |
|---|---|---:|---|
| DIR-B-HOME | `direction-b-puffy-sticker/candidates/dir-b-home-v01.png` | 853×1844 | candidate |
| DIR-B-GAME | `direction-b-puffy-sticker/candidates/dir-b-game-v01.png` | 841×1870 | candidate |
| DIR-B-RESULT | `direction-b-puffy-sticker/candidates/dir-b-result-v01.png` | 941×1672 | candidate |
| DIR-B-SHEET | `direction-b-puffy-sticker/candidates/dir-b-sheet-v01.png` | 1536×1024 | candidate |
| DIR-B-HOME-PREVIEW | `direction-b-puffy-sticker/previews/dir-b-home-360x800.png` | 360×800 | preview |
| DIR-B-GAME-PREVIEW | `direction-b-puffy-sticker/previews/dir-b-game-360x800.png` | 360×800 | preview |
| DIR-B-RESULT-PREVIEW | `direction-b-puffy-sticker/previews/dir-b-result-360x800.png` | 360×800 | preview,等比缩放+奶油色留白 |

## 方向 C：candy machine model

| ID | 文件 | 像素 | 状态 |
|---|---|---:|---|
| DIR-C-HOME | `direction-c-candy-machine/candidates/dir-c-home-v01.png` | 841×1870 | candidate |
| DIR-C-GAME | `direction-c-candy-machine/candidates/dir-c-game-v01.png` | 841×1870 | candidate |
| DIR-C-RESULT | `direction-c-candy-machine/candidates/dir-c-result-v01.png` | 841×1870 | candidate, 收敛粒子后的第二轮结果 |
| DIR-C-SHEET | `direction-c-candy-machine/candidates/dir-c-sheet-v01.png` | 1536×1024 | candidate |
| DIR-C-HOME-PREVIEW | `direction-c-candy-machine/previews/dir-c-home-360x800.png` | 360×800 | preview |
| DIR-C-GAME-PREVIEW | `direction-c-candy-machine/previews/dir-c-game-360x800.png` | 360×800 | preview |
| DIR-C-RESULT-PREVIEW | `direction-c-candy-machine/previews/dir-c-result-360x800.png` | 360×800 | preview |

## 输出说明

- 内置生成工具不暴露目标文件路径和精确尺寸参数；原始候选保留工具实际输出像素，不做拉伸或内容重绘。
- 三套横向视觉语言板均为 1536×1024。
- 设备可读性验收使用单独导出的精确 360×800 预览；除 B 的结果图使用等比缩放和奶油色留白外，其余预览均按目标画板缩放。
- 项目只引用工作区内文件，不依赖 `$CODEX_HOME/generated_images` 的默认副本。
