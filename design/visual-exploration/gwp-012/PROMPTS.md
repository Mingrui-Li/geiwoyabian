# GWP-012 ImageGen prompt set

生成模式：Codex 内置 `image_gen`
生成日期：2026-08-28
用途：将用户选定的 B“充气贴纸工坊”固化为批准视觉基准与 Figma 输入
种子：工具未暴露，不记录伪种子

## 1. 固定输入与约束

所有生成都沿用以下锁定条件：

- 方向：polished 2.5D puffy vinyl sticker；白色贴纸衬边、深墨蓝模切外框、浅偏移阴影、大色块、少量有结构意义的缝线。
- 色板：`#FFC83D`、`#FF5D55`、`#243145`、`#63D7B0`、`#FFF4DE` 与白色高光。
- 视角与光：轻微俯视的正面 3/4；主光从右上方照射。
- 禁止：文字、字母、数字、伪文字、Logo、品牌、水印、人物、真实 App 图标、受保护角色、写实暗色工厂、软陶指纹、透明糖果树脂、细黑描边和密集缝线。
- 候选基准：`design/visual-exploration/gwp-011/direction-b-puffy-sticker/candidates/dir-b-sheet-v01.png`。
- 构图参考按需使用 GWP-011 的 B HOME 或 RESULT 候选，但不继承候选的比例缺陷、文字槽含义或等比留白。

输入图在提示词中按角色标记：历史候选只提供风格/构图参考；新生成的批准锚点提供需要保持的形体、边框、光向和材质差异。

## 2. 资产锚点提示词

### P01-PRESS

```text
Use case: stylized-concept
Asset type: approved game machine visual anchor, isolated transparent PNG
Input images: Image 1 is the selected B "puffy sticker workshop" style reference only; do not edit or reproduce its board layout.
Primary request: create one compact hydraulic press for a vertical casual stress-relief mobile game.
Subject: a complete front-facing compact hydraulic press in a slight 3/4 front top-down view; industrial-yellow rounded frame, deep-ink-blue structural joints and base, cream metal piston, one pressure-red safety cap. Keep the press head, piston, frame, base, and warning cap visually separable through clean shapes.
Style/medium: polished 2.5D puffy vinyl sticker render; inflated rounded volumes with sparse purposeful seams; crisp white sticker backing around the whole silhouette plus a deep-ink-blue die-cut outer border; clean shallow offset shadow contained within the transparent canvas; large confident color blocks; playful and modern, not babyish.
Lighting/mood: key light from upper right, bright and controlled, consistent with Image 1.
Color palette: #FFC83D, #FF5D55, #243145, #63D7B0, #FFF4DE, white highlights only.
Composition/framing: single complete machine centered, generous transparent padding of at least 12%, no crop, no floor, no environment, no conveyor, no items.
Output intent: Figma visual-direction anchor and component illustration reference, not a full screen.
Constraints: genuinely transparent background with preserved alpha; no words, letters, numbers, pseudo-text, logos, brands, watermark, people, extra machines, sharp debris, gritty metal, clay fingerprints, photorealism, candy resin, dark factory, thin black outlines, or dense seam clutter.
```

### P02-CONVEYOR

```text
Use case: stylized-concept
Asset type: approved game conveyor visual anchor, isolated transparent PNG
Input images: Image 1 is the selected B visual-language board; Image 2 is the newly approved hydraulic-press style anchor. Both are style references only.
Primary request: create one compact horizontal conveyor belt that belongs to exactly the same workshop and production set as Image 2.
Subject: a complete short conveyor in a slight 3/4 front top-down view; deep-ink-blue segmented belt, mint rounded side rails, industrial-yellow front housing, three large deep-blue roller caps, four small rounded feet. Keep belt, rollers, front lip, rails, and legs visually separable by clean shapes.
Style/medium: polished 2.5D puffy vinyl sticker render; rounded inflated construction with sparse purposeful seams; crisp white sticker backing around the whole silhouette plus deep-ink-blue die-cut outer border; shallow clean offset shadow contained within the canvas; large confident color blocks.
Lighting/mood: upper-right key light and controlled highlights matching Image 2 exactly.
Color palette: #FFC83D, #FF5D55, #243145, #63D7B0, #FFF4DE, white highlights only.
Composition/framing: single complete conveyor centered, generous transparent padding of at least 12%, no crop, no floor, no environment, no machine, no objects.
Output intent: Figma visual anchor and stage illustration reference.
Constraints: genuinely transparent background with preserved alpha; no words, letters, numbers, pseudo-text, logos, brands, watermark, people, extra props, gritty metal, clay fingerprints, photorealism, candy resin, dark factory, thin black outlines, or dense seam clutter.
```

