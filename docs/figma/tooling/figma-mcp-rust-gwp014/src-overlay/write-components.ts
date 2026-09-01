import { getBounds } from "./serializers";

type SceneWithVariables = SceneNode & {
  setBoundVariable: (field: string, variable: Variable | null) => void;
};

type GwpEnvelope = {
  $gwpComponent: 1;
  operation: "recover-components-frame" | "prepare-base" | "prepare-content" | "capability-probe" | "build-family" | "build-content-family" | "repair-family-presets" | "audit";
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
  // Content components use the approved ink-navy silhouette. The previous
  // white-only edge disappeared on documentation canvases and made every card
  // read like a generic web tile instead of the approved puffy-sticker system.
  node.strokes = [bindPaint(v(resources, "GWP / Color Semantics/text/primary"))];
  bind(node, "strokeWeight", v(resources, "GWP / Layout/stroke/control"));
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
  booleanNodes?: Record<string, SceneNode>;
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

const makeWrappedText = async (
  name: string,
  characters: string,
  width: number,
  resources: Awaited<ReturnType<typeof loadGwpResources>>,
  options: { strong?: boolean; scale?: "body" | "caption" | "micro"; color?: Variable } = {},
) => {
  const text = await makeText(name, characters, resources, options);
  text.textAutoResize = "HEIGHT";
  text.resize(width, options.scale === "micro" ? 16 : options.scale === "caption" ? 20 : 24);
  return text;
};

const applySimpleSurface = (
  node: FrameNode | RectangleNode | EllipseNode,
  resources: Awaited<ReturnType<typeof loadGwpResources>>,
  fill: Variable,
  radius = "GWP / Layout/radius/12",
) => {
  node.fills = [bindPaint(fill)];
  node.strokes = [bindPaint(v(resources, "GWP / Color Semantics/text/primary"))];
  bind(node, "strokeWeight", v(resources, "GWP / Layout/stroke/control"));
  if (node.type === "FRAME" || node.type === "RECTANGLE") bind(node, "cornerRadius", v(resources, radius));
};

const findComponentSet = (scope: FrameNode, name: string) => {
  const set = scope.findOne((node) => node.type === "COMPONENT_SET" && node.name === name);
  if (!set || set.type !== "COMPONENT_SET") throw new Error(`Required component set missing: ${name}`);
  return set;
};

const appendVariantInstance = (
  parent: ComponentNode | FrameNode,
  scope: FrameNode,
  setName: string,
  variantName: string,
  layerName: string,
) => {
  const set = findComponentSet(scope, setName);
  const component = set.children.find((child) => child.type === "COMPONENT" && child.name === variantName);
  if (!component || component.type !== "COMPONENT") throw new Error(`Variant missing: ${setName}/${variantName}`);
  const instance = component.createInstance();
  instance.name = layerName;
  parent.appendChild(instance);
  return instance;
};

const setInstanceProperty = (instance: InstanceNode, propertyName: string, value: string | boolean) => {
  const key = Object.keys(instance.componentProperties).find((candidate) => candidate.split("#")[0] === propertyName);
  if (key) instance.setProperties({ [key]: value });
};

const createPreviewSlot = async (
  parent: ComponentNode | FrameNode,
  name: string,
  label: string,
  width: number,
  height: number,
  resources: Awaited<ReturnType<typeof loadGwpResources>>,
  fill = v(resources, "GWP / Color Semantics/accent"),
) => {
  const slot = figma.createFrame();
  slot.name = name;
  slot.resize(width, height);
  configureAutoLayout(slot, "VERTICAL");
  slot.primaryAxisSizingMode = "FIXED";
  slot.counterAxisSizingMode = "FIXED";
  applySimpleSurface(slot, resources, fill, "GWP / Layout/radius/20");
  const art = figma.createFrame();
  art.name = `${name}/Illustration`;
  const artWidth = Math.max(24, Math.min(width - 16, 120));
  const artHeight = Math.max(24, Math.min(height - 12, 84));
  art.resize(artWidth, artHeight);
  art.fills = [];
  art.clipsContent = false;
  slot.appendChild(art);

  const addRect = (layerName: string, x: number, y: number, w: number, h: number, color: Variable, radius = 6) => {
    const node = figma.createRectangle();
    node.name = `${name}/${layerName}`;
    node.resize(w, h);
    node.x = x;
    node.y = y;
    node.cornerRadius = radius;
    node.fills = [bindPaint(color)];
    node.strokes = [bindPaint(v(resources, "GWP / Color Semantics/text/primary"))];
    bind(node, "strokeWeight", v(resources, "GWP / Layout/stroke/control"));
    art.appendChild(node);
    return node;
  };
  const addEllipse = (layerName: string, x: number, y: number, w: number, h: number, color: Variable) => {
    const node = figma.createEllipse();
    node.name = `${name}/${layerName}`;
    node.resize(w, h);
    node.x = x;
    node.y = y;
    node.fills = [bindPaint(color)];
    node.strokes = [bindPaint(v(resources, "GWP / Color Semantics/text/primary"))];
    bind(node, "strokeWeight", v(resources, "GWP / Layout/stroke/control"));
    art.appendChild(node);
    return node;
  };

  const key = `${name} ${label}`;
  const cx = artWidth / 2;
  const cy = artHeight / 2;
  if (/未知|剪影|\?/.test(key)) {
    addEllipse("Unknown/Silhouette", cx - 28, cy - 28, 56, 56, v(resources, "GWP / Color Semantics/disabled"));
    const mark = await makeText(`${name}/Unknown Mark`, "?", resources, { strong: true });
    art.appendChild(mark);
    mark.x = cx - 6;
    mark.y = cy - 14;
  } else if (/橡皮鸭|鸭/.test(key)) {
    addEllipse("Duck/Body", cx - 30, cy - 10, 60, 42, v(resources, "GWP / Color Semantics/brand"));
    addEllipse("Duck/Head", cx - 17, cy - 32, 36, 36, v(resources, "GWP / Color Semantics/brand"));
    addEllipse("Duck/Eye", cx + 5, cy - 22, 6, 6, v(resources, "GWP / Color Semantics/text/primary"));
    addEllipse("Duck/Beak", cx + 15, cy - 17, 24, 12, v(resources, "GWP / Color Semantics/danger"));
    addEllipse("Duck/Wing", cx - 22, cy + 1, 30, 20, v(resources, "GWP / Color Semantics/brand"));
  } else if (/Theme|厨房|工坊主题/.test(key)) {
    addRect("Workshop/Board", cx - 42, cy - 28, 84, 58, v(resources, "GWP / Color Semantics/surface"), 10);
    addRect("Workshop/Lamp Arm", cx - 30, cy - 18, 10, 42, v(resources, "GWP / Color Semantics/accent"), 5);
    addEllipse("Workshop/Lamp", cx - 42, cy - 30, 34, 24, v(resources, "GWP / Color Semantics/accent"));
    addRect("Workshop/Toolbox", cx, cy, 38, 28, v(resources, "GWP / Color Semantics/accent"), 6);
  } else if (/机器|模式|Skin/.test(key)) {
    addRect("Machine/Bed", cx - 38, cy + 18, 76, 16, v(resources, "GWP / Color Semantics/accent"), 8);
    addRect("Machine/Left Post", cx - 34, cy - 20, 12, 44, v(resources, "GWP / Color Semantics/brand"), 5);
    addRect("Machine/Right Post", cx + 22, cy - 20, 12, 44, v(resources, "GWP / Color Semantics/brand"), 5);
    addRect("Machine/Top", cx - 40, cy - 30, 80, 18, v(resources, "GWP / Color Semantics/brand"), 7);
    addEllipse("Machine/Press", cx - 15, cy - 14, 30, 38, v(resources, "GWP / Color Semantics/surface"));
    addRect("Machine/Hazard", cx - 22, cy - 2, 44, 8, v(resources, "GWP / Color Semantics/warning"), 3);
  } else if (/纸箱|Item|物品|Collection/.test(key)) {
    addRect("Box/Body", cx - 30, cy - 28, 60, 58, v(resources, "GWP / Color Semantics/warning"), 8);
    addRect("Box/Tape", cx - 6, cy - 28, 12, 58, v(resources, "GWP / Color Semantics/brand"), 2);
    addRect("Box/Seam", cx - 30, cy - 4, 60, 8, v(resources, "GWP / Color Semantics/surface"), 2);
  } else if (/Reward|奖励|星/.test(key)) {
    addRect("Gift/Box", cx - 30, cy - 12, 60, 42, v(resources, "GWP / Color Semantics/accent"), 8);
    addRect("Gift/Ribbon V", cx - 5, cy - 12, 10, 42, v(resources, "GWP / Color Semantics/danger"), 3);
    addRect("Gift/Ribbon H", cx - 34, cy - 20, 68, 14, v(resources, "GWP / Color Semantics/danger"), 5);
    addEllipse("Gift/Bow L", cx - 20, cy - 34, 22, 18, v(resources, "GWP / Color Semantics/danger"));
    addEllipse("Gift/Bow R", cx - 2, cy - 34, 22, 18, v(resources, "GWP / Color Semantics/danger"));
  } else {
    addEllipse("Duck/Body", cx - 30, cy - 10, 60, 42, v(resources, "GWP / Color Semantics/brand"));
    addEllipse("Duck/Head", cx - 17, cy - 32, 36, 36, v(resources, "GWP / Color Semantics/brand"));
    addEllipse("Duck/Eye", cx + 5, cy - 22, 6, 6, v(resources, "GWP / Color Semantics/text/primary"));
    addEllipse("Duck/Beak", cx + 15, cy - 17, 24, 12, v(resources, "GWP / Color Semantics/danger"));
    addEllipse("Duck/Wing", cx - 22, cy + 1, 30, 20, v(resources, "GWP / Color Semantics/brand"));
  }
  parent.appendChild(slot);
  return slot;
};

const createStatusText = async (
  parent: ComponentNode | FrameNode,
  name: string,
  text: string,
  resources: Awaited<ReturnType<typeof loadGwpResources>>,
  tone: "normal" | "success" | "warning" | "danger" = "normal",
) => {
  const color = tone === "success"
    ? v(resources, "GWP / Color Semantics/success")
    : tone === "warning"
      ? v(resources, "GWP / Color Semantics/warning")
      : tone === "danger"
        ? v(resources, "GWP / Color Semantics/danger")
        : v(resources, "GWP / Color Semantics/text/secondary");
  const node = await makeText(name, text, resources, { strong: tone !== "normal", scale: "micro", color });
  parent.appendChild(node);
  return node;
};

const createTopBarVariants = async (base: FrameNode, resources: Awaited<ReturnType<typeof loadGwpResources>>) => {
  const records: VariantRecord[] = [];
  for (const context of ["Home", "Page"]) {
    for (const state of ["Default", "Scrolled", "Offline"]) {
      const component = figma.createComponent();
      component.name = `Context=${context}, State=${state}`;
      component.resize(360, 72);
      configureAutoLayout(component, "HORIZONTAL");
      component.primaryAxisSizingMode = "FIXED";
      component.counterAxisSizingMode = "FIXED";
      bind(component, "width", v(resources, "GWP / Layout/size/canvas-base-width"));
      applySpacing(component, resources, "GWP / Layout/spacing/16", "GWP / Layout/spacing/8", "GWP / Layout/spacing/8");
      await applyContainerTokens(component, resources, state === "Scrolled" ? v(resources, "GWP / Color Semantics/brand") : v(resources, "GWP / Color Semantics/surface"), "Default", "GWP / Layout/radius/20");
      const back = appendVariantInstance(component, base, "GWP/A-IconButton", "Role=Back, Size=44, State=Default", "Back Action");
      back.visible = context === "Page";
      const title = await makeText("Title", context === "Home" ? "给我压扁！" : "主题工坊", resources, { strong: true });
      component.appendChild(title);
      title.layoutGrow = 1;
      const resource = figma.createFrame();
      resource.name = "Resource Capsule";
      resource.resize(state === "Offline" ? 72 : 76, 40);
      configureAutoLayout(resource, "HORIZONTAL");
      resource.primaryAxisSizingMode = "FIXED";
      resource.counterAxisSizingMode = "FIXED";
      applySpacing(resource, resources, "GWP / Layout/spacing/12", "GWP / Layout/spacing/8", "GWP / Layout/spacing/4");
      await applyContainerTokens(resource, resources, state === "Offline" ? v(resources, "GWP / Color Semantics/warning") : v(resources, "GWP / Color Semantics/accent"), "Default", "GWP / Layout/radius/20");
      const resourceGlyph = await makeText("Resource Glyph", state === "Offline" ? "×" : "★", resources, { strong: true });
      const resourceValue = await makeText("Resource Value", state === "Offline" ? "离线" : "9", resources, { strong: true, scale: "caption" });
      resource.appendChild(resourceGlyph);
      resource.appendChild(resourceValue);
      component.appendChild(resource);
      const settings = figma.createFrame();
      settings.name = "Settings Action";
      settings.resize(44, 44);
      configureAutoLayout(settings, "VERTICAL");
      settings.primaryAxisSizingMode = "FIXED";
      settings.counterAxisSizingMode = "FIXED";
      await applyContainerTokens(settings, resources, v(resources, "GWP / Color Semantics/surface"), "Default", "GWP / Layout/radius/20");
      const settingsGlyph = await makeText("Settings Glyph", "≡", resources, { strong: true });
      settings.appendChild(settingsGlyph);
      component.appendChild(settings);
      records.push({
        component,
        labels: { Title: title },
        booleanNodes: { "Show Back": back, "Show Resource": resource, "Show Settings": settings },
      });
    }
  }
  return records;
};

const createBottomNavVariants = async (base: FrameNode, resources: Awaited<ReturnType<typeof loadGwpResources>>) => {
  const records: VariantRecord[] = [];
  const navItems = [["Journey", "闯关"], ["Mode", "模式"], ["Collection", "图鉴"], ["Skin", "外观"]] as const;
  for (const selected of navItems.map(([key]) => key)) {
    for (const state of ["Default", "Badge", "Disabled"]) {
      const component = figma.createComponent();
      component.name = `Selected=${selected}, State=${state}`;
      component.resize(360, 76);
      configureAutoLayout(component, "HORIZONTAL");
      component.primaryAxisSizingMode = "FIXED";
      component.counterAxisSizingMode = "FIXED";
      bind(component, "width", v(resources, "GWP / Layout/size/canvas-base-width"));
      bind(component, "itemSpacing", v(resources, "GWP / Layout/spacing/4"));
      await applyContainerTokens(component, resources, v(resources, "GWP / Color Semantics/surface"), state === "Disabled" ? "Disabled" : "Default", "GWP / Layout/radius/20");
      const labels: Record<string, TextNode> = {};
      for (let index = 0; index < navItems.length; index++) {
        const [key, copy] = navItems[index];
        const item = figma.createFrame();
        item.name = `Nav Item/${key}`;
        item.resize(86, 64);
        configureAutoLayout(item, "VERTICAL");
        item.primaryAxisSizingMode = "FIXED";
        item.counterAxisSizingMode = "FIXED";
        item.fills = [bindPaint(key === selected ? v(resources, "GWP / Color Semantics/brand") : v(resources, "GWP / Color Semantics/surface"))];
        bind(item, "cornerRadius", v(resources, "GWP / Layout/radius/20"));
        const navGlyph = key === "Journey" ? "▣" : key === "Mode" ? "≡" : key === "Collection" ? "▦" : "★";
        const navIcon = await makeText(`Nav Icon/${key}`, navGlyph, resources, { strong: true });
        item.appendChild(navIcon);
        const label = await makeText(`Label ${index + 1}`, copy, resources, { strong: key === selected, scale: "micro" });
        item.appendChild(label);
        if (state === "Badge" && key === "Mode") {
          const badge = figma.createEllipse();
          badge.name = "Badge Dot";
          badge.resize(8, 8);
          badge.fills = [bindPaint(v(resources, "GWP / Color Semantics/danger"))];
          item.appendChild(badge);
        }
        component.appendChild(item);
        item.layoutGrow = 1;
        labels[`Label ${index + 1}`] = label;
      }
      records.push({ component, labels });
    }
  }
  return records;
};

const createModeCardVariants = async (base: FrameNode, resources: Awaited<ReturnType<typeof loadGwpResources>>) => {
  const records: VariantRecord[] = [];
  for (const state of ["Default", "Selected", "Locked", "Completed"]) {
    const component = figma.createComponent();
    component.name = `State=${state}`;
    component.resize(320, 208);
    configureAutoLayout(component, "VERTICAL");
    component.primaryAxisSizingMode = "FIXED";
    component.counterAxisSizingMode = "FIXED";
    applySpacing(component, resources, "GWP / Layout/spacing/16", "GWP / Layout/spacing/12", "GWP / Layout/spacing/8");
    await applyContainerTokens(component, resources, state === "Selected" ? v(resources, "GWP / Color Semantics/brand") : v(resources, "GWP / Color Semantics/surface"), "Default", "GWP / Layout/radius/28");
    const preview = await createPreviewSlot(component, "Mode Preview", "冲压机模式", 288, 72, resources);
    const title = await makeText("Title", "自由解压", resources, { strong: true });
    component.appendChild(title);
    const description = await makeWrappedText("Description", "选喜欢的东西，想压多久都行，也可以慢慢试出最舒服的力度。", 288, resources, { scale: "caption" });
    component.appendChild(description);
    await createStatusText(component, "Record", state === "Locked" ? "完成第 3 关解锁" : state === "Completed" ? "今日已完成" : "已解锁 8 件", resources, state === "Locked" ? "warning" : state === "Completed" ? "success" : "normal");
    records.push({ component, labels: { Title: title, Description: description }, booleanNodes: { "Show Preview": preview } });
  }
  return records;
};

const createThemeCardVariants = async (base: FrameNode, resources: Awaited<ReturnType<typeof loadGwpResources>>) => {
  const records: VariantRecord[] = [];
  for (const state of ["Default", "Selected", "Locked", "Completed"]) {
    const component = figma.createComponent();
    component.name = `State=${state}`;
    component.resize(320, 260);
    configureAutoLayout(component, "VERTICAL");
    component.primaryAxisSizingMode = "FIXED";
    component.counterAxisSizingMode = "FIXED";
    applySpacing(component, resources, "GWP / Layout/spacing/16", "GWP / Layout/spacing/12", "GWP / Layout/spacing/8");
    await applyContainerTokens(component, resources, state === "Selected" ? v(resources, "GWP / Color Semantics/brand") : v(resources, "GWP / Color Semantics/surface"), "Default", "GWP / Layout/radius/28");
    const preview = await createPreviewSlot(component, "Theme Preview", "桌面工坊主题", 288, 104, resources, state === "Locked" ? v(resources, "GWP / Color Semantics/disabled") : v(resources, "GWP / Color Semantics/accent"));
    const title = await makeText("Title", "桌面乱成团", resources, { strong: true });
    component.appendChild(title);
    const progress = appendVariantInstance(component, base, "GWP/A-Progress", `Kind=Linear, State=${state === "Completed" ? "Completed" : "Default"}`, "Theme Progress");
    progress.resize(288, 48);
    setInstanceProperty(progress, "Label", state === "Locked" ? "0/45" : state === "Completed" ? "45/45" : "9/45");
    await createStatusText(component, "Theme Status", state === "Locked" ? "再获得 21 星解锁" : state === "Completed" ? "15/15 · 结尾已解锁" : "4/15 关", resources, state === "Locked" ? "warning" : state === "Completed" ? "success" : "normal");
    records.push({ component, labels: { Title: title }, booleanNodes: { "Show Preview": preview } });
  }
  return records;
};

const createLevelCardVariants = async (base: FrameNode, resources: Awaited<ReturnType<typeof loadGwpResources>>) => {
  const records: VariantRecord[] = [];
  for (const state of ["Default", "Current", "Locked", "Completed", "Perfect"]) {
    const component = figma.createComponent();
    component.name = `State=${state}`;
    component.resize(112, 152);
    configureAutoLayout(component, "VERTICAL");
    component.primaryAxisSizingMode = "FIXED";
    component.counterAxisSizingMode = "FIXED";
    applySpacing(component, resources, "GWP / Layout/spacing/12", "GWP / Layout/spacing/12", "GWP / Layout/spacing/4");
    await applyContainerTokens(component, resources, state === "Current" ? v(resources, "GWP / Color Semantics/brand") : v(resources, "GWP / Color Semantics/surface"), "Default", "GWP / Layout/radius/20");
    const preview = await createPreviewSlot(component, "Level Badge", state === "Locked" ? "未知剪影" : "关卡冲压机", 88, 48, resources, state === "Locked" ? v(resources, "GWP / Color Semantics/disabled") : v(resources, "GWP / Color Semantics/accent"));
    const level = await makeText("Level", "05", resources, { strong: true });
    component.appendChild(level);
    const stars = await makeText("Stars", state === "Perfect" ? "★★★" : state === "Completed" ? "★★☆" : "☆☆☆", resources, { strong: true, scale: "caption" });
    component.appendChild(stars);
    await createStatusText(component, "Level Status", state === "Locked" ? "再得 3 星" : state === "Current" ? "当前" : state === "Perfect" ? "已压到极致" : state === "Completed" ? "已完成" : "可开始", resources, state === "Locked" ? "warning" : state === "Completed" || state === "Perfect" ? "success" : "normal");
    const reward = figma.createEllipse();
    reward.name = "Reward Hint";
    reward.resize(10, 10);
    reward.fills = [bindPaint(v(resources, "GWP / Color Semantics/danger"))];
    reward.visible = state === "Current";
    component.appendChild(reward);
    records.push({ component, labels: { Level: level }, booleanNodes: { "Show Preview": preview, "Show Reward": reward } });
  }
  return records;
};

const createCollectionCellVariants = async (_base: FrameNode, resources: Awaited<ReturnType<typeof loadGwpResources>>) => {
  const records: VariantRecord[] = [];
  for (const state of ["Unknown", "Discovered", "Partial", "Completed"]) {
    const component = figma.createComponent();
    component.name = `State=${state}`;
    component.resize(104, 160);
    configureAutoLayout(component, "VERTICAL");
    component.primaryAxisSizingMode = "FIXED";
    component.counterAxisSizingMode = "FIXED";
    applySpacing(component, resources, "GWP / Layout/spacing/8", "GWP / Layout/spacing/8", "GWP / Layout/spacing/4");
    await applyContainerTokens(component, resources, v(resources, "GWP / Color Semantics/surface"), "Default", "GWP / Layout/radius/20");
    const preview = await createPreviewSlot(component, "Item Thumbnail", state === "Unknown" ? "未知剪影" : "纸箱物品", 80, 80, resources, state === "Unknown" ? v(resources, "GWP / Color Semantics/disabled") : v(resources, "GWP / Color Semantics/accent"));
    const name = await makeWrappedText("Name", state === "Unknown" ? "未发现" : "震动闹钟", 88, resources, { strong: true, scale: "micro" });
    component.appendChild(name);
    const count = state === "Unknown" ? 0 : state === "Discovered" ? 1 : state === "Partial" ? 2 : 3;
    const progress = await makeText("Result Progress", `${"●".repeat(count)}${"○".repeat(3 - count)} ${count}/3`, resources, { strong: state === "Completed", scale: "micro" });
    component.appendChild(progress);
    records.push({ component, labels: state === "Unknown" ? undefined : { Name: name }, booleanNodes: { "Show Thumbnail": preview } });
  }
  return records;
};

const createItemDetailCardVariants = async (_base: FrameNode, resources: Awaited<ReturnType<typeof loadGwpResources>>) => {
  const records: VariantRecord[] = [];
  for (const result of ["Perfect", "Under", "Over"]) {
    for (const state of ["Default", "Empty"]) {
      const component = figma.createComponent();
      component.name = `Result=${result}, State=${state}`;
      component.resize(320, 304);
      configureAutoLayout(component, "VERTICAL");
      component.primaryAxisSizingMode = "FIXED";
      component.counterAxisSizingMode = "FIXED";
      applySpacing(component, resources, "GWP / Layout/spacing/16", "GWP / Layout/spacing/12", "GWP / Layout/spacing/8");
      await applyContainerTokens(component, resources, v(resources, "GWP / Color Semantics/surface"), "Default", "GWP / Layout/radius/28");
      const preview = await createPreviewSlot(component, "Item Detail Preview", state === "Empty" ? "结果剪影" : "橡皮鸭物品", 288, 112, resources, state === "Empty" ? v(resources, "GWP / Color Semantics/disabled") : v(resources, "GWP / Color Semantics/accent"));
      const title = await makeText("Title", state === "Empty" ? "还没见过这个结果" : "震动闹钟", resources, { strong: true });
      component.appendChild(title);
      const material = await makeWrappedText("Material", state === "Empty" ? "在第 5 关试试更早松手" : "脆性 · 一开始很硬，突然就碎，还会蹦出几颗小零件。", 288, resources, { scale: "caption" });
      component.appendChild(material);
      const resultName = result === "Perfect" ? "完美" : result === "Under" ? "欠压" : "过压";
      await createStatusText(component, "Result Name", resultName, resources, result === "Perfect" ? "success" : result === "Over" ? "danger" : "warning");
      const stats = state === "Empty" ? "发现 0 次 · 最佳 0 分" : result === "Over" ? "按压 999 次 · 最佳 99,999 分" : "发现 12 次 · 最佳 8,460 分";
      await createStatusText(component, "Stats", stats, resources);
      records.push({ component, labels: state === "Default" ? { Title: title, Material: material } : undefined, booleanNodes: { "Show Preview": preview } });
    }
  }
  return records;
};

const createSkinCardVariants = async (_base: FrameNode, resources: Awaited<ReturnType<typeof loadGwpResources>>) => {
  const records: VariantRecord[] = [];
  for (const state of ["Locked", "Unlockable", "Selected", "Applied"]) {
    const component = figma.createComponent();
    component.name = `State=${state}`;
    component.resize(160, 224);
    configureAutoLayout(component, "VERTICAL");
    component.primaryAxisSizingMode = "FIXED";
    component.counterAxisSizingMode = "FIXED";
    applySpacing(component, resources, "GWP / Layout/spacing/12", "GWP / Layout/spacing/12", "GWP / Layout/spacing/8");
    await applyContainerTokens(component, resources, state === "Selected" || state === "Applied" ? v(resources, "GWP / Color Semantics/brand") : v(resources, "GWP / Color Semantics/surface"), "Default", "GWP / Layout/radius/20");
    const preview = await createPreviewSlot(component, "Skin Preview", state === "Locked" ? "外观剪影" : "薄荷机器外观", 136, 104, resources, state === "Locked" ? v(resources, "GWP / Color Semantics/disabled") : v(resources, "GWP / Color Semantics/accent"));
    const title = await makeWrappedText("Title", "薄荷冲压机", 136, resources, { strong: true, scale: "caption" });
    component.appendChild(title);
    const status = state === "Locked" ? "完成“奇怪解压所”第 15 关解锁" : state === "Unlockable" ? "可解锁" : state === "Selected" ? "已选中" : "使用中";
    const statusText = await makeWrappedText("Skin Status", status, 136, resources, { strong: state !== "Locked", scale: "micro" });
    component.appendChild(statusText);
    records.push({ component, labels: { Title: title }, booleanNodes: { "Show Preview": preview } });
  }
  return records;
};

const createRewardCardVariants = async (_base: FrameNode, resources: Awaited<ReturnType<typeof loadGwpResources>>) => {
  const records: VariantRecord[] = [];
  const copies: Record<string, string> = { Reward: "获得 2 星", Item: "震动闹钟", Theme: "厨房别炸锅", Skin: "薄荷冲压机" };
  const artLabels: Record<string, string> = { Reward: "奖励礼盒", Item: "纸箱物品", Theme: "桌面工坊主题", Skin: "薄荷机器外观" };
  for (const kind of ["Reward", "Item", "Theme", "Skin"]) {
    for (const state of ["Granted", "Claimed"]) {
      const component = figma.createComponent();
      component.name = `Kind=${kind}, State=${state}`;
      component.resize(160, 192);
      configureAutoLayout(component, "VERTICAL");
      component.primaryAxisSizingMode = "FIXED";
      component.counterAxisSizingMode = "FIXED";
      applySpacing(component, resources, "GWP / Layout/spacing/12", "GWP / Layout/spacing/12", "GWP / Layout/spacing/8");
      await applyContainerTokens(component, resources, state === "Granted" ? v(resources, "GWP / Color Semantics/brand") : v(resources, "GWP / Color Semantics/surface"), "Default", "GWP / Layout/radius/20");
      const preview = await createPreviewSlot(component, "Reward Art", artLabels[kind], 136, 88, resources);
      const title = await makeWrappedText("Title", copies[kind], 136, resources, { strong: true, scale: "caption" });
      component.appendChild(title);
      await createStatusText(component, "Reward Status", state === "Granted" ? "新获得" : "已收下", resources, state === "Granted" ? "success" : "normal");
      records.push({ component, booleanNodes: { "Show Reward Art": preview } });
    }
  }
  return records;
};

const createUnlockPanelVariants = async (base: FrameNode, resources: Awaited<ReturnType<typeof loadGwpResources>>) => {
  const records: VariantRecord[] = [];
  const componentsFrame = base.parent;
  if (!componentsFrame || componentsFrame.type !== "FRAME") throw new Error("Content frame has no 02_Components parent");
  for (const kind of ["Item", "Theme", "Skin"]) {
    for (const state of ["Revealing", "Ready"]) {
      const component = figma.createComponent();
      component.name = `Kind=${kind}, State=${state}`;
      component.resize(320, 272);
      configureAutoLayout(component, "VERTICAL");
      component.primaryAxisSizingMode = "FIXED";
      component.counterAxisSizingMode = "FIXED";
      applySpacing(component, resources, "GWP / Layout/spacing/16", "GWP / Layout/spacing/16", "GWP / Layout/spacing/8");
      await applyContainerTokens(component, resources, v(resources, "GWP / Color Semantics/surface"), "Default", "GWP / Layout/radius/28");
      const title = await makeText("Title", state === "Revealing" ? "正在拆开奖励…" : "解锁新东西！", resources, { strong: true });
      component.appendChild(title);
      const rewardSet = findComponentSet(componentsFrame, "GWP/C-RewardCard");
      const rewardVariant = rewardSet.children.find((child) => child.type === "COMPONENT" && child.name === `Kind=${kind}, State=Granted`);
      if (!rewardVariant || rewardVariant.type !== "COMPONENT") throw new Error(`Reward variant missing for ${kind}`);
      const reward = rewardVariant.createInstance();
      reward.name = "Reward Card";
      component.appendChild(reward);
      const description = await makeWrappedText("Description", kind === "Item" ? "震动闹钟加入烦恼图鉴" : kind === "Theme" ? "厨房别炸锅开门了" : "薄荷冲压机已解锁", 288, resources, { scale: "caption" });
      component.appendChild(description);
      const action = appendVariantInstance(component, base, "GWP/A-Button", "Role=Primary, Size=M, State=Default", "Primary Action");
      setInstanceProperty(action, "Label", state === "Ready" ? "收下" : "处理中…");
      records.push({ component, labels: { Title: title }, booleanNodes: { "Show Reward": reward } });
    }
  }
  return records;
};

const createAchievementCardVariants = async (base: FrameNode, resources: Awaited<ReturnType<typeof loadGwpResources>>) => {
  const records: VariantRecord[] = [];
  for (const state of ["Pending", "InProgress", "Completed", "Claimed"]) {
    const component = figma.createComponent();
    component.name = `State=${state}`;
    component.resize(320, 220);
    configureAutoLayout(component, "VERTICAL");
    component.primaryAxisSizingMode = "FIXED";
    component.counterAxisSizingMode = "FIXED";
    applySpacing(component, resources, "GWP / Layout/spacing/16", "GWP / Layout/spacing/12", "GWP / Layout/spacing/8");
    await applyContainerTokens(component, resources, state === "Completed" ? v(resources, "GWP / Color Semantics/brand") : v(resources, "GWP / Color Semantics/surface"), "Default", "GWP / Layout/radius/20");
    const header = figma.createFrame();
    header.name = "Achievement Header";
    header.resize(288, 72);
    configureAutoLayout(header, "HORIZONTAL");
    header.primaryAxisSizingMode = "FIXED";
    header.counterAxisSizingMode = "FIXED";
    bind(header, "itemSpacing", v(resources, "GWP / Layout/spacing/12"));
    header.fills = [];
    component.appendChild(header);
    const badge = await createPreviewSlot(header, "Achievement Badge", "奖励星徽", 72, 72, resources);
    const copy = figma.createFrame();
    copy.name = "Achievement Copy";
    copy.resize(204, 72);
    configureAutoLayout(copy, "VERTICAL");
    copy.primaryAxisSizingMode = "FIXED";
    copy.counterAxisSizingMode = "FIXED";
    bind(copy, "itemSpacing", v(resources, "GWP / Layout/spacing/4"));
    copy.fills = [];
    header.appendChild(copy);
    const title = await makeText("Title", "弹回来三次", resources, { strong: true });
    copy.appendChild(title);
    const description = await makeWrappedText("Description", "连续让 3 件弹性物品欠压回弹，看看它们能不能自己站起来。", 204, resources, { scale: "caption" });
    copy.appendChild(description);
    const progressState = state === "Completed" || state === "Claimed" ? "Completed" : "Default";
    const progress = appendVariantInstance(component, base, "GWP/A-Progress", `Kind=Linear, State=${progressState}`, "Achievement Progress");
    progress.resize(288, 48);
    setInstanceProperty(progress, "Label", state === "Pending" ? "0/3" : state === "InProgress" ? "2/3" : "3/3");
    await createStatusText(component, "Achievement Status", state === "Pending" ? "未完成" : state === "InProgress" ? "进行中" : state === "Completed" ? "收下奖励" : "已领取", resources, state === "Completed" ? "success" : "normal");
    records.push({ component, labels: { Title: title, Description: description }, booleanNodes: { "Show Badge": badge } });
  }
  return records;
};

const contentFamilyConfig: Record<string, { setName: string; title: string; description: string; usage: string; columns: number; creator: Function }> = {
  TopBar: { setName: "GWP/C-TopBar", title: "TopBar", description: "Home/Page 上下文与 Default、Scrolled、Offline 状态，组合返回、标题、资源与设置入口。", usage: "用于非游戏页顶部导航；禁止覆盖平台胶囊与安全区。", columns: 3, creator: createTopBarVariants },
  BottomNav: { setName: "GWP/C-BottomNav", title: "BottomNav", description: "闯关、模式、图鉴、外观四项主导航，覆盖选中、红点与禁用。", usage: "只用于四个主导航根页；游戏中与详情页不得常驻。", columns: 3, creator: createBottomNavVariants },
  ModeCard: { setName: "GWP/C-ModeCard", title: "ModeCard", description: "模式插画、规则、记录与 Default、Selected、Locked、Completed。", usage: "用于模式选择；规则最多两行，锁定必须给出可验证条件。", columns: 4, creator: createModeCardVariants },
  ThemeCard: { setName: "GWP/C-ThemeCard", title: "ThemeCard", description: "主题背景预览、进度、锁定、选中与完成。", usage: "用于主题切换；背景只承载视觉，不烘焙标题和星数。", columns: 4, creator: createThemeCardVariants },
  LevelCard: { setName: "GWP/C-LevelCard", title: "LevelCard", description: "关号、0–3 星、当前、锁定、完成、Perfect 与奖励提示。", usage: "用于 15 关网格；锁定卡不可触发开始动作。", columns: 5, creator: createLevelCardVariants },
  CollectionCell: { setName: "GWP/C-CollectionCell", title: "CollectionCell", description: "未知、已发现、三结果进度与完成图鉴格。", usage: "缩略图不含名称文字；未知态只展示剪影与 0/3。", columns: 4, creator: createCollectionCellVariants },
  ItemDetailCard: { setName: "GWP/C-ItemDetailCard", title: "ItemDetailCard", description: "物品大图、材质说明、完美/欠压/过压与 0/最大统计。", usage: "文字与统计必须是可编辑层；图片失败不能隐藏材质信息。", columns: 3, creator: createItemDetailCardVariants },
  SkinCard: { setName: "GWP/C-SkinCard", title: "SkinCard", description: "未解锁、可解锁、已选中与已装备外观卡。", usage: "只改变表现；不得出现购买或战力文案。", columns: 4, creator: createSkinCardVariants },
  RewardCard: { setName: "GWP/C-RewardCard", title: "RewardCard", description: "普通奖励、新物品、新主题与新外观的获得/已领取状态。", usage: "奖励只能展示已经确定的本地结果，不重复发放。", columns: 4, creator: createRewardCardVariants },
  UnlockPanel: { setName: "GWP/C-UnlockPanel", title: "UnlockPanel", description: "新物品、新主题与新外观的 Revealing/Ready 解锁面板。", usage: "一次只突出一个主要解锁，复用 RewardCard 与基础按钮。", columns: 3, creator: createUnlockPanelVariants },
  AchievementCard: { setName: "GWP/C-AchievementCard", title: "AchievementCard", description: "未完成、进行中、完成与已领取成就卡。", usage: "条件与进度必须可理解；隐藏成就另由屏幕层决定文案。", columns: 4, creator: createAchievementCardVariants },
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

const wireContentProperties = (
  set: ComponentSetNode,
  records: VariantRecord[],
  family: string,
) => {
  const propertyKeys: Record<string, string> = {};
  const addTextProperty = (property: string, fallback: string, selector: (record: VariantRecord) => TextNode | undefined) => {
    const key = set.addComponentProperty(property, "TEXT", fallback);
    propertyKeys[property] = key;
    for (const record of records) {
      const node = selector(record);
      if (node) node.componentPropertyReferences = { ...(node.componentPropertyReferences ?? {}), characters: key };
    }
  };
  const addBooleanProperty = (property: string, fallback: boolean, selector: (record: VariantRecord) => SceneNode | undefined) => {
    const key = set.addComponentProperty(property, "BOOLEAN", fallback);
    propertyKeys[property] = key;
    for (const record of records) {
      const node = selector(record);
      if (node) node.componentPropertyReferences = { ...(node.componentPropertyReferences ?? {}), visible: key };
    }
  };

  if (family === "TopBar") {
    addTextProperty("Title", "主题工坊", (record) => /Context=Page/.test(record.component.name) ? record.labels?.Title : undefined);
    addBooleanProperty("Show Back", false, (record) => /Context=Home/.test(record.component.name) ? record.booleanNodes?.["Show Back"] : undefined);
    addBooleanProperty("Show Resource", true, (record) => record.booleanNodes?.["Show Resource"]);
    addBooleanProperty("Show Settings", true, (record) => record.booleanNodes?.["Show Settings"]);
  } else if (family === "BottomNav") {
    addTextProperty("Journey Label", "闯关", (record) => record.labels?.["Label 1"]);
    addTextProperty("Mode Label", "模式", (record) => record.labels?.["Label 2"]);
    addTextProperty("Collection Label", "图鉴", (record) => record.labels?.["Label 3"]);
    addTextProperty("Skin Label", "外观", (record) => record.labels?.["Label 4"]);
  } else if (family === "ModeCard") {
    addTextProperty("Title", "自由解压", (record) => record.labels?.Title);
    addTextProperty("Description", "选喜欢的东西，想压多久都行，也可以慢慢试出最舒服的力度。", (record) => record.labels?.Description);
    addBooleanProperty("Show Preview", true, (record) => record.booleanNodes?.["Show Preview"]);
  } else if (family === "ThemeCard") {
    addTextProperty("Title", "桌面乱成团", (record) => record.labels?.Title);
    addBooleanProperty("Show Preview", true, (record) => record.booleanNodes?.["Show Preview"]);
  } else if (family === "LevelCard") {
    addTextProperty("Level", "05", (record) => record.labels?.Level);
    addBooleanProperty("Show Reward", false, (record) => /State=Current/.test(record.component.name) ? undefined : record.booleanNodes?.["Show Reward"]);
  } else if (family === "CollectionCell") {
    addTextProperty("Name", "震动闹钟", (record) => record.labels?.Name);
    addBooleanProperty("Show Thumbnail", true, (record) => record.booleanNodes?.["Show Thumbnail"]);
  } else if (family === "ItemDetailCard") {
    addTextProperty("Title", "震动闹钟", (record) => record.labels?.Title);
    addTextProperty("Material", "脆性 · 一开始很硬，突然就碎，还会蹦出几颗小零件。", (record) => record.labels?.Material);
    addBooleanProperty("Show Preview", true, (record) => record.booleanNodes?.["Show Preview"]);
  } else if (family === "SkinCard") {
    addTextProperty("Title", "薄荷冲压机", (record) => record.labels?.Title);
    addBooleanProperty("Show Preview", true, (record) => record.booleanNodes?.["Show Preview"]);
  } else if (family === "RewardCard") {
    addBooleanProperty("Show Reward Art", true, (record) => record.booleanNodes?.["Show Reward Art"]);
  } else if (family === "UnlockPanel") {
    addTextProperty("Title", "解锁新东西！", (record) => /State=Ready/.test(record.component.name) ? record.labels?.Title : undefined);
    addBooleanProperty("Show Reward", true, (record) => record.booleanNodes?.["Show Reward"]);
  } else if (family === "AchievementCard") {
    addTextProperty("Title", "弹回来三次", (record) => record.labels?.Title);
    addTextProperty("Description", "连续让 3 件弹性物品欠压回弹，看看它们能不能自己站起来。", (record) => record.labels?.Description);
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

const syncComponentsLayout = (componentsFrame: FrameNode, content: FrameNode) => {
  componentsFrame.resizeWithoutConstraints(6080, content.y + content.height + 120);
  const section = componentsFrame.parent;
  const mutatedNodeIds: string[] = [componentsFrame.id, content.id];
  if (section?.type === "SECTION") {
    const firstRowY = componentsFrame.y + componentsFrame.height + 320;
    const positions: Record<string, [number, number]> = {
      "03_User_Flows": [160, firstRowY],
      "04_Core_Screens": [3280, firstRowY],
      "05_Modes_And_Collection": [160, firstRowY + 960],
      "06_Overlays_And_States": [3280, firstRowY + 960],
      "07_Prototype": [160, firstRowY + 1920],
      "08_Dev_Handoff": [3280, firstRowY + 1920],
      "99_Archive": [160, firstRowY + 2880],
    };
    for (const child of section.children) {
      const target = positions[child.name];
      if (target && "x" in child) {
        child.x = target[0];
        child.y = target[1];
        mutatedNodeIds.push(child.id);
      }
    }
    section.resizeWithoutConstraints(6400, firstRowY + 4060);
    mutatedNodeIds.push(section.id);
  }
  return mutatedNodeIds;
};

const prepareContent = async (componentsFrame: FrameNode, resources: Awaited<ReturnType<typeof loadGwpResources>>) => {
  const base = componentsFrame.findOne((node) => node.type === "FRAME" && node.name === "02_Components/Base");
  if (!base || base.type !== "FRAME") throw new Error("02_Components/Base is required before Content");
  let content = componentsFrame.findOne((node) => node.type === "FRAME" && node.name === "02_Components/Content") as FrameNode | null;
  const createdNodeIds: string[] = [];
  if (!content) {
    content = figma.createFrame();
    content.name = "02_Components/Content";
    content.resize(5840, 800);
    content.x = 120;
    content.y = base.y + base.height + 120;
    content.fills = [bindPaint(v(resources, "GWP / Color Semantics/surface"))];
    content.strokes = [bindPaint(v(resources, "GWP / Color Semantics/text/primary"))];
    bind(content, "strokeWeight", v(resources, "GWP / Layout/stroke/control"));
    bind(content, "cornerRadius", v(resources, "GWP / Layout/radius/28"));
    const raised = resources.effects.get("GWP/Effect/Surface/Raised");
    if (!raised) throw new Error("Missing GWP/Effect/Surface/Raised");
    await content.setEffectStyleIdAsync(raised.id);
    componentsFrame.appendChild(content);
    createdNodeIds.push(content.id);
  }
  const subtitle = componentsFrame.findOne((node) => node.type === "TEXT" && node.name === "placeholder/02_Components/subtitle") as TextNode | null;
  if (subtitle) {
    await figma.loadFontAsync(typeof subtitle.fontName === "symbol" ? { family: "Noto Sans SC", style: "Regular" } : subtitle.fontName);
    subtitle.characters = "GWP-015/016 · Base, navigation and content components · 逐个创建、验证与截图";
  }
  const mutatedNodeIds = syncComponentsLayout(componentsFrame, content);
  if (subtitle) mutatedNodeIds.push(subtitle.id);
  figma.commitUndo();
  return { contentId: content.id, baseId: base.id, createdNodeIds, mutatedNodeIds };
};

const buildContentFamily = async (
  content: FrameNode,
  family: string,
  resources: Awaited<ReturnType<typeof loadGwpResources>>,
) => {
  const config = contentFamilyConfig[family];
  if (!config) throw new Error(`Unsupported GWP content family: ${family}`);
  const existing = content.findOne((node) => node.type === "COMPONENT_SET" && node.name === config.setName) as ComponentSetNode | null;
  if (existing) return { skipped: true, family, componentSetId: existing.id, createdNodeIds: [], mutatedNodeIds: [], audit: await auditSet(existing) };
  const componentsFrame = content.parent;
  if (!componentsFrame || componentsFrame.type !== "FRAME" || componentsFrame.name !== "02_Components") throw new Error("Content must be inside 02_Components");
  const base = componentsFrame.findOne((node) => node.type === "FRAME" && node.name === "02_Components/Base");
  if (!base || base.type !== "FRAME") throw new Error("02_Components/Base is required for reuse");
  const docs = content.children.filter((node) => node.type === "FRAME" && node.name.startsWith("Content/")) as FrameNode[];
  const nextY = docs.length ? Math.max(...docs.map((frame) => frame.y + frame.height)) + 80 : 120;
  const doc = figma.createFrame();
  doc.name = `Content/${config.title}`;
  doc.resize(5640, 700);
  doc.x = 100;
  doc.y = nextY;
  doc.fills = [bindPaint(v(resources, "GWP / Color Primitives/white/0"))];
  doc.strokes = [bindPaint(v(resources, "GWP / Color Semantics/text/primary"))];
  bind(doc, "strokeWeight", v(resources, "GWP / Layout/stroke/control"));
  bind(doc, "cornerRadius", v(resources, "GWP / Layout/radius/20"));
  content.appendChild(doc);
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
  const propertyKeys = wireContentProperties(set, records, family);
  doc.resizeWithoutConstraints(5640, set.y + set.height + 80);
  content.resizeWithoutConstraints(5840, doc.y + doc.height + 100);
  const layoutMutations = syncComponentsLayout(componentsFrame, content);
  figma.commitUndo();
  const allCreated = [doc.id, ...docTextIds, set.id, ...components.map((component) => component.id)];
  for (const record of records) {
    if (record.icon) allCreated.push(record.icon.id);
    if (record.booleanNode) allCreated.push(record.booleanNode.id);
    if (record.booleanNodes) allCreated.push(...Object.values(record.booleanNodes).map((node) => node.id));
    if (record.labels) allCreated.push(...Object.values(record.labels).map((node) => node.id));
  }
  return {
    skipped: false,
    family,
    documentationFrameId: doc.id,
    componentSetId: set.id,
    variantIds: components.map((component) => component.id),
    propertyKeys,
    createdNodeIds: Array.from(new Set(allCreated)),
    mutatedNodeIds: Array.from(new Set([content.id, componentsFrame.id, ...layoutMutations])),
    audit: await auditSet(set),
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
      if (envelope.operation === "prepare-content") {
        if (node.type !== "FRAME" || node.name !== "02_Components") throw new Error("prepare-content must target 02_Components frame");
        const result = await prepareContent(node, resources);
        return { type: request.type, requestId: request.requestId, data: result };
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
      if (envelope.operation === "build-content-family") {
        if (node.type !== "FRAME" || node.name !== "02_Components/Content") throw new Error("build-content-family must target 02_Components/Content");
        if (!envelope.family) throw new Error("family is required");
        const result = await buildContentFamily(node, envelope.family, resources);
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
