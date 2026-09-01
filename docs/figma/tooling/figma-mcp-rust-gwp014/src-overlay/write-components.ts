import { getBounds } from "./serializers";

type SceneWithVariables = SceneNode & {
  setBoundVariable: (field: string, variable: Variable | null) => void;
};

type GwpEnvelope = {
  $gwpComponent: 1;
  operation: "recover-components-frame" | "prepare-base" | "capability-probe" | "build-family" | "repair-family-presets" | "audit";
  family?: string;
  expectedName?: string;
};

const parseEnvelope = (value: unknown): GwpEnvelope | null => {
  if (typeof value !== "string" || !value.startsWith("{")) return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && parsed.$gwpComponent === 1 ? parsed : null;
  } catch {
    return null;
  }
};

const requireNode = async (id: string) => {
  const node = await figma.getNodeByIdAsync(id);
  if (!node) throw new Error(`Node not found: ${id}`);
  return node;
};

const loadGwpResources = async () => {
  const [collections, variables, textStyles, effectStyles] = await Promise.all([
    figma.variables.getLocalVariableCollectionsAsync(),
    figma.variables.getLocalVariablesAsync(),
    figma.getLocalTextStylesAsync(),
    figma.getLocalEffectStylesAsync(),
  ]);
  const collectionNames = new Map(collections.map((c) => [c.id, c.name]));
  const vars = new Map<string, Variable>();
  for (const variable of variables) {
    const collectionName = collectionNames.get(variable.variableCollectionId);
    if (collectionName?.startsWith("GWP /")) {
      vars.set(`${collectionName}/${variable.name}`, variable);
    }
  }
  const text = new Map(textStyles.filter((s) => s.name.startsWith("GWP/")).map((s) => [s.name, s]));
  const effects = new Map(effectStyles.filter((s) => s.name.startsWith("GWP/")).map((s) => [s.name, s]));
  const requiredVars = [
    "GWP / Color Primitives/white/0",
    "GWP / Color Semantics/brand",
    "GWP / Color Semantics/accent",
    "GWP / Color Semantics/success",
    "GWP / Color Semantics/warning",
    "GWP / Color Semantics/danger",
    "GWP / Color Semantics/surface",
    "GWP / Color Semantics/text/primary",
    "GWP / Color Semantics/text/secondary",
    "GWP / Color Semantics/disabled",
    "GWP / Layout/spacing/4",
    "GWP / Layout/spacing/8",
    "GWP / Layout/spacing/12",
    "GWP / Layout/spacing/16",
    "GWP / Layout/spacing/24",
    "GWP / Layout/radius/12",
    "GWP / Layout/radius/20",
    "GWP / Layout/radius/pill",
    "GWP / Layout/stroke/sticker-white",
    "GWP / Layout/stroke/control",
    "GWP / Layout/size/touch-min",
    "GWP / Layout/size/action-min",
    "GWP / Layout/size/button-primary",
    "GWP / Layout/size/canvas-min-width",
    "GWP / Layout/size/canvas-base-width",
    "GWP / Opacity/disabled",
    "GWP / Opacity/secondary",
    "GWP / Opacity/pressed",
    "GWP / Typography/family/body",
    "GWP / Typography/style/regular",
    "GWP / Typography/style/strong",
    "GWP / Typography/size/body",
    "GWP / Typography/size/caption",
    "GWP / Typography/size/micro",
    "GWP / Typography/line-height/body",
    "GWP / Typography/line-height/caption",
    "GWP / Typography/line-height/micro",
    "GWP / Typography/letter-spacing/body",
    "GWP / Typography/letter-spacing/caption",
    "GWP / Typography/letter-spacing/micro",
  ];
  const missing = requiredVars.filter((name) => !vars.has(name));
  if (missing.length) throw new Error(`Missing GWP variables: ${missing.join(", ")}`);
  await Promise.all([
    figma.loadFontAsync({ family: "Noto Sans SC", style: "Regular" }),
    figma.loadFontAsync({ family: "Noto Sans SC", style: "Bold" }),
  ]);
  return { vars, text, effects };
};

const v = (resources: Awaited<ReturnType<typeof loadGwpResources>>, name: string) => {
  const variable = resources.vars.get(name);
  if (!variable) throw new Error(`Variable not found: ${name}`);
  return variable;
};

const bindPaint = (variable: Variable): SolidPaint =>
  figma.variables.setBoundVariableForPaint(
    { type: "SOLID", color: { r: 0, g: 0, b: 0 } },
    "color",
    variable,
  );

const bind = (node: SceneNode, field: string, variable: Variable) =>
  (node as SceneWithVariables).setBoundVariable(field, variable);

const configureAutoLayout = (
  node: ComponentNode | FrameNode,
  direction: "HORIZONTAL" | "VERTICAL",
) => {
  node.layoutMode = direction;
  node.primaryAxisAlignItems = "CENTER";
  node.counterAxisAlignItems = "CENTER";
};

const applyContainerTokens = async (
  node: ComponentNode | FrameNode,
  resources: Awaited<ReturnType<typeof loadGwpResources>>,
  fillVariable: Variable,
  state: string,
  radius = "GWP / Layout/radius/20",
) => {
  node.fills = [bindPaint(fillVariable)];
  node.strokes = [bindPaint(v(resources, "GWP / Color Primitives/white/0"))];
  bind(node, "strokeWeight", v(resources, "GWP / Layout/stroke/sticker-white"));
  for (const field of ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"]) {
    bind(node, field, v(resources, radius));
  }
  const effectName = state === "Pressed" ? "GWP/Effect/Sticker/Pressed" : "GWP/Effect/Sticker/Default";
  const effect = resources.effects.get(effectName);
  if (!effect) throw new Error(`Effect style not found: ${effectName}`);
  await node.setEffectStyleIdAsync(effect.id);
  if (state === "Pressed") bind(node, "opacity", v(resources, "GWP / Opacity/pressed"));
  if (state === "Disabled") bind(node, "opacity", v(resources, "GWP / Opacity/disabled"));
};

const applySpacing = (
  node: ComponentNode | FrameNode,
  resources: Awaited<ReturnType<typeof loadGwpResources>>,
  horizontal = "GWP / Layout/spacing/16",
  vertical = "GWP / Layout/spacing/12",
  gap = "GWP / Layout/spacing/8",
) => {
  bind(node, "paddingLeft", v(resources, horizontal));
  bind(node, "paddingRight", v(resources, horizontal));
  bind(node, "paddingTop", v(resources, vertical));
  bind(node, "paddingBottom", v(resources, vertical));
  bind(node, "itemSpacing", v(resources, gap));
};