### P03-ITEM-TRIO

```text
Use case: stylized-concept
Asset type: approved material-archetype object reference sheet, transparent PNG
Input images: Image 1 is the selected B puffy-sticker language board; Image 2 is the approved machine anchor that fixes outline, lighting, and rendering quality. They are style references only.
Primary request: create exactly three separate everyday objects that prove three different crush materials while belonging to one game.
Subjects, left to right with generous separation:
1) a plain kraft cardboard shipping box, intact idle state, crisp planar paper faces, folded flaps, taped center seam, subtle paper grain; BRITTLE/NESTED visual logic. It must look firm and foldable, not inflated, not stitched, not a cushion.
2) a yellow rubber duck, intact idle state, rounded elastic rubber body with one or two sparse purposeful molded seams, soft rebound-ready silhouette; ELASTIC visual logic.
3) an unbranded cream paper drink cup with plain lid and a pressure-red straw, intact idle state, thin soft paper sidewall with subtle vertical compression creases and a contained liquid structure; SQUISHY/SPLASH visual logic. It must look like paper and liquid packaging, not an inflated pillow.
Shared graphic treatment: each object gets the same crisp white sticker backing, deep-ink-blue die-cut outer border, and shallow offset shadow; polished 2.5D game asset rendering; large clear silhouettes.
View and light: same slight 3/4 front top-down view; upper-right key light; consistent scale and black point.
Color palette: #FFC83D, #FF5D55, #243145, #63D7B0, #FFF4DE, kraft brown, white highlights.
Composition/framing: one landscape transparent canvas, exactly three non-overlapping isolated objects in three columns, each fully visible, equal visual weight, at least 12% exterior padding, no ground or environment.
Output intent: Figma material-direction anchor; not a production animation sheet.
Constraints: genuinely transparent background with preserved alpha; no labels, words, letters, numbers, pseudo-text, logos, brands, watermark, people, extra objects, damage, burst liquid, crumbs, floor, background scene, clay fingerprints, gritty metal, photorealism, candy resin, thin black outlines, or uniform puffy seams across all three objects.
```

### P04-BACKGROUND

```text
Use case: stylized-concept
Asset type: approved vertical game workshop background
Input images: Image 1 is the selected B main-entrance candidate and provides the desktop-workshop environment language; Image 2 is the approved machine anchor and fixes palette, lighting, and rendering quality. Do not place or reproduce the machine.
Primary request: create a reusable portrait background for the first "messy desktop" workshop of a casual crush game.
Scene/backdrop: cream padded wall panel with a broad mint pegboard area, one simple rounded mint work lamp high on the right, a few abstract cable curves and small blank peg shapes around the outer edges, mint work surface at the bottom. The central 55% of the canvas must remain quiet and unobstructed for a hydraulic press, conveyor, and changing item.
Style/medium: polished 2.5D puffy-sticker workshop environment; rounded vinyl wall panels, sparse clean seams, soft white edging on large set pieces, subtle deep-ink-blue structural accents, large color fields, no tiny clutter.
Lighting/mood: bright cheerful upper-right key light, shallow controlled contact shadows, same world as Image 2.
Color palette: dominant #FFF4DE and #63D7B0, small accents #FFC83D and #243145; no pressure red except an optional tiny neutral accent.
Composition/framing: strict 9:20 portrait mobile composition equivalent to 360×800; extra 12% crop-safe decoration around all edges; quiet top HUD safe strip; empty central stage; calm lower-middle long-press zone. Fill the full canvas edge to edge; no letterboxing or framing mat.
Output intent: reusable Figma screen background layer.
Constraints: no hydraulic press, conveyor, objects, UI panels, buttons, navigation, HUD, text, letters, numbers, pseudo-text, logos, brands, watermark, people, readable notes, real app icons, dark factory, photorealism, gritty metal, candy resin, or dense decoration.
```

### P05-PANEL-KIT

