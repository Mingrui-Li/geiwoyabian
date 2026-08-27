# GWP-011 ImageGen prompt set

生成模式：Codex 内置 `image_gen`（`stylized-concept`）
生成日期：2026-08-27
用途：视觉方向探索候选，不是批准资产

## 1. 三套提示词的共同部分

```text
Use case: stylized-concept
Asset type: game visual-direction exploration
Primary request: create a visual direction for a vertical casual stress-relief mobile game about crushing everyday annoyances with a hydraulic press.
Locked subjects: one compact hydraulic press, one conveyor, a plain cardboard shipping box, a yellow rubber duck, and an unbranded paper drink cup.
View and light: slight 3/4 front top-down view where applicable; key light from upper right.
Color palette: industrial yellow #FFC83D, pressure red #FF5D55, deep ink blue #243145, mint #63D7B0, cream #FFF4DE.
Mobile constraints: preserve the top HUD safe area, central machine/object stage, and lower-middle long-press interaction zone; keep objects readable at 360×800.
Text constraints: no words, letters, numbers, pseudo-text, logos, brands, watermark, protected characters, real app icons, or people. UI-material samples must remain blank.
Architecture invariant: do not change the GWP-010 information architecture; visuals are inputs for later Figma composition.
```

## 2. 方向风格块

### A — soft-clay industrial toy

```text
Style/medium: polished 2.5D soft-clay toy render; matte handmade surfaces; fine low-contrast grain; slightly imperfect tactile edges; thick clean deep-ink-blue outlines; rounded industrial construction; humorous but not childish.
Lighting/mood: warm, cheerful, soft contact shadows.
Avoid: photorealism, gritty metal, dark factory, glossy candy resin, flat sticker backing, thin black outlines, clutter.
```

### B — puffy sticker workshop

```text
Style/medium: polished 2.5D puffy vinyl sticker render; inflated rounded volumes; subtle soft seams; crisp white sticker backing plus deep-ink-blue die-cut border; clean offset shadows; large confident color blocks; playful and modern but not babyish.
Lighting/mood: bright energetic mood, shallow controlled shadows.
Avoid: clay fingerprints, gritty metal, photorealism, hard candy resin, dark factory, thin outlines, clutter.
```

### C — candy machine model

```text
Style/medium: polished 2.5D premium miniature game render; lacquered metal; semi-translucent jelly resin; polished acrylic; soft cream polymer; controlled highlights and refraction; rounded deep-ink-blue structural frames; charming but not edible-looking.
Lighting/mood: bright optimistic miniature laboratory, clean contact shadows.
Avoid: clay fingerprints, sewn vinyl, flat sticker backing, realistic candy or food packaging, chrome sci-fi, dark lab, clutter.
```

## 3. 四张构图块

以下四个构图块分别与 A、B、C 风格块组合，形成最终 12 张候选图的提示词。

### HOME

```text
Asset type: vertical mobile game main-entrance key visual.
Scene: a bright desktop workshop expressed in the selected direction.
Composition: portrait mobile layout equivalent to 360×800; compact press partly visible as anchor; conveyor, compressed blocks and three supporting objects; one large blank continue-level panel in the lower-middle; four blank navigation slots at the bottom; quiet top safe area; generous room for later Figma typography and icons.
```

### GAME

```text
Asset type: vertical hydraulic-press gameplay-stage key visual.
Scene: a simplified workshop expressed in the selected direction.
Composition: portrait mobile layout equivalent to 360×800; complete press and conveyor; cardboard box centered beneath the raised press head; duck and cup waiting on the conveyor edge; quiet top safe strip; central press/object relationship unobstructed; large lower-middle long-press interaction zone; no UI panel over the object.
```

### RESULT

```text
Asset type: vertical tower-smash and level-result key visual.
Scene: a dedicated tower platform inside the selected workshop.
Composition: portrait mobile layout equivalent to 360×800; eight to ten compressed rounded blocks, partly neat and humorously leaning; chunky side impact hammer; clear topple direction; controlled pressure rings and chunky particles; wide blank result panel low on screen; quiet top space for later title and stars.
Safety: no violent destruction, no sharp debris, no dense particle clutter.
```

方向 C 的最终 RESULT 追加：

```text
The tower bends and topples rather than shattering. Show only a few large rounded jelly cubes, two broad transparent pressure rings, two soft polymer dust puffs, and six to ten chunky golden rounded-square particles. No shards, splinters, glitter cloud, tiny debris, or sharp pieces.
```

### SHEET

```text
Asset type: landscape 3:2 visual-language board.
Scene: an organized unlabeled studio board expressed in the selected direction.
Composition: one compact press, one conveyor, separate cardboard box / duck / cup; one large blank panel, primary and secondary blank buttons, one badge, one horizontal progress track, four blank navigation tiles, three compressed blocks, pressure-wave and reward-particle motifs, and five unlabeled palette swatches; all samples fully visible and separated with generous negative space.
```

## 4. 迭代记录

- A 与 B 的四张图均首轮满足构图和文字约束，直接进入候选目录。
- C 的 HOME、GAME、SHEET 首轮满足要求。
- C 的 RESULT 首轮出现过多细碎粒子，未复制进项目。第二轮只收敛粒子数量和形态，保留构图、材质、光向和色板；最终候选为 `direction-c-candy-machine/candidates/dir-c-result-v01.png`。