const makeText = async (
  name: string,
  characters: string,
  resources: Awaited<ReturnType<typeof loadGwpResources>>,
  options: { strong?: boolean; scale?: "body" | "caption" | "micro"; color?: Variable } = {},
) => {
  const strong = options.strong ?? false;
  const scale = options.scale ?? "body";
  const text = figma.createText();
  text.name = name;
  text.fontName = { family: "Noto Sans SC", style: strong ? "Bold" : "Regular" };
  text.fontSize = scale === "body" ? 16 : scale === "caption" ? 14 : 12;
  text.characters = characters;
  text.fills = [bindPaint(options.color ?? v(resources, "GWP / Color Semantics/text/primary"))];
  bind(text, "fontFamily", v(resources, "GWP / Typography/family/body"));
  bind(text, "fontStyle", v(resources, strong ? "GWP / Typography/style/strong" : "GWP / Typography/style/regular"));
  bind(text, "fontSize", v(resources, `GWP / Typography/size/${scale}`));
  bind(text, "lineHeight", v(resources, `GWP / Typography/line-height/${scale}`));
  bind(text, "letterSpacing", v(resources, `GWP / Typography/letter-spacing/${scale}`));
  return text;
};

const createIconComponents = async (
  base: FrameNode,
  resources: Awaited<ReturnType<typeof loadGwpResources>>,
) => {
  const existing = base.findAll((n) => n.type === "COMPONENT" && n.name.startsWith("GWP/Icon/")) as ComponentNode[];
  if (existing.length >= 8) return existing;
  const glyphs: Array<[string, string]> = [
    ["Default", "●"],
    ["Back", "←"],
    ["Close", "×"],
    ["Check", "✓"],
    ["Warning", "!"],
    ["Offline", "⌁"],
    ["Lock", "◆"],
    ["Spinner", "◌"],
  ];
  const icons: ComponentNode[] = [];
  for (let index = 0; index < glyphs.length; index++) {
    const [name, glyph] = glyphs[index];
    const icon = figma.createComponent();
    icon.name = `GWP/Icon/${name}`;
    icon.resize(24, 24);
    configureAutoLayout(icon, "HORIZONTAL");
    icon.primaryAxisSizingMode = "FIXED";
    icon.counterAxisSizingMode = "FIXED";
    icon.fills = [];
    const text = await makeText("Icon/Glyph", glyph, resources, { strong: true, scale: "body" });
    icon.appendChild(text);
    base.appendChild(icon);
    icon.x = 100 + index * 52;
    icon.y = 120;
    icons.push(icon);
  }
  return icons;
};

const iconByName = (base: FrameNode, name: string) => {
  const icon = base.findOne((n) => n.type === "COMPONENT" && n.name === `GWP/Icon/${name}`);
  if (!icon || icon.type !== "COMPONENT") throw new Error(`Icon component missing: ${name}`);
  return icon;
};

const appendIcon = (
  parent: ComponentNode | FrameNode,
  base: FrameNode,
  name: string,
  layerName = "Icon",
) => {
  const instance = iconByName(base, name).createInstance();
  instance.name = layerName;
  parent.appendChild(instance);
  return instance;
};

const roleFill = (
  resources: Awaited<ReturnType<typeof loadGwpResources>>,
  role: string,
) => {
  if (["Primary", "Emphasis"].includes(role)) return v(resources, "GWP / Color Semantics/brand");
  if (["Danger", "Error"].includes(role)) return v(resources, "GWP / Color Semantics/danger");
  if (["Success", "Completed"].includes(role)) return v(resources, "GWP / Color Semantics/success");
  if (["Warning", "Offline"].includes(role)) return v(resources, "GWP / Color Semantics/warning");
  if (role === "Locked") return v(resources, "GWP / Color Semantics/surface");
  if (role === "Info") return v(resources, "GWP / Color Semantics/accent");
  return v(resources, "GWP / Color Semantics/surface");
};

type VariantRecord = {
  component: ComponentNode;
  labels?: Record<string, TextNode>;
  icon?: InstanceNode;
  booleanNode?: SceneNode;
};

const createButtonVariants = async (base: FrameNode, resources: Awaited<ReturnType<typeof loadGwpResources>>) => {
  const records: VariantRecord[] = [];
  for (const role of ["Primary", "Secondary", "Danger"]) {
    for (const size of ["M", "L"]) {
      for (const state of ["Default", "Pressed", "Disabled", "Loading"]) {
        const component = figma.createComponent();
        component.name = `Role=${role}, Size=${size}, State=${state}`;
        component.resize(120, size === "L" ? 52 : 48);
        configureAutoLayout(component, "HORIZONTAL");
        component.primaryAxisSizingMode = "AUTO";
        component.counterAxisSizingMode = "FIXED";
        bind(component, "height", v(resources, size === "L" ? "GWP / Layout/size/button-primary" : "GWP / Layout/size/action-min"));
        applySpacing(component, resources, size === "L" ? "GWP / Layout/spacing/24" : "GWP / Layout/spacing/16", "GWP / Layout/spacing/8");
        await applyContainerTokens(component, resources, state === "Disabled" ? roleFill(resources, "Locked") : roleFill(resources, role), state, "GWP / Layout/radius/pill");
        const icon = appendIcon(component, base, state === "Loading" ? "Spinner" : "Default", "Leading Icon");
        const label = await makeText("Label", state === "Loading" ? "加载中…" : role === "Danger" ? "确认删除" : "开始压扁", resources, { strong: true });
        component.appendChild(label);
        records.push({ component, labels: { Label: label }, icon });
      }
    }
  }
  return records;
};

const createIconButtonVariants = async (base: FrameNode, resources: Awaited<ReturnType<typeof loadGwpResources>>) => {
  const records: VariantRecord[] = [];
  for (const role of ["Neutral", "Emphasis", "Back", "Close"]) {
    for (const size of ["44", "52"]) {
      for (const state of ["Default", "Pressed", "Disabled"]) {
        const component = figma.createComponent();
        component.name = `Role=${role}, Size=${size}, State=${state}`;
        const dimension = size === "52" ? 52 : 44;
        component.resize(dimension, dimension);
        configureAutoLayout(component, "HORIZONTAL");
        component.primaryAxisSizingMode = "FIXED";
        component.counterAxisSizingMode = "FIXED";
        const sizeVar = v(resources, size === "52" ? "GWP / Layout/size/button-primary" : "GWP / Layout/size/touch-min");
        bind(component, "width", sizeVar);
        bind(component, "height", sizeVar);
        await applyContainerTokens(component, resources, state === "Disabled" ? roleFill(resources, "Locked") : roleFill(resources, role), state, "GWP / Layout/radius/pill");
        const iconName = role === "Back" ? "Back" : role === "Close" ? "Close" : "Default";
        const icon = appendIcon(component, base, iconName, "Icon");
        const badge = figma.createEllipse();
        badge.name = "Badge Dot";
        badge.resize(8, 8);
        badge.fills = [bindPaint(v(resources, "GWP / Color Semantics/danger"))];
        badge.visible = false;
        component.appendChild(badge);
        records.push({ component, icon, booleanNode: badge });
      }
    }
  }
  return records;
};