```text
Use case: stylized-concept
Asset type: approved game UI surface-material reference kit, transparent PNG
Input images: Image 1 is the selected B puffy-sticker language board; Image 2 is the approved machine anchor and fixes palette, border, lighting, and polish. They are style references only.
Primary request: create exactly four separate blank surface samples for later Figma reconstruction:
1) one large cream rounded rectangular raised panel,
2) one medium industrial-yellow primary button surface,
3) one medium cream secondary button surface,
4) one long horizontal progress-track shell with a short mint fill segment.
Style/medium: polished 2.5D puffy vinyl sticker UI surfaces; soft controlled inflation; sparse perimeter seam only on the large panel; crisp white backing plus deep-ink-blue die-cut outer border; shallow lower-left offset shadow; large clean color blocks.
Lighting/mood: upper-right key light, controlled highlights and shadow softness matching Image 2.
Color palette: #FFC83D, #243145, #63D7B0, #FFF4DE, white; no pressure red in this neutral surface kit.
Composition/framing: landscape transparent canvas; four non-overlapping samples organized in a clean grid with generous space; every sample fully visible.
Output intent: material and construction reference for Figma variables, effects, nine-slice surfaces, buttons, and progress components. These are blank visual samples, not final UI components.
Constraints: genuinely transparent background with preserved alpha; absolutely no text, letters, numbers, pseudo-text, icons, symbols, logos, brands, watermark, people, navigation, stars, badges, extra panels, background scene, clay fingerprints, gritty metal, photorealism, candy resin, thin black outlines, or dense stitching.
```

### P06-MOTIF-KIT

```text
Use case: stylized-concept
Asset type: approved decoration and feedback motif kit, transparent PNG
Input images: Image 1 is the selected B language board; Image 2 is the approved machine anchor and fixes palette, outline, light, and rendering quality. They are style references only.
Primary request: create exactly six separate graphic motifs for the puffy-sticker workshop:
1) a compact downward pressure arrow,
2) a flattened rounded-square block,
3) two broad concentric pressure-wave arcs,
4) a four-direction perfect-impact burst,
5) a small cluster of six golden rounded-square confetti pieces,
6) a soft two-sided elastic rebound wave.
Style/medium: polished 2.5D puffy vinyl sticker graphics; simple bold silhouettes; crisp white sticker backing plus deep-ink-blue die-cut border where the motif is solid; shallow controlled offset shadow; sparse seam detail only when structurally useful.
Lighting/mood: upper-right key light matching Image 2, bright and energetic.
Color palette: #FFC83D, #FF5D55, #243145, #63D7B0, #FFF4DE, white highlights.
Composition/framing: landscape transparent canvas; six non-overlapping motifs arranged in two clean rows; each fully visible with ample spacing and no connecting background.
Output intent: Figma brand motif, empty-state decoration, reward accent, and motion/particle reference.
Constraints: genuinely transparent background with preserved alpha; no text, letters, numbers, pseudo-text, logos, brands, watermark, people, stars, hearts, badges, app icons, sharp shards, tiny glitter cloud, smoke, background scene, clay fingerprints, gritty metal, photorealism, candy resin, or thin black outlines.
```

## 3. 三张正式竖屏基准提示词

### P07-HOME

```text
Use case: ui-mockup
Asset type: approved HOME visual baseline for a vertical mobile casual game
Input images: Image 1 is the approved reusable workshop background; Image 2 is the approved hydraulic press anchor; Image 3 is the approved conveyor anchor; Image 4 is the approved box/duck/cup material anchor; Image 5 is the approved blank UI surface kit. Preserve their visual identity, palette, border construction, upper-right lighting, and material differences.
Primary request: compose one polished main-entrance visual baseline for the selected "puffy sticker workshop" direction. This is a Figma composition reference, not a shippable screenshot.
Scene/backdrop: use Image 1's cream-and-mint desktop workshop language edge to edge.
Subject and hierarchy: quiet top safe strip; compact press as the upper-middle visual anchor; short conveyor crossing the mid-stage; intact kraft box nearest the press, with small duck and cup supporting the scene; one large blank cream raised panel in the lower-middle; four equal blank cream navigation surfaces along the bottom.
Style/medium: same polished 2.5D puffy-sticker world as the five references; crisp white backing plus deep-ink-blue die-cut borders on foreground objects and surfaces; large confident color blocks; shallow offset shadows; sparse seams.
Composition/framing: strict 9:20 portrait composition equivalent to 360×800, full-bleed with no letterbox or exterior device frame. Keep top 10% calm for later Figma HUD/copy. Machine and objects occupy roughly 22–55% height. Large blank panel occupies roughly 61–78%. Bottom navigation surfaces stay above the bottom safe area. Maintain comfortable gaps and one-screen hierarchy.
Material invariants: the box remains planar kraft paper with folds and tape, not puffy; the duck remains elastic rubber; the cup remains thin paper packaging. Do not redesign them.
Output intent: approved formal HOME key visual used to build Figma layout and variables.
Constraints: every UI surface remains completely blank; no text, letters, numbers, pseudo-text, icons, logos, brands, watermark, people, app chrome, phone mockup, real app icons, stars, badges, repeated extra objects, clutter, crop of the press, or candidate-preview padding.
```

### P08-GAME

```text
Use case: ui-mockup
Asset type: approved GAME visual baseline for a vertical mobile casual game
Input images: Image 1 is the approved reusable workshop background; Image 2 is the approved hydraulic press anchor; Image 3 is the approved conveyor anchor; Image 4 is the approved box/duck/cup material anchor. Preserve their exact visual identity, palette, white-plus-navy border construction, upper-right lighting, scale family, and distinct materials.
Primary request: compose one polished hydraulic-press gameplay-stage visual baseline for the selected "puffy sticker workshop" direction. This is a Figma composition reference, not a shippable screenshot.
Scene/backdrop: use Image 1's cream-and-mint workshop language edge to edge.
Subject and hierarchy: quiet top safe strip; one complete press centered in the upper-middle with the press head clearly raised; one intact kraft cardboard box centered directly beneath the head; conveyor spans the stage under the box; small duck and cup wait together near one outer conveyor edge without competing with the box; central press-to-object relationship completely unobstructed.
Style/medium: same polished 2.5D puffy-sticker world as the references; foreground silhouettes use crisp white sticker backing and deep-ink-blue die-cut borders; large color blocks; shallow offset shadows; sparse seams.
Composition/framing: strict 9:20 portrait composition equivalent to 360×800, full-bleed with no letterbox or exterior device frame. Keep top 10% calm for later HUD. Put machine/object action in roughly 18–62% height. Keep roughly the lower 26% visually quiet as a large long-press interaction zone, with only the mint work surface and subtle edge decoration. Keep all machine parts fully visible and leave safe margins.
Material invariants: the box is planar kraft paper with crisp folds and tape, never puffy or stitched; duck is elastic rubber; cup is thin paper packaging. Do not redesign them.
Output intent: approved formal GAME key visual used for Figma HUD composition and phone-scale checks.
Constraints: no UI panel over the object; no pressure bar, HUD, buttons, navigation, text, letters, numbers, pseudo-text, icons, logos, brands, watermark, people, app chrome, phone mockup, extra machines, duplicate objects, clutter, cropped press, or candidate-preview padding.
```

### P09-RESULT

```text
Use case: ui-mockup
Asset type: approved RESULT visual baseline for a vertical mobile casual game
Input images: Image 1 is only a tower-impact composition reference from the selected B exploration; do not inherit its wide ratio, crop, or candidate layout. Image 2 is the approved reusable workshop background. Image 3 is the approved machine anchor that fixes industrial construction, palette, border, lighting, and polish. Image 4 is the approved decoration/feedback motif kit. Image 5 is the approved blank UI surface kit.
Primary request: compose one polished tower-smash and level-result visual baseline for the selected "puffy sticker workshop" direction. This is a Figma composition reference, not a shippable screenshot.
Scene/backdrop: use the same cream-and-mint desktop workshop world as Image 2, edge to edge.
Subject and action: quiet top safe strip; a stable round workshop platform at mid-height; a tower of exactly nine compressed rounded sticker blocks in industrial yellow, pressure red, mint, cream, and deep navy; tower is partly neat and humorously leaning; one chunky industrial-yellow-and-pressure-red side impact hammer strikes the tower from the right; clear leftward topple direction; use only a few broad pressure arcs, six to ten golden rounded-square particles, and two soft cream dust puffs. Put one large blank cream result panel low on screen.
Style/medium: same polished 2.5D puffy-sticker world as the approved anchors; crisp white backing and deep-ink-blue die-cut border on blocks, hammer, platform, and panel; large color fields; shallow offset shadows; sparse seams; safe comic impact.
Composition/framing: strict 9:20 portrait composition equivalent to 360×800, full-bleed with no letterbox, padding mat, or exterior device frame. Keep top 10% calm. Tower and hammer action occupies roughly 17–62% height and remains fully inside safe margins. Blank panel occupies roughly 69–86% height, with bottom safe area below it. The impact must remain readable at 360×800.
Output intent: approved formal RESULT key visual used for Figma high-tower/result composition and phone-scale checks.
Constraints: panel stays completely blank; no text, letters, numbers, pseudo-text, icons, logos, brands, watermark, people, score, stars, badges, buttons, navigation, phone mockup, extra hammer, sharp debris, broken shards, dense particle clutter, glitter cloud, violent destruction, cropped action, or candidate-preview letterboxing.
```