const createSegmentVariants = async (_base: FrameNode, resources: Awaited<ReturnType<typeof loadGwpResources>>) => {
  const records: VariantRecord[] = [];
  for (const items of [2, 3]) {
    const selections = items === 2 ? ["None", "1", "2"] : ["None", "1", "2", "3"];
    for (const selected of selections) {
      for (const state of ["Default", "Pressed", "Disabled"]) {
        const component = figma.createComponent();
        component.name = `Items=${items}, Selected=${selected}, State=${state}`;
        component.resize(360, 48);
        configureAutoLayout(component, "HORIZONTAL");
        component.primaryAxisSizingMode = "FIXED";
        component.counterAxisSizingMode = "FIXED";
        bind(component, "width", v(resources, "GWP / Layout/size/canvas-base-width"));
        bind(component, "height", v(resources, "GWP / Layout/size/action-min"));
        bind(component, "itemSpacing", v(resources, "GWP / Layout/spacing/4"));
        await applyContainerTokens(component, resources, v(resources, "GWP / Color Semantics/surface"), state, "GWP / Layout/radius/pill");
        const labels: Record<string, TextNode> = {};
        for (let index = 1; index <= items; index++) {
          const segment = figma.createFrame();
          segment.name = `Segment ${index}`;
          segment.resize(100, 40);
          configureAutoLayout(segment, "HORIZONTAL");
          segment.primaryAxisSizingMode = "FIXED";
          segment.counterAxisSizingMode = "FIXED";
          segment.fills = [bindPaint(String(index) === selected ? v(resources, "GWP / Color Semantics/brand") : v(resources, "GWP / Color Semantics/surface"))];
          for (const field of ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"]) bind(segment, field, v(resources, "GWP / Layout/radius/pill"));
          const label = await makeText(`Item ${index}`, index === 1 ? "全部" : index === 2 ? "已发现" : "已完成", resources, { strong: String(index) === selected });
          segment.appendChild(label);
          component.appendChild(segment);
          segment.layoutGrow = 1;
          segment.layoutAlign = "STRETCH";
          labels[`Item ${index}`] = label;
        }
        records.push({ component, labels });
      }
    }
  }
  return records;
};

const createStatusPillVariants = async (base: FrameNode, resources: Awaited<ReturnType<typeof loadGwpResources>>) => {
  const records: VariantRecord[] = [];
  for (const tone of ["Info", "Success", "Warning", "Locked", "Completed"]) {
    for (const emphasis of ["Default", "Emphasized"]) {
      const component = figma.createComponent();
      component.name = `Tone=${tone}, Emphasis=${emphasis}`;
      component.resize(96, 36);
      configureAutoLayout(component, "HORIZONTAL");
      component.primaryAxisSizingMode = "AUTO";
      component.counterAxisSizingMode = "AUTO";
      applySpacing(component, resources, "GWP / Layout/spacing/12", "GWP / Layout/spacing/4", "GWP / Layout/spacing/4");
      await applyContainerTokens(component, resources, roleFill(resources, tone), "Default", "GWP / Layout/radius/pill");
      if (emphasis === "Default") bind(component, "opacity", v(resources, "GWP / Opacity/secondary"));
      const iconName = tone === "Locked" ? "Lock" : tone === "Warning" ? "Warning" : tone === "Info" ? "Default" : "Check";
      const icon = appendIcon(component, base, iconName, "Status Icon");
      const label = await makeText("Label", tone === "Info" ? "新内容" : tone === "Success" ? "成功" : tone === "Warning" ? "注意" : tone === "Locked" ? "未解锁" : "已完成", resources, { strong: emphasis === "Emphasized", scale: "caption" });
      component.appendChild(label);
      records.push({ component, labels: { Label: label }, icon });
    }
  }
  return records;
};

const createProgressVariants = async (base: FrameNode, resources: Awaited<ReturnType<typeof loadGwpResources>>) => {
  const records: VariantRecord[] = [];
  for (const kind of ["Linear", "Stars", "Loading"]) {
    for (const state of ["Default", "Loading", "Completed", "Error"]) {
      const component = figma.createComponent();
      component.name = `Kind=${kind}, State=${state}`;
      component.resize(320, 48);
      configureAutoLayout(component, "HORIZONTAL");
      component.primaryAxisSizingMode = "FIXED";
      component.counterAxisSizingMode = "FIXED";
      bind(component, "width", v(resources, "GWP / Layout/size/canvas-min-width"));
      bind(component, "height", v(resources, "GWP / Layout/size/action-min"));
      applySpacing(component, resources, "GWP / Layout/spacing/12", "GWP / Layout/spacing/8", "GWP / Layout/spacing/8");
      await applyContainerTokens(component, resources, v(resources, "GWP / Color Semantics/surface"), "Default", "GWP / Layout/radius/12");
      let label: TextNode;
      if (kind === "Linear") {
        const track = figma.createFrame();
        track.name = "Progress Track";
        track.resize(210, 12);
        track.fills = [bindPaint(v(resources, "GWP / Color Semantics/disabled"))];
        bind(track, "opacity", v(resources, "GWP / Opacity/secondary"));
        for (const field of ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"]) bind(track, field, v(resources, "GWP / Layout/radius/pill"));
        const fill = figma.createRectangle();
        fill.name = "Progress Fill";
        fill.resize(state === "Completed" ? 210 : state === "Error" ? 170 : state === "Loading" ? 120 : 105, 12);
        fill.fills = [bindPaint(state === "Error" ? v(resources, "GWP / Color Semantics/danger") : v(resources, "GWP / Color Semantics/brand"))];
        bind(fill, "cornerRadius", v(resources, "GWP / Layout/radius/pill"));
        track.appendChild(fill);
        component.appendChild(track);
        track.layoutGrow = 1;
        label = await makeText("Label", state === "Completed" ? "完成" : state === "Error" ? "重试" : "50%", resources, { strong: true, scale: "caption" });
        component.appendChild(label);
      } else if (kind === "Stars") {
        label = await makeText("Label", state === "Completed" ? "★★★" : state === "Error" ? "☆☆☆" : state === "Loading" ? "★☆☆" : "★★☆", resources, { strong: true });
        component.appendChild(label);
      } else {
        appendIcon(component, base, "Spinner", "Loading Icon");
        label = await makeText("Label", state === "Error" ? "加载失败" : state === "Completed" ? "加载完成" : "加载中…", resources, { strong: true, scale: "caption" });
        component.appendChild(label);
      }
      records.push({ component, labels: { Label: label } });
    }
  }
  return records;
};

const createMessageVariants = async (base: FrameNode, resources: Awaited<ReturnType<typeof loadGwpResources>>) => {
  const records: VariantRecord[] = [];
  for (const kind of ["Toast", "Inline"]) {
    for (const tone of ["Info", "Success", "Error", "Offline"]) {
      const component = figma.createComponent();
      component.name = `Kind=${kind}, Tone=${tone}`;
      component.resize(320, kind === "Toast" ? 52 : 72);
      configureAutoLayout(component, "HORIZONTAL");
      component.primaryAxisSizingMode = "FIXED";
      component.counterAxisSizingMode = "AUTO";
      bind(component, "width", v(resources, "GWP / Layout/size/canvas-min-width"));
      applySpacing(component, resources, "GWP / Layout/spacing/16", "GWP / Layout/spacing/12", "GWP / Layout/spacing/8");
      await applyContainerTokens(component, resources, v(resources, "GWP / Color Semantics/surface"), "Default", "GWP / Layout/radius/20");
      const toneBar = figma.createRectangle();
      toneBar.name = "Tone Bar";
      toneBar.resize(4, kind === "Toast" ? 28 : 44);
      toneBar.fills = [bindPaint(roleFill(resources, tone))];
      bind(toneBar, "width", v(resources, "GWP / Layout/spacing/4"));
      bind(toneBar, "cornerRadius", v(resources, "GWP / Layout/radius/pill"));
      component.appendChild(toneBar);
      const iconName = tone === "Success" ? "Check" : tone === "Error" ? "Warning" : tone === "Offline" ? "Offline" : "Default";
      const icon = appendIcon(component, base, iconName, "Message Icon");
      const message = await makeText("Message", tone === "Info" ? "设置已保存" : tone === "Success" ? "领取成功" : tone === "Error" ? "操作失败，请重试" : "网络不可用，已保留本地进度", resources, { strong: kind === "Toast", scale: kind === "Toast" ? "caption" : "body" });
      component.appendChild(message);
      message.layoutGrow = 1;
      records.push({ component, labels: { Message: message }, icon });
    }
  }
  return records;
};

const createLoadingVariants = async (base: FrameNode, resources: Awaited<ReturnType<typeof loadGwpResources>>) => {
  const records: VariantRecord[] = [];
  for (const context of ["Startup", "Local", "Button"]) {
    const component = figma.createComponent();
    component.name = `Context=${context}`;
    component.resize(context === "Startup" ? 320 : 120, context === "Startup" ? 96 : 48);
    configureAutoLayout(component, context === "Startup" ? "VERTICAL" : "HORIZONTAL");
    component.primaryAxisSizingMode = context === "Startup" ? "FIXED" : "AUTO";
    component.counterAxisSizingMode = context === "Startup" ? "FIXED" : "AUTO";
    if (context === "Startup") bind(component, "width", v(resources, "GWP / Layout/size/canvas-min-width"));
    applySpacing(component, resources, "GWP / Layout/spacing/16", "GWP / Layout/spacing/12", "GWP / Layout/spacing/8");
    await applyContainerTokens(component, resources, context === "Button" ? v(resources, "GWP / Color Semantics/brand") : v(resources, "GWP / Color Semantics/surface"), "Default", "GWP / Layout/radius/20");
    appendIcon(component, base, "Spinner", "Spinner");
    const label = await makeText("Label", context === "Startup" ? "正在启动压扁工坊…" : context === "Local" ? "加载中…" : "处理中…", resources, { strong: true, scale: "caption" });
    component.appendChild(label);
    records.push({ component, labels: { Label: label } });
  }
  return records;
};

const familyConfig: Record<string, { setName: string; title: string; description: string; usage: string; columns: number; creator: Function }> = {
  Button: { setName: "GWP/A-Button", title: "Button", description: "主、次与危险文本按钮，覆盖 M/L 与 Default、Pressed、Disabled、Loading。", usage: "用于明确动作；禁止同一页面出现多个 Primary，也禁止用图片烘焙文字。", columns: 4, creator: createButtonVariants },
  IconButton: { setName: "GWP/A-IconButton", title: "IconButton", description: "44/52 触控热区的普通、强调、返回与关闭按钮。", usage: "Icon 使用 INSTANCE_SWAP；禁止为每个图标建立 variant。", columns: 3, creator: createIconButtonVariants },
  Segment: { setName: "GWP/A-SegmentedControl", title: "Tab / Segment", description: "2/3 项文字分页，显式建模当前项与 Default、Pressed、Disabled。", usage: "用于同层内容切换；禁止承载页面主导航或超过 3 项。", columns: 3, creator: createSegmentVariants },
  StatusPill: { setName: "GWP/A-StatusPill", title: "Badge / StatusPill", description: "Info、Success、Warning、Locked、Completed 状态胶囊。", usage: "用于短状态；禁止塞入长句或替代按钮。", columns: 2, creator: createStatusPillVariants },
  Progress: { setName: "GWP/A-Progress", title: "Progress", description: "Linear、Stars、Loading 三类进度与 Default、Loading、Completed、Error。", usage: "只表达进度或结果；禁止以动效制造虚假进度。", columns: 4, creator: createProgressVariants },
  Message: { setName: "GWP/C-Toast-InlineMessage", title: "Toast / InlineMessage", description: "Toast 与 Inline 两种密度，覆盖 Info、Success、Error、Offline。", usage: "Toast 短暂反馈，Inline 保留上下文；禁止用 Toast 承载必须确认的信息。", columns: 4, creator: createMessageVariants },
  Loading: { setName: "GWP/A-Loading", title: "Loading", description: "Startup、Local、Button 三种加载上下文。", usage: "用于真实等待；禁止无结束条件的装饰性旋转。", columns: 3, creator: createLoadingVariants },
};

const addDocumentation = async (
  frame: FrameNode,
  config: (typeof familyConfig)[string],
  resources: Awaited<ReturnType<typeof loadGwpResources>>,
) => {
  const title = await makeText(`${config.title}/Title`, config.title, resources, { strong: true });
  title.x = 100;
  title.y = 60;
  frame.appendChild(title);
  const description = await makeText(`${config.title}/Description`, config.description, resources, { scale: "caption" });
  description.x = 100;
  description.y = 110;
  frame.appendChild(description);
  const usage = await makeText(`${config.title}/Usage`, `用法：${config.usage}`, resources, { scale: "micro" });
  usage.x = 100;
  usage.y = 155;
  frame.appendChild(usage);
  return [title.id, description.id, usage.id];
};

const wireProperties = (
  set: ComponentSetNode,
  records: VariantRecord[],
  family: string,
  base: FrameNode,
) => {
  const propertyKeys: Record<string, string> = {};
  const addTextProperty = (property: string, fallback: string) => {
    const key = set.addComponentProperty(property, "TEXT", fallback);
    propertyKeys[property] = key;
    for (const record of records) {
      const node = record.labels?.[property];
      if (node) node.componentPropertyReferences = { ...(node.componentPropertyReferences ?? {}), characters: key };
    }
  };
  const addBooleanProperty = (property: string, defaultValue: boolean, selector: (record: VariantRecord) => SceneNode | undefined) => {
    const key = set.addComponentProperty(property, "BOOLEAN", defaultValue);
    propertyKeys[property] = key;
    for (const record of records) {
      const node = selector(record);
      if (node) node.componentPropertyReferences = { ...(node.componentPropertyReferences ?? {}), visible: key };
    }
  };
  const addIconProperty = (property: string, fallback: string) => {
    const defaultIcon = iconByName(base, fallback);
    const key = set.addComponentProperty(property, "INSTANCE_SWAP", defaultIcon.id);
    propertyKeys[property] = key;
    for (const record of records) {
      if (record.icon) record.icon.componentPropertyReferences = { ...(record.icon.componentPropertyReferences ?? {}), mainComponent: key };
    }
  };

  if (family === "Button") {
    addTextProperty("Label", "开始压扁");
    addBooleanProperty("Show Leading Icon", false, (r) => r.icon);
    addIconProperty("Leading Icon", "Default");
    for (const record of records) if (record.icon) record.icon.visible = false;
  } else if (family === "IconButton") {
    addBooleanProperty("Show Badge", false, (r) => r.booleanNode);
    addIconProperty("Icon", "Default");
  } else if (family === "Segment") {
    addTextProperty("Item 1", "全部");
    addTextProperty("Item 2", "已发现");
    addTextProperty("Item 3", "已完成");
  } else if (family === "StatusPill") {
    addTextProperty("Label", "状态");
    addBooleanProperty("Show Icon", true, (r) => r.icon);
    addIconProperty("Icon", "Default");
  } else if (family === "Progress") {
    addTextProperty("Label", "50%");
    addBooleanProperty("Show Label", true, (r) => r.labels?.Label);
  } else if (family === "Message") {
    addTextProperty("Message", "设置已保存");
    addBooleanProperty("Show Icon", true, (r) => r.icon);
    addIconProperty("Icon", "Default");
  } else if (family === "Loading") {
    addTextProperty("Label", "加载中…");
    addBooleanProperty("Show Label", true, (r) => r.labels?.Label);
  }
  return propertyKeys;
};

const removePropertyReference = (node: SceneNode, field: string) => {
  if (!("componentPropertyReferences" in node)) return;
  const refs = { ...(node.componentPropertyReferences ?? {}) } as Record<string, string>;
  delete refs[field];
  node.componentPropertyReferences = refs;
};

const setTextCharacters = async (node: TextNode, characters: string) => {
  if (node.fontName === figma.mixed) throw new Error(`Mixed font in semantic preset: ${node.id}`);
  await figma.loadFontAsync(node.fontName);
  node.characters = characters;
};

const applyFamilyPresets = async (
  set: ComponentSetNode,
  records: VariantRecord[],
  family: string,
  base: FrameNode,
  resources: Awaited<ReturnType<typeof loadGwpResources>>,
  propertyKeys: Record<string, string>,
) => {
  const mutatedNodeIds: string[] = [];
  const defaultIcon = iconByName(base, "Default");
  const editDefault = (key: string | undefined, value: string | boolean) => {
    if (key) set.editComponentProperty(key, { defaultValue: value });
  };
  if (family === "Button") editDefault(propertyKeys.Label, "开始压扁");
  if (family === "StatusPill") editDefault(propertyKeys.Label, "新内容");
  if (family === "Progress") editDefault(propertyKeys.Label, "50%");
  if (family === "Message") editDefault(propertyKeys.Message, "设置已保存");
  if (family === "Loading") editDefault(propertyKeys.Label, "加载中…");
  if (propertyKeys.Icon) editDefault(propertyKeys.Icon, defaultIcon.id);
  if (propertyKeys["Leading Icon"]) editDefault(propertyKeys["Leading Icon"], defaultIcon.id);

  for (const record of records) {
    const name = record.component.name;
    if (family === "IconButton" && record.icon) {
      const role = /Role=([^,]+)/.exec(name)?.[1] ?? "Neutral";
      if (role === "Back" || role === "Close") {
        removePropertyReference(record.icon, "mainComponent");
        record.icon.swapComponent(iconByName(base, role));
      } else {
        record.icon.swapComponent(defaultIcon);
        record.icon.componentPropertyReferences = {
          ...(record.icon.componentPropertyReferences ?? {}),
          mainComponent: propertyKeys.Icon,
        };
      }
      record.icon.name = "Icon";
      mutatedNodeIds.push(record.icon.id);
    }

    if (family === "Button") {
      const role = /Role=([^,]+)/.exec(name)?.[1] ?? "Primary";
      const state = /State=([^,]+)/.exec(name)?.[1] ?? "Default";
      const label = record.labels?.Label;
      if (state === "Disabled") {
        record.component.fills = [bindPaint(v(resources, "GWP / Color Semantics/surface"))];
        mutatedNodeIds.push(record.component.id);
      }
      if (label && (role === "Danger" || state === "Loading")) {
        removePropertyReference(label, "characters");
        await setTextCharacters(label, state === "Loading" ? "加载中…" : "确认删除");
        mutatedNodeIds.push(label.id);
      }
      if (record.icon && state === "Loading") {
        removePropertyReference(record.icon, "visible");
        removePropertyReference(record.icon, "mainComponent");
        record.icon.swapComponent(iconByName(base, "Spinner"));
        record.icon.visible = true;
        mutatedNodeIds.push(record.icon.id);
      }
    }

    if (family === "StatusPill") {
      const tone = /Tone=([^,]+)/.exec(name)?.[1] ?? "Info";
      const label = record.labels?.Label;
      if (tone === "Locked") {
        record.component.fills = [bindPaint(v(resources, "GWP / Color Semantics/surface"))];
        mutatedNodeIds.push(record.component.id);
      }
      if (tone !== "Info" && label) {
        removePropertyReference(label, "characters");
        const copy = tone === "Success" ? "成功" : tone === "Warning" ? "注意" : tone === "Locked" ? "未解锁" : "已完成";
        await setTextCharacters(label, copy);
        mutatedNodeIds.push(label.id);
      }
      if (record.icon && tone !== "Info") {
        removePropertyReference(record.icon, "mainComponent");
        const iconName = tone === "Warning" ? "Warning" : tone === "Locked" ? "Lock" : "Check";
        record.icon.swapComponent(iconByName(base, iconName));
        mutatedNodeIds.push(record.icon.id);
      }
    }

    if (family === "Progress") {
      const kind = /Kind=([^,]+)/.exec(name)?.[1] ?? "Linear";
      const state = /State=([^,]+)/.exec(name)?.[1] ?? "Default";
      const label = record.labels?.Label;
      const customizable = kind === "Linear" && (state === "Default" || state === "Loading");
      if (label && !customizable) {
        removePropertyReference(label, "characters");
        const copy = kind === "Linear"
          ? state === "Completed" ? "完成" : "重试"
          : kind === "Stars"
            ? state === "Completed" ? "★★★" : state === "Error" ? "☆☆☆" : state === "Loading" ? "★☆☆" : "★★☆"
            : state === "Error" ? "加载失败" : state === "Completed" ? "加载完成" : "加载中…";
        await setTextCharacters(label, copy);
        mutatedNodeIds.push(label.id);
      }
    }

    if (family === "Message") {
      const tone = /Tone=([^,]+)/.exec(name)?.[1] ?? "Info";
      const message = record.labels?.Message;
      if (tone !== "Info" && message) {
        removePropertyReference(message, "characters");
        const copy = tone === "Success" ? "领取成功" : tone === "Error" ? "操作失败，请重试" : "网络不可用，已保留本地进度";
        await setTextCharacters(message, copy);
        mutatedNodeIds.push(message.id);
      }
      if (record.icon && tone !== "Info") {
        removePropertyReference(record.icon, "mainComponent");
        record.icon.swapComponent(iconByName(base, tone === "Success" ? "Check" : tone === "Error" ? "Warning" : "Offline"));
        mutatedNodeIds.push(record.icon.id);
      }
    }

    if (family === "Loading") {
      const context = /Context=([^,]+)/.exec(name)?.[1] ?? "Local";
      const label = record.labels?.Label;
      if (label && context !== "Local") {
        removePropertyReference(label, "characters");
        await setTextCharacters(label, context === "Startup" ? "正在启动压扁工坊…" : "处理中…");
        mutatedNodeIds.push(label.id);
      }
    }

    if (family === "IconButton") {
      const state = /State=([^,]+)/.exec(name)?.[1] ?? "Default";
      if (state === "Disabled") {
        record.component.fills = [bindPaint(v(resources, "GWP / Color Semantics/surface"))];
        mutatedNodeIds.push(record.component.id);
      }
    }
  }
  return mutatedNodeIds;
};

const auditSet = async (set: ComponentSetNode) => {
  const descendants = set.findAll();
  const components = set.children.filter((n) => n.type === "COMPONENT") as ComponentNode[];
  const hardcodedPaints: Array<{ id: string; name: string; property: string }> = [];
  const bindingCounts: Record<string, number> = {};
  const propertyReferences: Array<{ id: string; name: string; references: any }> = [];
  const autoLayoutFailures: string[] = [];
  for (const node of [set as SceneNode, ...descendants]) {
    const anyNode = node as any;
    if (node.type === "COMPONENT" && anyNode.layoutMode === "NONE") autoLayoutFailures.push(node.id);
    const nodeBindings = anyNode.boundVariables || {};
    for (const field of Object.keys(nodeBindings)) bindingCounts[field] = (bindingCounts[field] || 0) + 1;
    if ("fills" in anyNode && Array.isArray(anyNode.fills)) {
      for (const paint of anyNode.fills) {
        if (paint.type === "SOLID" && !paint.boundVariables?.color && !anyNode.fillStyleId) hardcodedPaints.push({ id: node.id, name: node.name, property: "fills" });
      }
    }
    if ("strokes" in anyNode && Array.isArray(anyNode.strokes)) {
      for (const paint of anyNode.strokes) {
        if (paint.type === "SOLID" && !paint.boundVariables?.color && !anyNode.strokeStyleId) hardcodedPaints.push({ id: node.id, name: node.name, property: "strokes" });
      }
    }
    if (anyNode.componentPropertyReferences && Object.keys(anyNode.componentPropertyReferences).length) {
      propertyReferences.push({ id: node.id, name: node.name, references: anyNode.componentPropertyReferences });
    }
  }
  const opacityBindings = components
    .filter((component) => /State=(Pressed|Disabled)/.test(component.name))
    .map((component) => ({
      id: component.id,
      name: component.name,
      opacityVariableId: (component.boundVariables as any)?.opacity?.id ?? null,
      resolvedOpacity: component.opacity,
    }));
  return {
    id: set.id,
    name: set.name,
    variantCount: components.length,
    variantNames: components.map((c) => c.name),
    componentPropertyDefinitions: set.componentPropertyDefinitions,
    propertyReferenceCount: propertyReferences.length,
    propertyReferences,
    bindingCounts,
    hardcodedPaints,
    autoLayoutFailures,
    opacityBindings,
    bounds: getBounds(set),
  };
};

const prepareBase = async (componentsFrame: FrameNode, resources: Awaited<ReturnType<typeof loadGwpResources>>) => {
  let base = componentsFrame.findOne((n) => n.type === "FRAME" && n.name === "02_Components/Base") as FrameNode | null;
  const createdNodeIds: string[] = [];
  const mutatedNodeIds: string[] = [componentsFrame.id];
  if (!base) {
    base = figma.createFrame();
    base.name = "02_Components/Base";
    base.resize(5840, 7600);
    base.x = 120;
    base.y = 360;
    base.fills = [bindPaint(v(resources, "GWP / Color Semantics/surface"))];
    base.strokes = [bindPaint(v(resources, "GWP / Color Semantics/text/primary"))];
    bind(base, "strokeWeight", v(resources, "GWP / Layout/stroke/control"));
    for (const field of ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"]) bind(base, field, v(resources, "GWP / Layout/radius/28"));
    const raised = resources.effects.get("GWP/Effect/Surface/Raised");
    if (!raised) throw new Error("Missing GWP/Effect/Surface/Raised");
    await base.setEffectStyleIdAsync(raised.id);
    componentsFrame.appendChild(base);
    createdNodeIds.push(base.id);
  }
  componentsFrame.resizeWithoutConstraints(6080, 8200);
  componentsFrame.x = 160;
  componentsFrame.y = 9180;
  const subtitle = componentsFrame.findOne((n) => n.type === "TEXT" && n.name === "placeholder/02_Components/subtitle") as TextNode | null;
  if (subtitle) {
    await figma.loadFontAsync(typeof subtitle.fontName === "symbol" ? { family: "Noto Sans SC", style: "Regular" } : subtitle.fontName);
    subtitle.characters = "GWP-015 · Base interaction components · 逐个创建、验证与截图";
    mutatedNodeIds.push(subtitle.id);
  }
  const section = componentsFrame.parent;
  if (section?.type === "SECTION") {
    const positions: Record<string, [number, number]> = {
      "03_User_Flows": [160, 17540],
      "04_Core_Screens": [3280, 17540],
      "05_Modes_And_Collection": [160, 18500],
      "06_Overlays_And_States": [3280, 18500],
      "07_Prototype": [160, 19460],
      "08_Dev_Handoff": [3280, 19460],
      "99_Archive": [160, 20420],
    };
    for (const child of section.children) {
      const target = positions[child.name];
      if (target && "x" in child) {
        child.x = target[0];
        child.y = target[1];
        mutatedNodeIds.push(child.id);
      }
    }
    section.resizeWithoutConstraints(6400, 21600);
    mutatedNodeIds.push(section.id);
  }
  const icons = await createIconComponents(base, resources);
  for (const icon of icons) if (!createdNodeIds.includes(icon.id)) createdNodeIds.push(icon.id);
  figma.commitUndo();
  return { base, createdNodeIds, mutatedNodeIds, iconIds: icons.map((icon) => icon.id) };
};

const buildFamily = async (
  base: FrameNode,
  family: string,
  resources: Awaited<ReturnType<typeof loadGwpResources>>,
) => {
  const config = familyConfig[family];
  if (!config) throw new Error(`Unsupported GWP family: ${family}`);
  const existing = base.findOne((n) => n.type === "COMPONENT_SET" && n.name === config.setName) as ComponentSetNode | null;
  if (existing) return { skipped: true, family, componentSetId: existing.id, audit: await auditSet(existing), createdNodeIds: [], mutatedNodeIds: [] };
  const familyFrames = base.children.filter((n) => n.type === "FRAME" && n.name.startsWith("Base/")) as FrameNode[];
  const nextY = familyFrames.length ? Math.max(...familyFrames.map((frame) => frame.y + frame.height)) + 80 : 260;
  const doc = figma.createFrame();
  doc.name = `Base/${config.title}`;
  doc.resize(5640, 700);
  doc.x = 100;
  doc.y = nextY;
  doc.fills = [bindPaint(v(resources, "GWP / Color Primitives/white/0"))];
  doc.strokes = [bindPaint(v(resources, "GWP / Color Semantics/text/primary"))];
  bind(doc, "strokeWeight", v(resources, "GWP / Layout/stroke/control"));
  for (const field of ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"]) bind(doc, field, v(resources, "GWP / Layout/radius/20"));
  base.appendChild(doc);
  const docTextIds = await addDocumentation(doc, config, resources);
  const records: VariantRecord[] = await config.creator(base, resources);
  const components = records.map((record) => record.component);
  const set = figma.combineAsVariants(components, doc);
  set.name = config.setName;
  set.description = `${config.description} ${config.usage}`;
  set.fills = [];
  set.strokes = [];
  const maxWidth = Math.max(...components.map((component) => component.width));
  const maxHeight = Math.max(...components.map((component) => component.height));
  const cellWidth = maxWidth + 48;
  const cellHeight = maxHeight + 40;
  components.forEach((component, index) => {
    component.x = 40 + (index % config.columns) * cellWidth;
    component.y = 40 + Math.floor(index / config.columns) * cellHeight;
  });
  const rows = Math.ceil(components.length / config.columns);
  set.resizeWithoutConstraints(80 + config.columns * cellWidth, 80 + rows * cellHeight);
  set.x = 100;
  set.y = 240;
  const propertyKeys = wireProperties(set, records, family, base);
  const semanticPresetMutations = await applyFamilyPresets(set, records, family, base, resources, propertyKeys);
  const docHeight = set.y + set.height + 80;
  doc.resizeWithoutConstraints(5640, docHeight);
  base.resizeWithoutConstraints(5840, doc.y + doc.height + 100);
  const parent = base.parent;
  if (parent?.type === "FRAME") parent.resizeWithoutConstraints(6080, base.y + base.height + 120);
  figma.commitUndo();
  const allCreated = [doc.id, ...docTextIds, set.id, ...components.map((component) => component.id)];
  for (const record of records) {
    if (record.icon) allCreated.push(record.icon.id);
    if (record.booleanNode) allCreated.push(record.booleanNode.id);
    if (record.labels) allCreated.push(...Object.values(record.labels).map((label) => label.id));
  }
  return {
    skipped: false,
    family,
    documentationFrameId: doc.id,
    componentSetId: set.id,
    variantIds: components.map((component) => component.id),
    propertyKeys,
    createdNodeIds: Array.from(new Set(allCreated)),
    mutatedNodeIds: [base.id, parent?.id, ...semanticPresetMutations].filter(Boolean),
    audit: await auditSet(set),
  };
};

const createCapabilityProbe = async (
  parent: FrameNode,
  resources: Awaited<ReturnType<typeof loadGwpResources>>,
) => {
  const existing = parent.findOne((n) => n.type === "COMPONENT_SET" && n.name === "GWP/Probe/ComponentCapabilities") as ComponentSetNode | null;
  if (existing) return { probeId: existing.id, createdNodeIds: [], audit: await auditSet(existing) };
  const icon = iconByName(parent, "Default");
  const records: VariantRecord[] = [];
  for (const state of ["Default", "Pressed"]) {
    const component = figma.createComponent();
    component.name = `State=${state}`;
    component.resize(160, 48);
    configureAutoLayout(component, "HORIZONTAL");
    component.primaryAxisSizingMode = "AUTO";
    component.counterAxisSizingMode = "FIXED";
    applySpacing(component, resources);
    await applyContainerTokens(component, resources, v(resources, "GWP / Color Semantics/brand"), state, "GWP / Layout/radius/pill");
    const instance = icon.createInstance();
    instance.name = "Icon";
    component.appendChild(instance);
    const label = await makeText("Label", "能力探针", resources, { strong: true });
    component.appendChild(label);
    records.push({ component, labels: { Label: label }, icon: instance });
  }
  const set = figma.combineAsVariants(records.map((record) => record.component), parent);
  set.name = "GWP/Probe/ComponentCapabilities";
  set.description = "Temporary GWP-015 capability probe; delete after validation.";
  set.fills = [];
  records.forEach((record, index) => { record.component.x = 40 + index * 220; record.component.y = 40; });
  set.resizeWithoutConstraints(520, 128);
  set.x = 4700;
  set.y = 100;
  const labelKey = set.addComponentProperty("Label", "TEXT", "能力探针");
  const showKey = set.addComponentProperty("Show Icon", "BOOLEAN", true);
  const iconKey = set.addComponentProperty("Icon", "INSTANCE_SWAP", icon.id);
  for (const record of records) {
    record.labels!.Label.componentPropertyReferences = { characters: labelKey };
    record.icon!.componentPropertyReferences = { visible: showKey, mainComponent: iconKey };
  }
  figma.commitUndo();
  return { probeId: set.id, createdNodeIds: [set.id, ...records.map((record) => record.component.id)], propertyKeys: { labelKey, showKey, iconKey }, audit: await auditSet(set) };
};

export const handleWriteComponentRequest = async (request: any): Promise<any> => {
  switch (request.type) {
    case "create_component": {
      const p = request.params || {};
      const nodeId = request.nodeIds && request.nodeIds[0];
      if (!nodeId) throw new Error("nodeId is required");
      const envelope = parseEnvelope(p.name);
      if (!envelope) return null;
      const resources = await loadGwpResources();
      const node = await requireNode(nodeId);
      if (envelope.operation === "recover-components-frame") {
        if (node.type !== "COMPONENT" || !envelope.expectedName || node.name !== envelope.expectedName) {
          throw new Error("recovery must target the exact misconverted component ID and expectedName");
        }
        const parent = node.parent;
        if (!parent || !("children" in parent)) throw new Error("recovery target has no scene parent");
        const index = parent.children.indexOf(node);
        const frame = figma.createFrame();
        frame.name = "02_Components";
        frame.resize(node.width, node.height);
        frame.x = node.x;
        frame.y = node.y;
        frame.fills = node.fills === figma.mixed ? [] : [...node.fills];
        frame.strokes = [...node.strokes];
        frame.opacity = node.opacity;
        frame.clipsContent = node.clipsContent;
        if (node.cornerRadius !== figma.mixed) frame.cornerRadius = node.cornerRadius;
        while (node.children.length) frame.appendChild(node.children[0]);
        parent.insertChild(index, frame);
        node.remove();
        figma.commitUndo();
        return {
          type: request.type,
          requestId: request.requestId,
          data: { recoveredFrameId: frame.id, removedComponentId: nodeId, createdNodeIds: [frame.id], mutatedNodeIds: [] },
        };
      }
      if (envelope.operation === "prepare-base") {
        if (node.type !== "FRAME" || node.name !== "02_Components") throw new Error("prepare-base must target 02_Components frame");
        const result = await prepareBase(node, resources);
        return { type: request.type, requestId: request.requestId, data: { baseId: result.base.id, ...result } };
      }
      if (envelope.operation === "capability-probe") {
        if (node.type !== "FRAME" || node.name !== "02_Components/Base") throw new Error("capability-probe must target 02_Components/Base");
        const result = await createCapabilityProbe(node, resources);
        return { type: request.type, requestId: request.requestId, data: result };
      }
      if (envelope.operation === "build-family") {
        if (node.type !== "FRAME" || node.name !== "02_Components/Base") throw new Error("build-family must target 02_Components/Base");
        if (!envelope.family) throw new Error("family is required");
        const result = await buildFamily(node, envelope.family, resources);
        return { type: request.type, requestId: request.requestId, data: result };
      }
      if (envelope.operation === "repair-family-presets") {
        if (node.type !== "COMPONENT_SET") throw new Error("repair-family-presets must target a GWP component set");
        const family = Object.entries(familyConfig).find(([, config]) => config.setName === node.name)?.[0];
        if (!family) throw new Error(`No GWP family configuration for ${node.name}`);
        const base = node.parent?.parent;
        if (!base || base.type !== "FRAME" || base.name !== "02_Components/Base") {
          throw new Error("component set is not inside 02_Components/Base documentation frame");
        }
        const propertyKeys = Object.fromEntries(Object.entries(node.componentPropertyDefinitions)
          .filter(([, definition]) => !["VARIANT"].includes(definition.type))
          .map(([key]) => [key.split("#")[0], key]));
        const records = node.children
          .filter((child): child is ComponentNode => child.type === "COMPONENT")
          .map((component): VariantRecord => {
            const labelName = family === "Message" ? "Message" : "Label";
            const label = component.findOne((child) => child.type === "TEXT" && child.name === labelName) as TextNode | null;
            const icon = component.findOne((child) => child.type === "INSTANCE") as InstanceNode | null;
            return { component, labels: label ? { [labelName]: label } : undefined, icon: icon ?? undefined };
          });
        const mutatedNodeIds = await applyFamilyPresets(node, records, family, base, resources, propertyKeys);
        figma.commitUndo();
        return {
          type: request.type,
          requestId: request.requestId,
          data: { componentSetId: node.id, mutatedNodeIds, audit: await auditSet(node) },
        };
      }
      if (envelope.operation === "audit") {
        if (node.type !== "COMPONENT_SET") throw new Error("audit must target a COMPONENT_SET");
        return { type: request.type, requestId: request.requestId, data: { audit: await auditSet(node) } };
      }
      throw new Error(`Unsupported GWP component operation: ${envelope.operation}`);
    }

    case "swap_component": {
      const p = request.params || {};
      const nodeId = request.nodeIds && request.nodeIds[0];
      if (!nodeId) throw new Error("nodeId is required");
      if (!p.componentId) throw new Error("componentId is required");
      const node = await figma.getNodeByIdAsync(nodeId);
      if (!node) throw new Error(`Node not found: ${nodeId}`);
      if (node.type !== "INSTANCE") throw new Error(`Node ${nodeId} is not a component INSTANCE`);
      const component = await figma.getNodeByIdAsync(p.componentId);
      if (!component) throw new Error(`Component not found: ${p.componentId}`);
      if (component.type !== "COMPONENT") throw new Error(`Node ${p.componentId} is not a COMPONENT`);
      node.mainComponent = component;
      figma.commitUndo();
      return { type: request.type, requestId: request.requestId, data: { id: node.id, name: node.name, componentId: component.id, componentName: component.name } };
    }

    case "detach_instance": {
      const nodeIds = request.nodeIds || [];
      if (nodeIds.length === 0) throw new Error("nodeIds is required");
      const results: any[] = [];
      for (const nid of nodeIds) {
        const n = await figma.getNodeByIdAsync(nid);
        if (!n) { results.push({ nodeId: nid, error: "Node not found" }); continue; }
        if (n.type !== "INSTANCE") { results.push({ nodeId: nid, error: "Node is not an INSTANCE" }); continue; }
        const frame = n.detachInstance();
        results.push({ nodeId: nid, newId: frame.id, name: frame.name });
      }
      figma.commitUndo();
      return { type: request.type, requestId: request.requestId, data: { results } };
    }

    case "delete_nodes": {
      const nodeIds = request.nodeIds || [];
      if (nodeIds.length === 0) throw new Error("nodeIds is required");
      const results: any[] = [];
      for (const nid of nodeIds) {
        const n = await figma.getNodeByIdAsync(nid);
        if (!n) { results.push({ nodeId: nid, error: "Node not found" }); continue; }
        n.remove();
        results.push({ nodeId: nid, deleted: true });
      }
      figma.commitUndo();
      return { type: request.type, requestId: request.requestId, data: { results } };
    }

    case "navigate_to_page": {
      const p = request.params || {};
      let page: PageNode | undefined;
      if (p.pageId) {
        const found = await figma.getNodeByIdAsync(p.pageId);
        if (!found) throw new Error(`Page not found: ${p.pageId}`);
        if (found.type !== "PAGE") throw new Error(`Node ${p.pageId} is not a PAGE`);
        page = found as PageNode;
      } else if (p.pageName) {
        page = figma.root.children.find((pg) => pg.name === p.pageName) as PageNode | undefined;
        if (!page) throw new Error(`Page not found with name: ${p.pageName}`);
      } else {
        throw new Error("pageId or pageName is required");
      }
      await figma.setCurrentPageAsync(page);
      return { type: request.type, requestId: request.requestId, data: { id: page.id, name: page.name } };
    }

    case "group_nodes": {
      const p = request.params || {};
      const nodeIds = request.nodeIds || [];
      if (nodeIds.length === 0) throw new Error("nodeIds is required");
      const nodes = await Promise.all(nodeIds.map((id: string) => figma.getNodeByIdAsync(id)));
      const validNodes = nodes.filter((n): n is SceneNode => n !== null && n.type !== "DOCUMENT" && n.type !== "PAGE");
      if (validNodes.length === 0) throw new Error("No valid scene nodes found");
      const parent = validNodes[0].parent;
      if (!parent) throw new Error("Nodes must have a parent");
      const group = figma.group(validNodes, parent as any);
      if (p.name) group.name = p.name;
      figma.commitUndo();
      return { type: request.type, requestId: request.requestId, data: { id: group.id, name: group.name, type: group.type } };
    }

    case "ungroup_nodes": {
      const nodeIds = request.nodeIds || [];
      if (nodeIds.length === 0) throw new Error("nodeIds is required");
      const results: any[] = [];
      for (const nid of nodeIds) {
        const n = await figma.getNodeByIdAsync(nid);
        if (!n) { results.push({ nodeId: nid, error: "Node not found" }); continue; }
        if (n.type !== "GROUP") { results.push({ nodeId: nid, error: "Node is not a GROUP" }); continue; }
        const group = n as GroupNode;
        const parent = group.parent as any;
        const index = parent.children.indexOf(group);
        const childIds: string[] = [];
        for (const child of [...group.children]) {
          parent.insertChild(index, child as SceneNode);
          childIds.push(child.id);
        }
        group.remove();
        results.push({ nodeId: nid, childIds });
      }
      figma.commitUndo();
      return { type: request.type, requestId: request.requestId, data: { results } };
    }

    default:
      return null;
  }
};