### P10-RESULT-CLEANUP

RESULT 首稿有两个拒绝原因：锤柄贴近右边界并被截断；塔块含星形、心形、棋盘格等未批准图标语义。第二轮只做以下修改：

```text
Use case: precise-object-edit
Input images: Image 1 is the RESULT visual baseline edit target.
Primary request: change only two things in Image 1:
1) scale and shift the side impact hammer slightly inward so the complete hammer head and complete handle are fully visible inside the right safe margin; keep the same impact point and clear leftward topple action.
2) remove every semantic decorative symbol from the nine tower blocks: remove all stars, hearts, circles, checkerboards, hazard stripes, and wave marks. Replace them with plain solid color faces using the existing industrial yellow, pressure red, mint, cream, and deep navy. Keep exactly nine blocks, their sizes, order, lean, puffy seams, white sticker backing, navy borders, and lighting.
Invariants: preserve the exact 9:20 full-bleed portrait canvas, cream-and-mint workshop background, lamp and pegboard placement, round platform, tower location, impact effects, blank lower result panel, upper-right key light, palette, border widths, shadows, and overall polish.
Constraints: no new elements; no crop of the hammer or action; no text, letters, numbers, pseudo-text, icons, logos, brands, watermark, stars, hearts, badges, symbols, sharp debris, or letterboxing.
```

## 4. 透明背景修正

P01、P02、P05、P06 首轮输出虽然显示棋盘格，但文件检查为 RGB、没有 alpha，故不批准。每张分别执行一次背景提取；P03 首轮已经是 RGBA，不需要修正。

### P11-PRESS-ALPHA

```text
Use case: background-extraction
Input images: Image 1 is the hydraulic press cutout target.
Primary request: remove only the light checkerboard backdrop and convert it to genuine transparent alpha.
Invariants: preserve the hydraulic press exactly—same geometry, proportions, colors, white sticker backing, deep navy outer border, contained shallow shadow, upper-right highlights, safety stripes, and canvas padding. Do not redraw, crop, resize, recolor, simplify, sharpen, or add elements.
Edge requirements: clean continuous alpha around the outer white sticker backing and shadow; no checkerboard pixels, white rectangular canvas, gray halo, holes, or missing edge details.
Constraints: genuinely transparent background with preserved alpha; no new background, floor, text, logo, watermark, or extra object.
```

### P12-CONVEYOR-ALPHA

与 P11 相同的背景提取结构，目标改为传送带，并锁定皮带分段、薄荷护栏、黄色机身、深蓝滚轮、四脚、外框和阴影。

### P13-PANEL-ALPHA

与 P11 相同的背景提取结构，目标改为四件空白 UI 表面，锁定四件的布局、颜色、缝线、边框、阴影和进度填充，不增删或重排。

### P14-MOTIF-ALPHA

与 P11 相同的背景提取结构，目标改为六件装饰/反馈母题，额外要求压力弧内部、母题之间和所有负空间都保持透明。

### P15-PRESS-EDGE-CLEANUP

最终放大复核发现液压机外缘仍有零散半透明像素，因此追加严格两步清理：先删除白衬边外的阴影、光晕和离散像素，再将可见棋盘格转换为真实 alpha。最终只保留机器、深墨蓝外框和连续白衬边，开放结构内部与白衬边外全部透明。

## 5. 批准输出映射

| Prompt | 批准输出 |
|---|---|
| P01 + P11 + P15 | `design/approved/gwp-012-puffy-sticker/machine/mch_press_base_visual_anchor_v01.png` |
| P02 + P12 | `design/approved/gwp-012-puffy-sticker/machine/mch_conveyor_01_visual_anchor_v01.png` |
| P03 | `design/approved/gwp-012-puffy-sticker/items/itm_baseline_box_duck_cup_idle_v01.png` |
| P04 | `design/approved/gwp-012-puffy-sticker/backgrounds/bg_workshop_01_visual_anchor_v01.png` |
| P05 + P13 | `design/approved/gwp-012-puffy-sticker/ui/tex_panel_ui_surface_kit_v01.png` |
| P06 + P14 | `design/approved/gwp-012-puffy-sticker/effects/dec_fx_motif_kit_v01.png` |
| P07 | `design/approved/gwp-012-puffy-sticker/screens/baseline_home_v01.png` |
| P08 | `design/approved/gwp-012-puffy-sticker/screens/baseline_game_v01.png` |
| P09 + P10 | `design/approved/gwp-012-puffy-sticker/screens/baseline_result_v01.png` |
