var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
(function() {
  "use strict";
  const isMixed = (value) => typeof value === "symbol";
  const styleNameCache = /* @__PURE__ */ new Map();
  const clearStyleCache = () => styleNameCache.clear();
  const styleName = (id) => {
    let pending = styleNameCache.get(id);
    if (!pending) {
      pending = figma.getStyleByIdAsync(id).then((style) => style == null ? void 0 : style.name);
      styleNameCache.set(id, pending);
    }
    return pending;
  };
  const pixelRound = (v2) => Math.round(v2 * 100) / 100;
  const toHex = (color) => {
    const clamp = (v2) => Math.min(255, Math.max(0, Math.round(v2 * 255)));
    const [r, g, b] = [clamp(color.r), clamp(color.g), clamp(color.b)];
    return `#${[r, g, b].map((v2) => v2.toString(16).padStart(2, "0")).join("")}`;
  };
  const serializePaints = (paints) => {
    if (isMixed(paints)) return "mixed";
    if (!paints || !Array.isArray(paints)) return void 0;
    const result = paints.filter((paint) => paint.type === "SOLID" && "color" in paint).map((paint) => {
      const hex = toHex(paint.color);
      const opacity = paint.opacity != null ? paint.opacity : 1;
      if (opacity === 1) return hex;
      return hex + Math.round(opacity * 255).toString(16).padStart(2, "0");
    });
    return result.length > 0 ? result : void 0;
  };
  const getBounds = (node) => {
    if ("x" in node && "y" in node && "width" in node && "height" in node) {
      return {
        x: pixelRound(node.x),
        y: pixelRound(node.y),
        width: pixelRound(node.width),
        height: pixelRound(node.height)
      };
    }
    return void 0;
  };
  const serializeRgba = (color) => {
    if (!color || typeof color !== "object") return void 0;
    const hex = toHex(color);
    const a = color.a != null ? color.a : 1;
    if (a === 1) return hex;
    return hex + Math.round(a * 255).toString(16).padStart(2, "0");
  };
  const serializeEffects = (effects) => {
    if (isMixed(effects)) return "mixed";
    if (!effects || !Array.isArray(effects) || effects.length === 0) return void 0;
    return effects.map((e) => {
      const base = { type: e.type };
      if (e.visible === false) base.visible = false;
      if (e.blendMode && e.blendMode !== "NORMAL") base.blendMode = e.blendMode;
      switch (e.type) {
        case "DROP_SHADOW":
        case "INNER_SHADOW":
          return __spreadProps(__spreadValues({}, base), {
            color: serializeRgba(e.color),
            offset: e.offset ? { x: e.offset.x, y: e.offset.y } : void 0,
            radius: e.radius,
            spread: e.spread || void 0
          });
        case "LAYER_BLUR":
        case "BACKGROUND_BLUR":
          return __spreadProps(__spreadValues({}, base), { radius: e.radius });
        case "NOISE": {
          const out = __spreadProps(__spreadValues({}, base), {
            noiseType: e.noiseType,
            noiseSize: e.noiseSize,
            density: e.density,
            color: serializeRgba(e.color)
          });
          if (e.noiseType === "DUOTONE" && e.secondaryColor) {
            out.secondaryColor = serializeRgba(e.secondaryColor);
          }
          if (e.noiseType === "MULTITONE" && e.opacity != null) {
            out.opacity = e.opacity;
          }
          return out;
        }
        default:
          return __spreadValues(__spreadValues({}, base), e);
      }
    });
  };
  const serializeStyles = (node) => __async(null, null, function* () {
    const styles = {};
    if ("fills" in node) {
      if (node.fillStyleId && typeof node.fillStyleId === "string") {
        const name = yield styleName(node.fillStyleId);
        if (name) styles.fillStyle = name;
      }
      const fills = serializePaints(node.fills);
      if (fills !== void 0) styles.fills = fills;
    }
    if ("strokes" in node) {
      if (node.strokeStyleId && typeof node.strokeStyleId === "string") {
        const name = yield styleName(node.strokeStyleId);
        if (name) styles.strokeStyle = name;
      }
      const strokes = serializePaints(node.strokes);
      if (strokes !== void 0) styles.strokes = strokes;
    }
    if ("cornerRadius" in node) {
      const cr = isMixed(node.cornerRadius) ? "mixed" : node.cornerRadius;
      if (cr !== 0) styles.cornerRadius = cr;
    }
    if ("paddingLeft" in node) {
      styles.padding = {
        top: node.paddingTop,
        right: node.paddingRight,
        bottom: node.paddingBottom,
        left: node.paddingLeft
      };
    }
    if ("effects" in node) {
      if (node.effectStyleId && typeof node.effectStyleId === "string") {
        const name = yield styleName(node.effectStyleId);
        if (name) styles.effectStyle = name;
      }
      const effects = serializeEffects(node.effects);
      if (effects !== void 0) styles.effects = effects;
    }
    return styles;
  });
  const serializeLineHeight = (lineHeight) => {
    if (isMixed(lineHeight)) return "mixed";
    if (!lineHeight || lineHeight.unit === "AUTO") return void 0;
    return { value: lineHeight.value, unit: lineHeight.unit };
  };
  const serializeLetterSpacing = (letterSpacing) => {
    if (isMixed(letterSpacing)) return "mixed";
    if (!letterSpacing || letterSpacing.value === 0) return void 0;
    return { value: letterSpacing.value, unit: letterSpacing.unit };
  };
  const serializeText = (node, base) => __async(null, null, function* () {
    let fontFamily;
    let fontStyle;
    if (typeof node.fontName === "symbol") {
      fontFamily = "mixed";
      fontStyle = "mixed";
    } else if (node.fontName) {
      fontFamily = node.fontName.family;
      fontStyle = node.fontName.style;
    }
    const textStyleName = node.textStyleId && typeof node.textStyleId === "string" ? yield styleName(node.textStyleId) : void 0;
    return Object.assign({}, base, {
      characters: node.characters,
      styles: Object.assign({}, base.styles, __spreadProps(__spreadValues({}, textStyleName ? { textStyle: textStyleName } : {}), {
        fontSize: isMixed(node.fontSize) ? "mixed" : node.fontSize,
        fontFamily,
        fontStyle,
        fontWeight: isMixed(node.fontWeight) ? "mixed" : node.fontWeight,
        textDecoration: isMixed(node.textDecoration) ? "mixed" : node.textDecoration !== "NONE" ? node.textDecoration : void 0,
        lineHeight: serializeLineHeight(node.lineHeight),
        letterSpacing: serializeLetterSpacing(node.letterSpacing),
        textAlignHorizontal: isMixed(node.textAlignHorizontal) ? "mixed" : node.textAlignHorizontal
      }))
    });
  });
  const serializeNode = (node, depth = Infinity) => __async(null, null, function* () {
    const styles = yield serializeStyles(node);
    const base = {
      id: node.id,
      name: node.name,
      type: node.type,
      bounds: getBounds(node),
      styles
    };
    if (node.type === "TEXT") return serializeText(node, base);
    if ("children" in node) {
      if (depth <= 0) {
        return Object.assign({}, base, { childCount: node.children.length });
      }
      return Object.assign({}, base, {
        children: yield Promise.all(
          node.children.map((child) => serializeNode(child, depth - 1))
        )
      });
    }
    return base;
  });
  const deduplicateStyles = (tree) => {
    const counts = /* @__PURE__ */ new Map();
    const countWalk = (node) => {
      var _a, _b;
      if (!node || typeof node !== "object") return;
      const s = node.styles;
      if (s) {
        if (Array.isArray(s.fills)) {
          const k = JSON.stringify(s.fills);
          counts.set(k, ((_a = counts.get(k)) != null ? _a : 0) + 1);
        }
        if (Array.isArray(s.strokes)) {
          const k = JSON.stringify(s.strokes);
          counts.set(k, ((_b = counts.get(k)) != null ? _b : 0) + 1);
        }
      }
      if (Array.isArray(node.children)) node.children.forEach(countWalk);
    };
    countWalk(tree);
    let counter = 0;
    const keyToRef = /* @__PURE__ */ new Map();
    const refs = {};
    for (const [key, count] of counts) {
      if (count > 1) {
        const ref = `s${++counter}`;
        keyToRef.set(key, ref);
        refs[ref] = JSON.parse(key);
      }
    }
    if (keyToRef.size === 0) return { tree, globalVars: void 0 };
    const replaceWalk = (node) => {
      if (!node || typeof node !== "object") return node;
      let result = node;
      const s = node.styles;
      if (s) {
        let newStyles = s;
        if (Array.isArray(s.fills)) {
          const ref = keyToRef.get(JSON.stringify(s.fills));
          if (ref) newStyles = __spreadProps(__spreadValues({}, newStyles), { fills: ref });
        }
        if (Array.isArray(s.strokes)) {
          const ref = keyToRef.get(JSON.stringify(s.strokes));
          if (ref) newStyles = __spreadProps(__spreadValues({}, newStyles), { strokes: ref });
        }
        if (newStyles !== s) result = __spreadProps(__spreadValues({}, node), { styles: newStyles });
      }
      if (Array.isArray(node.children)) {
        const newChildren = node.children.map(replaceWalk);
        result = __spreadProps(__spreadValues({}, result), { children: newChildren });
      }
      return result;
    };
    return { tree: replaceWalk(tree), globalVars: { styles: refs } };
  };
  const serializeVariableValue = (value) => {
    if (typeof value !== "object" || value === null) return value;
    if ("type" in value && value.type === "VARIABLE_ALIAS") {
      return { type: "VARIABLE_ALIAS", id: value.id };
    }
    if ("r" in value && "g" in value && "b" in value) {
      return {
        type: "COLOR",
        r: value.r,
        g: value.g,
        b: value.b,
        a: "a" in value ? value.a : 1
      };
    }
    return value;
  };
  const handleReadDocumentRequest = (request) => __async(null, null, function* () {
    switch (request.type) {
      case "get_document": {
        const raw = yield serializeNode(figma.currentPage);
        const { tree, globalVars } = deduplicateStyles(raw);
        return {
          type: request.type,
          requestId: request.requestId,
          data: globalVars ? __spreadProps(__spreadValues({}, tree), { globalVars }) : tree
        };
      }
      case "get_selection":
        return {
          type: request.type,
          requestId: request.requestId,
          data: yield Promise.all(figma.currentPage.selection.map((node) => serializeNode(node)))
        };
      case "get_node": {
        const nodeId = request.nodeIds && request.nodeIds[0];
        if (!nodeId) throw new Error("nodeIds is required for get_node");
        const node = yield figma.getNodeByIdAsync(nodeId);
        if (!node || node.type === "DOCUMENT")
          throw new Error(`Node not found: ${nodeId}`);
        return {
          type: request.type,
          requestId: request.requestId,
          data: yield serializeNode(node)
        };
      }
      case "get_nodes_info": {
        if (!request.nodeIds || request.nodeIds.length === 0)
          throw new Error("nodeIds is required for get_nodes_info");
        const nodes = yield Promise.all(
          request.nodeIds.map((id) => figma.getNodeByIdAsync(id))
        );
        return {
          type: request.type,
          requestId: request.requestId,
          data: yield Promise.all(
            nodes.filter((n) => n !== null && n.type !== "DOCUMENT").map((n) => serializeNode(n))
          )
        };
      }
      case "get_design_context": {
        const depth = request.params && request.params.depth != null ? request.params.depth : 2;
        const detail = request.params && request.params.detail || "full";
        const dedupeComponents = !!(request.params && request.params.dedupeComponents);
        const componentDefs = /* @__PURE__ */ new Map();
        const serializeForDetail = (n) => __async(null, null, function* () {
          const base = { id: n.id, name: n.name, type: n.type, bounds: getBounds(n) };
          if (detail === "minimal") return base;
          const styles = yield serializeStyles(n);
          const result = Object.assign({}, base);
          if (Object.keys(styles).length > 0) result.styles = styles;
          if ("opacity" in n && n.opacity !== 1) result.opacity = n.opacity;
          if ("visible" in n && !n.visible) result.visible = false;
          if (detail === "compact") return result;
          return yield serializeNode(n);
        });
        const extractInstanceOverrides = (instanceNode, componentNode) => __async(null, null, function* () {
          var _a, _b;
          const overrides = [];
          if (!(instanceNode == null ? void 0 : instanceNode.children) || !(componentNode == null ? void 0 : componentNode.children)) return overrides;
          for (let i = 0; i < instanceNode.children.length; i++) {
            const instChild = instanceNode.children[i];
            const compChild = componentNode.children[i];
            if (!instChild || !compChild) continue;
            const propChanges = {};
            if ("visible" in instChild && "visible" in compChild && instChild.visible !== compChild.visible) {
              propChanges.visible = instChild.visible;
            }
            if ("opacity" in instChild && "opacity" in compChild && instChild.opacity !== compChild.opacity) {
              propChanges.opacity = instChild.opacity;
            }
            if ("fills" in instChild && "fills" in compChild && !isMixed(instChild.fills) && !isMixed(compChild.fills)) {
              if (JSON.stringify(instChild.fills) !== JSON.stringify(compChild.fills)) {
                propChanges.fills = instChild.fills;
              }
            }
            if (instChild.type === "TEXT") {
              const override = { id: instChild.id, name: instChild.name, type: "TEXT" };
              let hasChange = false;
              if (instChild.characters !== compChild.characters) {
                override.characters = instChild.characters;
                hasChange = true;
              }
              if (Object.keys(propChanges).length > 0) {
                Object.assign(override, propChanges);
                hasChange = true;
              }
              if (hasChange) overrides.push(override);
              continue;
            }
            if (instChild.type === "INSTANCE") {
              const [nestedMc, compMc] = yield Promise.all([
                instChild.getMainComponentAsync(),
                compChild.type === "INSTANCE" ? compChild.getMainComponentAsync() : Promise.resolve(null)
              ]);
              if ((nestedMc == null ? void 0 : nestedMc.id) !== (compMc == null ? void 0 : compMc.id)) {
                const override = { id: instChild.id, name: instChild.name, type: "INSTANCE", mainComponentId: (_a = nestedMc == null ? void 0 : nestedMc.id) != null ? _a : null };
                if (Object.keys(propChanges).length > 0) Object.assign(override, propChanges);
                overrides.push(override);
                continue;
              }
              if (Object.keys(propChanges).length > 0) {
                overrides.push(__spreadValues({ id: instChild.id, name: instChild.name, type: "INSTANCE", mainComponentId: (_b = nestedMc == null ? void 0 : nestedMc.id) != null ? _b : null }, propChanges));
              }
              if (nestedMc) overrides.push(...yield extractInstanceOverrides(instChild, nestedMc));
              continue;
            }
            if (Object.keys(propChanges).length > 0) {
              overrides.push(__spreadValues({ id: instChild.id, name: instChild.name, type: instChild.type }, propChanges));
            }
            if ("children" in instChild) {
              overrides.push(...yield extractInstanceOverrides(instChild, compChild));
            }
          }
          return overrides;
        });
        const serializeWithDepth = (node, currentDepth) => __async(null, null, function* () {
          var _a;
          if (dedupeComponents && node.type === "INSTANCE") {
            const mc = yield node.getMainComponentAsync();
            if (mc && !componentDefs.has(mc.id)) {
              componentDefs.set(mc.id, yield serializeNode(mc));
            }
            const props = {};
            if (node.componentProperties) {
              for (const [key, prop] of Object.entries(node.componentProperties)) {
                props[key] = prop.value;
              }
            }
            const result = {
              id: node.id,
              name: node.name,
              type: node.type,
              bounds: getBounds(node),
              mainComponentId: (_a = mc == null ? void 0 : mc.id) != null ? _a : null
            };
            if (Object.keys(props).length > 0) result.componentProperties = props;
            const overrides = yield extractInstanceOverrides(node, mc);
            if (overrides.length > 0) result.overrides = overrides;
            return result;
          }
          if (detail === "full") {
            const remaining = depth - currentDepth;
            if (!dedupeComponents) return yield serializeNode(node, remaining);
            const serialized2 = yield serializeNode(node, 0);
            if (remaining <= 0 || !("children" in node)) return serialized2;
            const serializedChildren2 = yield Promise.all(
              node.children.filter((n) => n.type !== "DOCUMENT").map((n) => serializeWithDepth(n, currentDepth + 1))
            );
            return Object.assign({}, serialized2, {
              children: serializedChildren2,
              childCount: void 0
            });
          }
          const serialized = yield serializeForDetail(node);
          const hasChildren = "children" in node && node.children.length > 0;
          if (!hasChildren) return serialized;
          if (currentDepth >= depth) {
            return Object.assign({}, serialized, { childCount: node.children.length });
          }
          const serializedChildren = yield Promise.all(
            node.children.filter((n) => n.type !== "DOCUMENT").map((n) => serializeWithDepth(n, currentDepth + 1))
          );
          return Object.assign({}, serialized, { children: serializedChildren });
        });
        const selection = figma.currentPage.selection;
        const rawContextNodes = selection.length > 0 ? yield Promise.all(
          selection.map((node) => serializeWithDepth(node, 0))
        ) : [yield serializeWithDepth(figma.currentPage, 0)];
        const { tree: dedupedNodes, globalVars } = deduplicateStyles({ children: rawContextNodes });
        const contextNodes = dedupedNodes.children;
        return {
          type: request.type,
          requestId: request.requestId,
          data: __spreadValues(__spreadValues({
            fileName: figma.root.name,
            currentPage: {
              id: figma.currentPage.id,
              name: figma.currentPage.name
            },
            selectionCount: selection.length,
            context: contextNodes
          }, componentDefs.size > 0 ? { componentDefs: Object.fromEntries(componentDefs) } : {}), globalVars ? { globalVars } : {})
        };
      }
      case "get_metadata":
        return {
          type: request.type,
          requestId: request.requestId,
          data: {
            fileName: figma.root.name,
            currentPageId: figma.currentPage.id,
            currentPageName: figma.currentPage.name,
            pageCount: figma.root.children.length,
            pages: figma.root.children.map((page) => ({
              id: page.id,
              name: page.name
            }))
          }
        };
      case "get_pages":
        return {
          type: request.type,
          requestId: request.requestId,
          data: {
            currentPageId: figma.currentPage.id,
            pages: figma.root.children.map((page) => ({
              id: page.id,
              name: page.name
            }))
          }
        };
      case "get_viewport":
        return {
          type: request.type,
          requestId: request.requestId,
          data: {
            center: { x: figma.viewport.center.x, y: figma.viewport.center.y },
            zoom: figma.viewport.zoom,
            bounds: {
              x: figma.viewport.bounds.x,
              y: figma.viewport.bounds.y,
              width: figma.viewport.bounds.width,
              height: figma.viewport.bounds.height
            }
          }
        };
      case "get_fonts": {
        const fontMap = /* @__PURE__ */ new Map();
        yield figma.currentPage.loadAsync();
        for (const n of figma.currentPage.findAllWithCriteria({ types: ["TEXT"] })) {
          const fontName = n.fontName;
          if (typeof fontName !== "symbol" && fontName) {
            const key = `${fontName.family}::${fontName.style}`;
            if (!fontMap.has(key)) {
              fontMap.set(key, { family: fontName.family, style: fontName.style, nodeCount: 0 });
            }
            fontMap.get(key).nodeCount++;
          }
        }
        const fonts = Array.from(fontMap.values()).sort((a, b) => b.nodeCount - a.nodeCount);
        const availableFonts = yield figma.listAvailableFontsAsync();
        const availableFamilyMap = /* @__PURE__ */ new Map();
        for (const available of availableFonts) {
          const family = available.fontName.family;
          const style = available.fontName.style;
          if (!availableFamilyMap.has(family)) {
            availableFamilyMap.set(family, /* @__PURE__ */ new Set());
          }
          availableFamilyMap.get(family).add(style);
        }
        const availableFamilies = Array.from(availableFamilyMap.keys()).sort();
        const cjkPattern = /(Noto Sans (SC|CJK)|Source Han Sans|思源|MiSans|HarmonyOS|Alibaba|OPPO Sans|PingFang|苹方)/i;
        const cjkCandidates = availableFamilies.filter((family) => cjkPattern.test(family)).map((family) => ({
          family,
          styles: Array.from(availableFamilyMap.get(family)).sort()
        }));
        return {
          type: request.type,
          requestId: request.requestId,
          data: {
            count: fonts.length,
            fonts,
            availableFamilyCount: availableFamilies.length,
            availableFamilies,
            cjkCandidates
          }
        };
      }
      case "search_nodes": {
        const query = request.params && request.params.query ? request.params.query.toLowerCase() : "";
        const scopeNodeId = request.params && request.params.nodeId;
        const types = request.params && request.params.types ? request.params.types : [];
        const limit = request.params && request.params.limit ? request.params.limit : 50;
        const root = scopeNodeId ? yield figma.getNodeByIdAsync(scopeNodeId) : figma.currentPage;
        if (!root) throw new Error(`Node not found: ${scopeNodeId}`);
        if (root.type === "PAGE") yield root.loadAsync();
        const typeSet = new Set(types);
        const results = [];
        const search = (n) => {
          if (results.length >= limit) return;
          if (n !== root) {
            const nameMatch = !query || n.name.toLowerCase().includes(query);
            const typeMatch = typeSet.size === 0 || typeSet.has(n.type);
            if (nameMatch && typeMatch) {
              results.push({
                id: n.id,
                name: n.name,
                type: n.type,
                bounds: getBounds(n)
              });
            }
          }
          if (results.length < limit && "children" in n) {
            for (const child of n.children) search(child);
          }
        };
        search(root);
        return {
          type: request.type,
          requestId: request.requestId,
          data: { count: results.length, nodes: results }
        };
      }
      case "get_reactions": {
        const nodeId = request.nodeIds && request.nodeIds[0];
        if (!nodeId) throw new Error("nodeId is required for get_reactions");
        const node = yield figma.getNodeByIdAsync(nodeId);
        if (!node || node.type === "DOCUMENT") throw new Error(`Node not found: ${nodeId}`);
        const reactions = "reactions" in node ? node.reactions : [];
        return {
          type: request.type,
          requestId: request.requestId,
          data: { nodeId: node.id, name: node.name, reactions }
        };
      }
      case "scan_text_nodes": {
        const nodeId = request.params && request.params.nodeId;
        if (!nodeId) throw new Error("nodeId is required for scan_text_nodes");
        const root = yield figma.getNodeByIdAsync(nodeId);
        if (!root) throw new Error(`Node not found: ${nodeId}`);
        if (root.type === "PAGE") yield root.loadAsync();
        figma.ui.postMessage({
          type: "progress_update",
          requestId: request.requestId,
          progress: 10,
          message: "Scanning text nodes..."
        });
        yield new Promise((r) => setTimeout(r, 0));
        const found = root.type === "TEXT" ? [root] : "findAllWithCriteria" in root ? root.findAllWithCriteria({ types: ["TEXT"] }) : [];
        const textNodes = found.map((n) => ({
          id: n.id,
          name: n.name,
          characters: n.characters,
          fontSize: isMixed(n.fontSize) ? "mixed" : n.fontSize,
          fontName: isMixed(n.fontName) ? "mixed" : n.fontName
        }));
        return {
          type: request.type,
          requestId: request.requestId,
          data: { count: textNodes.length, textNodes }
        };
      }
      case "scan_nodes_by_types": {
        const nodeId = request.params && request.params.nodeId;
        const types = request.params && request.params.types ? request.params.types : [];
        if (!nodeId)
          throw new Error("nodeId is required for scan_nodes_by_types");
        if (types.length === 0)
          throw new Error("types must be a non-empty array");
        const root = yield figma.getNodeByIdAsync(nodeId);
        if (!root) throw new Error(`Node not found: ${nodeId}`);
        if (root.type === "PAGE") yield root.loadAsync();
        const typeSet = new Set(types);
        const matchingNodes = [];
        const findByTypes = (n) => {
          if ("visible" in n && !n.visible) return;
          if (typeSet.has(n.type)) {
            matchingNodes.push({
              id: n.id,
              name: n.name,
              type: n.type,
              bbox: {
                x: "x" in n ? n.x : 0,
                y: "y" in n ? n.y : 0,
                width: "width" in n ? n.width : 0,
                height: "height" in n ? n.height : 0
              }
            });
          }
          if ("children" in n) for (const child of n.children) findByTypes(child);
        };
        figma.ui.postMessage({
          type: "progress_update",
          requestId: request.requestId,
          progress: 10,
          message: `Scanning for types: ${types.join(", ")}...`
        });
        yield new Promise((r) => setTimeout(r, 0));
        findByTypes(root);
        return {
          type: request.type,
          requestId: request.requestId,
          data: {
            count: matchingNodes.length,
            matchingNodes,
            searchedTypes: types
          }
        };
      }
      default:
        return null;
    }
  });
  const handleReadStyleRequest = (request) => __async(null, null, function* () {
    var _a;
    switch (request.type) {
      case "get_styles": {
        const [paintStyles, textStyles, effectStyles, gridStyles] = yield Promise.all([
          figma.getLocalPaintStylesAsync(),
          figma.getLocalTextStylesAsync(),
          figma.getLocalEffectStylesAsync(),
          figma.getLocalGridStylesAsync()
        ]);
        return {
          type: request.type,
          requestId: request.requestId,
          data: {
            paints: paintStyles.map((s) => ({
              id: s.id,
              name: s.name,
              paints: s.paints
            })),
            text: textStyles.map((s) => ({
              id: s.id,
              name: s.name,
              fontSize: s.fontSize,
              fontFamily: s.fontName ? s.fontName.family : void 0,
              fontStyle: s.fontName ? s.fontName.style : void 0,
              textDecoration: s.textDecoration !== "NONE" ? s.textDecoration : void 0,
              lineHeight: s.lineHeight,
              letterSpacing: s.letterSpacing
            })),
            effects: effectStyles.map((s) => ({
              id: s.id,
              name: s.name,
              effects: s.effects
            })),
            grids: gridStyles.map((s) => ({
              id: s.id,
              name: s.name,
              layoutGrids: s.layoutGrids
            }))
          }
        };
      }
      case "get_variable_defs": {
        const collections = yield figma.variables.getLocalVariableCollectionsAsync();
        const variableData = yield Promise.all(
          collections.map((collection) => __async(null, null, function* () {
            const variables = yield Promise.all(
              collection.variableIds.map(
                (id) => figma.variables.getVariableByIdAsync(id)
              )
            );
            return {
              id: collection.id,
              name: collection.name,
              modes: collection.modes.map((mode) => ({
                modeId: mode.modeId,
                name: mode.name
              })),
              variables: variables.filter((v2) => v2 !== null).map((variable) => ({
                id: variable.id,
                name: variable.name,
                resolvedType: variable.resolvedType,
                description: variable.description,
                scopes: variable.scopes,
                codeSyntax: variable.codeSyntax,
                remote: variable.remote,
                valuesByMode: Object.fromEntries(
                  Object.entries(variable.valuesByMode).map(
                    ([modeId, value]) => [
                      modeId,
                      serializeVariableValue(value)
                    ]
                  )
                )
              }))
            };
          }))
        );
        return {
          type: request.type,
          requestId: request.requestId,
          data: { collections: variableData }
        };
      }
      case "get_local_components": {
        const pages = figma.root.children;
        const allComponents = [];
        const componentSetsMap = /* @__PURE__ */ new Map();
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          yield page.loadAsync();
          const pageNodes = page.findAllWithCriteria({
            types: ["COMPONENT", "COMPONENT_SET"]
          });
          for (const n of pageNodes) {
            if (n.type === "COMPONENT_SET") {
              componentSetsMap.set(n.id, {
                id: n.id,
                name: n.name,
                key: "key" in n ? n.key : null
              });
            } else {
              const parentIsSet = n.parent && n.parent.type === "COMPONENT_SET";
              allComponents.push({
                id: n.id,
                name: n.name,
                key: "key" in n ? n.key : null,
                componentSetId: parentIsSet ? n.parent.id : null,
                variantProperties: "variantProperties" in n ? n.variantProperties : null
              });
            }
          }
          figma.ui.postMessage({
            type: "progress_update",
            requestId: request.requestId,
            progress: Math.round((i + 1) / pages.length * 90) + 1,
            message: `Scanned ${page.name}: ${allComponents.length} components so far`
          });
          yield new Promise((r) => setTimeout(r, 0));
        }
        return {
          type: request.type,
          requestId: request.requestId,
          data: {
            count: allComponents.length,
            components: allComponents,
            componentSets: Array.from(componentSetsMap.values())
          }
        };
      }
      case "get_annotations": {
        const nodeId = request.params && request.params.nodeId;
        const nodeAnnotations = (n) => {
          const anns = n.annotations;
          return Array.isArray(anns) ? anns : null;
        };
        if (nodeId) {
          const node = yield figma.getNodeByIdAsync(nodeId);
          if (!node) throw new Error(`Node not found: ${nodeId}`);
          const mergedAnnotations = [];
          const collect = (n) => {
            const anns = nodeAnnotations(n);
            if (anns)
              for (const a of anns)
                mergedAnnotations.push({ nodeId: n.id, annotation: a });
            if ("children" in n) for (const child of n.children) collect(child);
          };
          collect(node);
          return {
            type: request.type,
            requestId: request.requestId,
            data: {
              nodeId: node.id,
              name: node.name,
              annotations: mergedAnnotations
            }
          };
        }
        const annotated = [];
        const processNode = (n) => {
          const anns = nodeAnnotations(n);
          if (anns && anns.length > 0)
            annotated.push({ nodeId: n.id, name: n.name, annotations: anns });
          if ("children" in n) for (const child of n.children) processNode(child);
        };
        processNode(figma.currentPage);
        return {
          type: request.type,
          requestId: request.requestId,
          data: { annotatedNodes: annotated }
        };
      }
      case "export_tokens": {
        const format = request.params && request.params.format || "json";
        const collections = yield figma.variables.getLocalVariableCollectionsAsync();
        const paintStyles = yield figma.getLocalPaintStylesAsync();
        if (format === "css") {
          const lines = [":root {"];
          for (const coll of collections) {
            const firstMode = coll.modes[0];
            if (!firstMode) continue;
            for (const varId of coll.variableIds) {
              const variable = yield figma.variables.getVariableByIdAsync(varId);
              if (!variable) continue;
              const val = variable.valuesByMode[firstMode.modeId];
              const cssName = "--" + variable.name.toLowerCase().replace(/[/\s]+/g, "-").replace(/[^a-z0-9-]/g, "");
              let cssValue = null;
              if (variable.resolvedType === "COLOR" && val && typeof val === "object" && "r" in val) {
                const c = val;
                const r = Math.round(c.r * 255);
                const g = Math.round(c.g * 255);
                const b = Math.round(c.b * 255);
                cssValue = c.a < 1 ? `rgba(${r}, ${g}, ${b}, ${c.a.toFixed(2)})` : `rgb(${r}, ${g}, ${b})`;
              } else if (variable.resolvedType === "FLOAT" || variable.resolvedType === "STRING" || variable.resolvedType === "BOOLEAN") {
                cssValue = String(val);
              }
              if (cssValue !== null) lines.push(`  ${cssName}: ${cssValue};`);
            }
          }
          for (const style of paintStyles) {
            if (style.paints.length === 1 && style.paints[0].type === "SOLID") {
              const paint = style.paints[0];
              const cssName = "--" + style.name.toLowerCase().replace(/[/\s]+/g, "-").replace(/[^a-z0-9-]/g, "");
              const r = Math.round(paint.color.r * 255);
              const g = Math.round(paint.color.g * 255);
              const b = Math.round(paint.color.b * 255);
              const a = (_a = paint.opacity) != null ? _a : 1;
              const cssValue = a < 1 ? `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})` : `rgb(${r}, ${g}, ${b})`;
              lines.push(`  ${cssName}: ${cssValue};`);
            }
          }
          lines.push("}");
          return { type: request.type, requestId: request.requestId, data: { css: lines.join("\n") } };
        }
        const tokens = {};
        for (const coll of collections) {
          const collTokens = {};
          for (const varId of coll.variableIds) {
            const variable = yield figma.variables.getVariableByIdAsync(varId);
            if (!variable) continue;
            const modeValues = {};
            for (const mode of coll.modes) {
              modeValues[mode.name] = serializeVariableValue(variable.valuesByMode[mode.modeId]);
            }
            const parts = variable.name.split("/");
            let obj = collTokens;
            for (let i = 0; i < parts.length - 1; i++) {
              if (!obj[parts[i]]) obj[parts[i]] = {};
              obj = obj[parts[i]];
            }
            obj[parts[parts.length - 1]] = { type: variable.resolvedType, value: modeValues };
          }
          tokens[coll.name] = collTokens;
        }
        const styleTokens = {};
        for (const style of paintStyles) {
          if (style.paints.length === 1 && style.paints[0].type === "SOLID") {
            const paint = style.paints[0];
            const r = Math.round(paint.color.r * 255).toString(16).padStart(2, "0");
            const g = Math.round(paint.color.g * 255).toString(16).padStart(2, "0");
            const b = Math.round(paint.color.b * 255).toString(16).padStart(2, "0");
            const parts = style.name.split("/");
            let obj = styleTokens;
            for (let i = 0; i < parts.length - 1; i++) {
              if (!obj[parts[i]]) obj[parts[i]] = {};
              obj = obj[parts[i]];
            }
            obj[parts[parts.length - 1]] = { type: "COLOR", value: `#${r}${g}${b}` };
          }
        }
        if (Object.keys(styleTokens).length > 0) {
          tokens["_styles"] = { paint: styleTokens };
        }
        return { type: request.type, requestId: request.requestId, data: { tokens } };
      }
      default:
        return null;
    }
  });
  const handleReadExportRequest = (request) => __async(null, null, function* () {
    var _a;
    switch (request.type) {
      case "get_screenshot": {
        const format = request.params && request.params.format ? request.params.format : "PNG";
        const scale = request.params && request.params.scale != null ? request.params.scale : 2;
        let targetNodes;
        if (request.nodeIds && request.nodeIds.length > 0) {
          const nodes = yield Promise.all(
            request.nodeIds.map((id) => figma.getNodeByIdAsync(id))
          );
          targetNodes = nodes.filter(
            (n) => n !== null && n.type !== "DOCUMENT" && n.type !== "PAGE"
          );
        } else {
          targetNodes = figma.currentPage.selection.slice();
        }
        if (targetNodes.length === 0)
          throw new Error(
            "No nodes to export. Select nodes or provide nodeIds."
          );
        const exports = yield Promise.all(
          targetNodes.map((node) => __async(null, null, function* () {
            const settings = format === "SVG" ? { format: "SVG" } : format === "PDF" ? { format: "PDF" } : format === "JPG" ? {
              format: "JPG",
              constraint: { type: "SCALE", value: scale }
            } : {
              format: "PNG",
              constraint: { type: "SCALE", value: scale }
            };
            const bytes = yield node.exportAsync(settings);
            const base64 = figma.base64Encode(bytes);
            return {
              nodeId: node.id,
              nodeName: node.name,
              format,
              base64,
              width: node.width,
              height: node.height
            };
          }))
        );
        return {
          type: request.type,
          requestId: request.requestId,
          data: { exports }
        };
      }
      case "export_frames_to_pdf": {
        const nodeIds = (_a = request.nodeIds) != null ? _a : [];
        if (nodeIds.length === 0) {
          throw new Error("nodeIds is required and must not be empty");
        }
        const frames = yield Promise.all(
          nodeIds.map((id) => __async(null, null, function* () {
            const node = yield figma.getNodeByIdAsync(id);
            if (!node || node.type === "DOCUMENT" || node.type === "PAGE") {
              throw new Error(`Node ${id} not found or is not exportable`);
            }
            const bytes = yield node.exportAsync({ format: "PDF" });
            return {
              nodeId: node.id,
              nodeName: node.name,
              base64: figma.base64Encode(bytes)
            };
          }))
        );
        return {
          type: request.type,
          requestId: request.requestId,
          data: { frames }
        };
      }
      default:
        return null;
    }
  });
  const handleReadRequest = (request) => __async(null, null, function* () {
    var _a, _b;
    return (_b = (_a = yield handleReadDocumentRequest(request)) != null ? _a : yield handleReadStyleRequest(request)) != null ? _b : yield handleReadExportRequest(request);
  });
  const hexToRgb = (hex) => {
    const clean = hex.replace("#", "");
    return {
      r: parseInt(clean.slice(0, 2), 16) / 255,
      g: parseInt(clean.slice(2, 4), 16) / 255,
      b: parseInt(clean.slice(4, 6), 16) / 255,
      a: clean.length >= 8 ? parseInt(clean.slice(6, 8), 16) / 255 : 1
    };
  };
  const makeSolidPaint = (colorInput, opacityOverride) => {
    const { r, g, b, a } = typeof colorInput === "string" ? hexToRgb(colorInput) : { r: colorInput.r, g: colorInput.g, b: colorInput.b, a: colorInput.a != null ? colorInput.a : 1 };
    const eff = opacityOverride != null ? opacityOverride : a;
    const paint = { type: "SOLID", color: { r, g, b } };
    if (eff !== 1) paint.opacity = eff;
    return paint;
  };
  const getParentNode = (parentId) => __async(null, null, function* () {
    if (!parentId) return figma.currentPage;
    const parent = yield figma.getNodeByIdAsync(parentId);
    if (!parent) throw new Error(`Parent node not found: ${parentId}`);
    if (!("appendChild" in parent)) throw new Error(`Node ${parentId} cannot have children`);
    return parent;
  });
  const applyAutoLayout = (frame, p) => {
    if (p.layoutMode != null) frame.layoutMode = p.layoutMode;
    if (p.paddingTop != null) frame.paddingTop = Number(p.paddingTop);
    if (p.paddingRight != null) frame.paddingRight = Number(p.paddingRight);
    if (p.paddingBottom != null) frame.paddingBottom = Number(p.paddingBottom);
    if (p.paddingLeft != null) frame.paddingLeft = Number(p.paddingLeft);
    if (p.itemSpacing != null) frame.itemSpacing = Number(p.itemSpacing);
    if (frame.layoutMode !== "NONE") {
      if (p.primaryAxisAlignItems) frame.primaryAxisAlignItems = p.primaryAxisAlignItems;
      if (p.counterAxisAlignItems) frame.counterAxisAlignItems = p.counterAxisAlignItems;
      if (p.primaryAxisSizingMode) frame.primaryAxisSizingMode = p.primaryAxisSizingMode;
      if (p.counterAxisSizingMode) frame.counterAxisSizingMode = p.counterAxisSizingMode;
      if (p.layoutWrap) frame.layoutWrap = p.layoutWrap;
      if (p.counterAxisSpacing != null && frame.layoutWrap === "WRAP") {
        frame.counterAxisSpacing = Number(p.counterAxisSpacing);
      }
    }
  };
  const base64ToBytes = (b64) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const lookup = {};
    for (let i = 0; i < chars.length; i++) lookup[chars[i]] = i;
    const padded = b64.replace(/[^A-Za-z0-9+/=]/g, "");
    const clean = padded.replace(/=/g, "");
    let outLen = Math.floor(padded.length * 3 / 4);
    if (padded.endsWith("==")) outLen -= 2;
    else if (padded.endsWith("=")) outLen -= 1;
    const bytes = new Uint8Array(outLen);
    let j = 0;
    for (let i = 0; i < clean.length; i += 4) {
      const a = lookup[clean[i]] || 0;
      const bv = lookup[clean[i + 1]] || 0;
      const c = lookup[clean[i + 2]] || 0;
      const d = lookup[clean[i + 3]] || 0;
      bytes[j++] = a << 2 | bv >> 4;
      if (j < outLen) bytes[j++] = (bv & 15) << 4 | c >> 2;
      if (j < outLen) bytes[j++] = (c & 3) << 6 | d;
    }
    return bytes;
  };
  const handleWriteCreateRequest = (request) => __async(null, null, function* () {
    switch (request.type) {
      case "create_frame": {
        const p = request.params || {};
        const parent = yield getParentNode(p.parentId);
        const frame = figma.createFrame();
        frame.resize(p.width || 100, p.height || 100);
        frame.x = p.x != null ? p.x : 0;
        frame.y = p.y != null ? p.y : 0;
        if (p.name) frame.name = p.name;
        if (p.fillColor) frame.fills = [makeSolidPaint(p.fillColor)];
        applyAutoLayout(frame, p);
        parent.appendChild(frame);
        figma.commitUndo();
        return {
          type: request.type,
          requestId: request.requestId,
          data: { id: frame.id, name: frame.name, type: frame.type, bounds: getBounds(frame) }
        };
      }
      case "create_rectangle": {
        const p = request.params || {};
        const parent = yield getParentNode(p.parentId);
        const rect = figma.createRectangle();
        rect.resize(p.width || 100, p.height || 100);
        rect.x = p.x != null ? p.x : 0;
        rect.y = p.y != null ? p.y : 0;
        if (p.name) rect.name = p.name;
        if (p.fillColor) rect.fills = [makeSolidPaint(p.fillColor)];
        if (p.cornerRadius != null) rect.cornerRadius = p.cornerRadius;
        parent.appendChild(rect);
        figma.commitUndo();
        return {
          type: request.type,
          requestId: request.requestId,
          data: { id: rect.id, name: rect.name, type: rect.type, bounds: getBounds(rect) }
        };
      }
      case "create_ellipse": {
        const p = request.params || {};
        const parent = yield getParentNode(p.parentId);
        const ellipse = figma.createEllipse();
        ellipse.resize(p.width || 100, p.height || 100);
        ellipse.x = p.x != null ? p.x : 0;
        ellipse.y = p.y != null ? p.y : 0;
        if (p.name) ellipse.name = p.name;
        if (p.fillColor) ellipse.fills = [makeSolidPaint(p.fillColor)];
        parent.appendChild(ellipse);
        figma.commitUndo();
        return {
          type: request.type,
          requestId: request.requestId,
          data: { id: ellipse.id, name: ellipse.name, type: ellipse.type, bounds: getBounds(ellipse) }
        };
      }
      case "create_text": {
        const p = request.params || {};
        const parent = yield getParentNode(p.parentId);
        const fontFamily = p.fontFamily || "Inter";
        const fontStyle = p.fontStyle || "Regular";
        yield figma.loadFontAsync({ family: fontFamily, style: fontStyle });
        const textNode = figma.createText();
        textNode.fontName = { family: fontFamily, style: fontStyle };
        if (p.fontSize != null) textNode.fontSize = Number(p.fontSize);
        textNode.characters = p.text || "";
        textNode.x = p.x != null ? p.x : 0;
        textNode.y = p.y != null ? p.y : 0;
        if (p.name) textNode.name = p.name;
        if (p.fillColor) textNode.fills = [makeSolidPaint(p.fillColor)];
        parent.appendChild(textNode);
        figma.commitUndo();
        return {
          type: request.type,
          requestId: request.requestId,
          data: { id: textNode.id, name: textNode.name, type: textNode.type, bounds: getBounds(textNode) }
        };
      }
      case "import_image": {
        const p = request.params || {};
        if (!p.imageData) throw new Error("imageData (base64) is required");
        const parent = yield getParentNode(p.parentId);
        const bytes = base64ToBytes(p.imageData);
        const image = figma.createImage(bytes);
        const rect = figma.createRectangle();
        rect.resize(p.width || 200, p.height || 200);
        rect.x = p.x != null ? p.x : 0;
        rect.y = p.y != null ? p.y : 0;
        if (p.name) rect.name = p.name;
        rect.fills = [{ type: "IMAGE", imageHash: image.hash, scaleMode: p.scaleMode || "FILL" }];
        parent.appendChild(rect);
        figma.commitUndo();
        return {
          type: request.type,
          requestId: request.requestId,
          data: { id: rect.id, name: rect.name, type: rect.type, bounds: getBounds(rect) }
        };
      }
      case "create_component": {
        const p = request.params || {};
        const nodeId = request.nodeIds && request.nodeIds[0];
        if (!nodeId) throw new Error("nodeId is required");
        const node = yield figma.getNodeByIdAsync(nodeId);
        if (!node) throw new Error(`Node not found: ${nodeId}`);
        if (node.type !== "FRAME") throw new Error(`Node ${nodeId} is not a FRAME — only frames can be converted to components`);
        const parent = node.parent;
        const index = parent.children.indexOf(node);
        const component = figma.createComponent();
        component.name = p.name || node.name;
        component.resize(node.width, node.height);
        component.x = node.x;
        component.y = node.y;
        component.fills = node.fills;
        component.strokes = node.strokes;
        if (node.cornerRadius != null && node.cornerRadius !== figma.mixed) {
          component.cornerRadius = node.cornerRadius;
        }
        if (node.layoutMode && node.layoutMode !== "NONE") {
          component.layoutMode = node.layoutMode;
          component.paddingTop = node.paddingTop;
          component.paddingRight = node.paddingRight;
          component.paddingBottom = node.paddingBottom;
          component.paddingLeft = node.paddingLeft;
          component.itemSpacing = node.itemSpacing;
          component.primaryAxisAlignItems = node.primaryAxisAlignItems;
          component.counterAxisAlignItems = node.counterAxisAlignItems;
        }
        for (const child of [...node.children]) {
          component.appendChild(child);
        }
        parent.insertChild(index, component);
        node.remove();
        figma.commitUndo();
        return {
          type: request.type,
          requestId: request.requestId,
          data: { id: component.id, name: component.name, type: component.type, bounds: getBounds(component) }
        };
      }
      case "create_section": {
        const p = request.params || {};
        const section = figma.createSection();
        if (p.name) section.name = p.name;
        if (p.x != null) section.x = p.x;
        if (p.y != null) section.y = p.y;
        if (p.width != null || p.height != null) {
          section.resizeWithoutConstraints(p.width || section.width, p.height || section.height);
        }
        figma.commitUndo();
        return {
          type: request.type,
          requestId: request.requestId,
          data: { id: section.id, name: section.name, type: section.type, bounds: getBounds(section) }
        };
      }
      default:
        return null;
    }
  });
  const handleWriteModifyRequest = (request) => __async(null, null, function* () {
    switch (request.type) {
      case "set_text": {
        const p = request.params || {};
        const nodeId = request.nodeIds && request.nodeIds[0];
        if (!nodeId) throw new Error("nodeId is required");
        const node = yield figma.getNodeByIdAsync(nodeId);
        if (!node) throw new Error(`Node not found: ${nodeId}`);
        if (node.type !== "TEXT") throw new Error(`Node ${nodeId} is not a TEXT node`);
        const fontName = typeof node.fontName === "symbol" ? { family: "Inter", style: "Regular" } : node.fontName;
        yield figma.loadFontAsync(fontName);
        node.characters = p.text;
        figma.commitUndo();
        return {
          type: request.type,
          requestId: request.requestId,
          data: { id: node.id, name: node.name, characters: node.characters }
        };
      }
      case "set_fills": {
        const p = request.params || {};
        const nodeId = request.nodeIds && request.nodeIds[0];
        if (!nodeId) throw new Error("nodeId is required");
        const node = yield figma.getNodeByIdAsync(nodeId);
        if (!node) throw new Error(`Node not found: ${nodeId}`);
        if (!("fills" in node)) throw new Error(`Node ${nodeId} does not support fills`);
        const newFill = makeSolidPaint(p.color, p.opacity != null ? p.opacity : void 0);
        node.fills = p.mode === "append" ? [...node.fills, newFill] : [newFill];
        figma.commitUndo();
        return {
          type: request.type,
          requestId: request.requestId,
          data: { id: node.id, name: node.name }
        };
      }
      case "set_strokes": {
        const p = request.params || {};
        const nodeId = request.nodeIds && request.nodeIds[0];
        if (!nodeId) throw new Error("nodeId is required");
        const node = yield figma.getNodeByIdAsync(nodeId);
        if (!node) throw new Error(`Node not found: ${nodeId}`);
        if (!("strokes" in node)) throw new Error(`Node ${nodeId} does not support strokes`);
        const newStroke = makeSolidPaint(p.color);
        node.strokes = p.mode === "append" ? [...node.strokes, newStroke] : [newStroke];
        if (p.strokeWeight != null) node.strokeWeight = p.strokeWeight;
        figma.commitUndo();
        return {
          type: request.type,
          requestId: request.requestId,
          data: { id: node.id, name: node.name }
        };
      }
      case "move_nodes": {
        const p = request.params || {};
        const nodeIds = request.nodeIds || [];
        if (nodeIds.length === 0) throw new Error("nodeIds is required");
        const results = [];
        for (const nid of nodeIds) {
          const n = yield figma.getNodeByIdAsync(nid);
          if (!n) {
            results.push({ nodeId: nid, error: "Node not found" });
            continue;
          }
          if (!("x" in n)) {
            results.push({ nodeId: nid, error: "Node does not support position" });
            continue;
          }
          if (p.x != null) n.x = p.x;
          if (p.y != null) n.y = p.y;
          results.push({ nodeId: nid, x: n.x, y: n.y });
        }
        figma.commitUndo();
        return { type: request.type, requestId: request.requestId, data: { results } };
      }
      case "resize_nodes": {
        const p = request.params || {};
        const nodeIds = request.nodeIds || [];
        if (nodeIds.length === 0) throw new Error("nodeIds is required");
        const results = [];
        for (const nid of nodeIds) {
          const n = yield figma.getNodeByIdAsync(nid);
          if (!n) {
            results.push({ nodeId: nid, error: "Node not found" });
            continue;
          }
          if (!("resize" in n)) {
            results.push({ nodeId: nid, error: "Node does not support resize" });
            continue;
          }
          const w = p.width != null ? p.width : n.width;
          const h = p.height != null ? p.height : n.height;
          n.resize(w, h);
          results.push({ nodeId: nid, width: n.width, height: n.height });
        }
        figma.commitUndo();
        return { type: request.type, requestId: request.requestId, data: { results } };
      }
      case "rename_node": {
        const p = request.params || {};
        const nodeId = request.nodeIds && request.nodeIds[0];
        if (!nodeId) throw new Error("nodeId is required");
        const node = yield figma.getNodeByIdAsync(nodeId);
        if (!node) throw new Error(`Node not found: ${nodeId}`);
        node.name = p.name;
        return {
          type: request.type,
          requestId: request.requestId,
          data: { id: node.id, name: node.name }
        };
      }
      case "clone_node": {
        const p = request.params || {};
        const nodeId = request.nodeIds && request.nodeIds[0];
        if (!nodeId) throw new Error("nodeId is required");
        const node = yield figma.getNodeByIdAsync(nodeId);
        if (!node) throw new Error(`Node not found: ${nodeId}`);
        const clone = node.clone();
        if (p.x != null) clone.x = p.x;
        if (p.y != null) clone.y = p.y;
        if (p.parentId) {
          const parent = yield getParentNode(p.parentId);
          parent.appendChild(clone);
        }
        figma.commitUndo();
        return {
          type: request.type,
          requestId: request.requestId,
          data: { id: clone.id, name: clone.name, type: clone.type, bounds: getBounds(clone) }
        };
      }
      case "set_opacity": {
        const p = request.params || {};
        const nodeIds = request.nodeIds || [];
        if (nodeIds.length === 0) throw new Error("nodeIds is required");
        const results = [];
        for (const nid of nodeIds) {
          const n = yield figma.getNodeByIdAsync(nid);
          if (!n) {
            results.push({ nodeId: nid, error: "Node not found" });
            continue;
          }
          if (!("opacity" in n)) {
            results.push({ nodeId: nid, error: "Node does not support opacity" });
            continue;
          }
          n.opacity = p.opacity;
          results.push({ nodeId: nid, opacity: n.opacity });
        }
        figma.commitUndo();
        return { type: request.type, requestId: request.requestId, data: { results } };
      }
      case "set_corner_radius": {
        const p = request.params || {};
        const nodeIds = request.nodeIds || [];
        if (nodeIds.length === 0) throw new Error("nodeIds is required");
        const results = [];
        for (const nid of nodeIds) {
          const n = yield figma.getNodeByIdAsync(nid);
          if (!n) {
            results.push({ nodeId: nid, error: "Node not found" });
            continue;
          }
          if (!("cornerRadius" in n)) {
            results.push({ nodeId: nid, error: "Node does not support corner radius" });
            continue;
          }
          if (p.cornerRadius != null) n.cornerRadius = p.cornerRadius;
          if (p.topLeftRadius != null) n.topLeftRadius = p.topLeftRadius;
          if (p.topRightRadius != null) n.topRightRadius = p.topRightRadius;
          if (p.bottomLeftRadius != null) n.bottomLeftRadius = p.bottomLeftRadius;
          if (p.bottomRightRadius != null) n.bottomRightRadius = p.bottomRightRadius;
          results.push({ nodeId: nid, cornerRadius: n.cornerRadius });
        }
        figma.commitUndo();
        return { type: request.type, requestId: request.requestId, data: { results } };
      }
      case "set_auto_layout": {
        const p = request.params || {};
        const nodeId = request.nodeIds && request.nodeIds[0];
        if (!nodeId) throw new Error("nodeId is required");
        const node = yield figma.getNodeByIdAsync(nodeId);
        if (!node) throw new Error(`Node not found: ${nodeId}`);
        if (node.type !== "FRAME") throw new Error(`Node ${nodeId} is not a FRAME`);
        applyAutoLayout(node, p);
        figma.commitUndo();
        return {
          type: request.type,
          requestId: request.requestId,
          data: { id: node.id, name: node.name }
        };
      }
      case "set_visible": {
        const p = request.params || {};
        const nodeIds = request.nodeIds || [];
        if (nodeIds.length === 0) throw new Error("nodeIds is required");
        const results = [];
        for (const nid of nodeIds) {
          const n = yield figma.getNodeByIdAsync(nid);
          if (!n) {
            results.push({ nodeId: nid, error: "Node not found" });
            continue;
          }
          if (!("visible" in n)) {
            results.push({ nodeId: nid, error: "Node does not support visibility" });
            continue;
          }
          n.visible = p.visible;
          results.push({ nodeId: nid, visible: n.visible });
        }
        figma.commitUndo();
        return { type: request.type, requestId: request.requestId, data: { results } };
      }
      case "lock_nodes":
      case "unlock_nodes": {
        const nodeIds = request.nodeIds || [];
        if (nodeIds.length === 0) throw new Error("nodeIds is required");
        const locked = request.type === "lock_nodes";
        const results = [];
        for (const nid of nodeIds) {
          const n = yield figma.getNodeByIdAsync(nid);
          if (!n) {
            results.push({ nodeId: nid, error: "Node not found" });
            continue;
          }
          if (!("locked" in n)) {
            results.push({ nodeId: nid, error: "Node does not support locking" });
            continue;
          }
          n.locked = locked;
          results.push({ nodeId: nid, locked: n.locked });
        }
        figma.commitUndo();
        return { type: request.type, requestId: request.requestId, data: { results } };
      }
      case "rotate_nodes": {
        const p = request.params || {};
        const nodeIds = request.nodeIds || [];
        if (nodeIds.length === 0) throw new Error("nodeIds is required");
        const results = [];
        for (const nid of nodeIds) {
          const n = yield figma.getNodeByIdAsync(nid);
          if (!n) {
            results.push({ nodeId: nid, error: "Node not found" });
            continue;
          }
          if (!("rotation" in n)) {
            results.push({ nodeId: nid, error: "Node does not support rotation" });
            continue;
          }
          n.rotation = p.rotation;
          results.push({ nodeId: nid, rotation: n.rotation });
        }
        figma.commitUndo();
        return { type: request.type, requestId: request.requestId, data: { results } };
      }
      case "reorder_nodes": {
        const p = request.params || {};
        const nodeIds = request.nodeIds || [];
        if (nodeIds.length === 0) throw new Error("nodeIds is required");
        const validOrders = ["bringToFront", "sendToBack", "bringForward", "sendBackward"];
        if (!validOrders.includes(p.order)) {
          throw new Error(`order must be bringToFront, sendToBack, bringForward, or sendBackward`);
        }
        const results = [];
        for (const nid of nodeIds) {
          const n = yield figma.getNodeByIdAsync(nid);
          if (!n) {
            results.push({ nodeId: nid, error: "Node not found" });
            continue;
          }
          const parent = n.parent;
          if (!parent || !("children" in parent)) {
            results.push({ nodeId: nid, error: "Node has no reorderable parent" });
            continue;
          }
          const siblings = parent.children;
          const currentIndex = siblings.indexOf(n);
          let newIndex;
          switch (p.order) {
            case "bringToFront":
              newIndex = siblings.length - 1;
              break;
            case "sendToBack":
              newIndex = 0;
              break;
            case "bringForward":
              newIndex = Math.min(currentIndex + 1, siblings.length - 1);
              break;
            case "sendBackward":
              newIndex = Math.max(currentIndex - 1, 0);
              break;
            default:
              newIndex = currentIndex;
          }
          parent.insertChild(newIndex, n);
          results.push({ nodeId: nid, index: newIndex });
        }
        figma.commitUndo();
        return { type: request.type, requestId: request.requestId, data: { results } };
      }
      case "set_blend_mode": {
        const p = request.params || {};
        const nodeIds = request.nodeIds || [];
        if (nodeIds.length === 0) throw new Error("nodeIds is required");
        const results = [];
        for (const nid of nodeIds) {
          const n = yield figma.getNodeByIdAsync(nid);
          if (!n) {
            results.push({ nodeId: nid, error: "Node not found" });
            continue;
          }
          if (!("blendMode" in n)) {
            results.push({ nodeId: nid, error: "Node does not support blend mode" });
            continue;
          }
          n.blendMode = p.blendMode;
          results.push({ nodeId: nid, blendMode: n.blendMode });
        }
        figma.commitUndo();
        return { type: request.type, requestId: request.requestId, data: { results } };
      }
      case "set_constraints": {
        const p = request.params || {};
        const nodeIds = request.nodeIds || [];
        if (nodeIds.length === 0) throw new Error("nodeIds is required");
        const results = [];
        for (const nid of nodeIds) {
          const n = yield figma.getNodeByIdAsync(nid);
          if (!n) {
            results.push({ nodeId: nid, error: "Node not found" });
            continue;
          }
          if (!("constraints" in n)) {
            results.push({ nodeId: nid, error: "Node does not support constraints" });
            continue;
          }
          const updated = __spreadValues({}, n.constraints);
          if (p.horizontal) updated.horizontal = p.horizontal;
          if (p.vertical) updated.vertical = p.vertical;
          n.constraints = updated;
          results.push({ nodeId: nid, constraints: n.constraints });
        }
        figma.commitUndo();
        return { type: request.type, requestId: request.requestId, data: { results } };
      }
      case "reparent_nodes": {
        const p = request.params || {};
        const nodeIds = request.nodeIds || [];
        if (nodeIds.length === 0) throw new Error("nodeIds is required");
        if (!p.parentId) throw new Error("parentId is required");
        const newParent = yield figma.getNodeByIdAsync(p.parentId);
        if (!newParent) throw new Error(`Parent not found: ${p.parentId}`);
        if (!("appendChild" in newParent)) throw new Error(`Node ${p.parentId} cannot contain children`);
        const results = [];
        for (const nid of nodeIds) {
          const n = yield figma.getNodeByIdAsync(nid);
          if (!n) {
            results.push({ nodeId: nid, error: "Node not found" });
            continue;
          }
          try {
            newParent.appendChild(n);
            results.push({ nodeId: nid, newParentId: p.parentId });
          } catch (e) {
            results.push({ nodeId: nid, error: e.message });
          }
        }
        figma.commitUndo();
        return { type: request.type, requestId: request.requestId, data: { results } };
      }
      case "batch_rename_nodes": {
        const p = request.params || {};
        const nodeIds = request.nodeIds || [];
        if (nodeIds.length === 0) throw new Error("nodeIds is required");
        const results = [];
        for (const nid of nodeIds) {
          const n = yield figma.getNodeByIdAsync(nid);
          if (!n) {
            results.push({ nodeId: nid, error: "Node not found" });
            continue;
          }
          const oldName = n.name;
          let newName = oldName;
          if (p.find !== void 0 && p.replace !== void 0) {
            if (p.useRegex) {
              try {
                const regex = new RegExp(p.find, p.regexFlags || "g");
                newName = newName.replace(regex, p.replace);
              } catch (e) {
                results.push({ nodeId: nid, error: `Invalid regex: ${e.message}` });
                continue;
              }
            } else {
              newName = newName.split(p.find).join(p.replace);
            }
          }
          if (p.prefix) newName = p.prefix + newName;
          if (p.suffix) newName = newName + p.suffix;
          n.name = newName;
          results.push({ nodeId: nid, oldName, name: newName });
        }
        figma.commitUndo();
        return { type: request.type, requestId: request.requestId, data: { results } };
      }
      case "find_replace_text": {
        const p = request.params || {};
        if (!p.find) throw new Error("find is required");
        if (p.replace === void 0) throw new Error("replace is required");
        const rootNodeId = request.nodeIds && request.nodeIds[0];
        const root = rootNodeId ? yield figma.getNodeByIdAsync(rootNodeId) : figma.currentPage;
        if (!root) throw new Error(`Root node not found: ${rootNodeId}`);
        const textNodes = [];
        const collect = (node) => {
          if (node.type === "TEXT") textNodes.push(node);
          if ("children" in node) node.children.forEach(collect);
        };
        collect(root);
        const results = [];
        for (const tn of textNodes) {
          const originalText = tn.characters;
          let newText;
          if (p.useRegex) {
            try {
              const regex = new RegExp(p.find, p.regexFlags || "g");
              newText = originalText.replace(regex, p.replace);
            } catch (e) {
              results.push({ nodeId: tn.id, nodeName: tn.name, error: `Invalid regex: ${e.message}` });
              continue;
            }
          } else {
            newText = originalText.split(p.find).join(p.replace);
          }
          if (newText !== originalText) {
            const fontName = typeof tn.fontName === "symbol" ? { family: "Inter", style: "Regular" } : tn.fontName;
            yield figma.loadFontAsync(fontName);
            tn.characters = newText;
            results.push({ nodeId: tn.id, nodeName: tn.name, oldText: originalText, newText });
          }
        }
        figma.commitUndo();
        const successCount = results.filter((r) => !r.error).length;
        return { type: request.type, requestId: request.requestId, data: { replaced: successCount, results } };
      }
      default:
        return null;
    }
  });
  const handleWriteStyleRequest = (request) => __async(null, null, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    switch (request.type) {
      case "create_paint_style": {
        const p = request.params || {};
        if (!p.name) throw new Error("name is required");
        if (!p.color) throw new Error("color is required");
        const existing = (yield figma.getLocalPaintStylesAsync()).find((s) => s.name === p.name);
        if (existing) {
          return { type: request.type, requestId: request.requestId, data: { id: existing.id, name: existing.name } };
        }
        const style = figma.createPaintStyle();
        style.name = p.name;
        style.paints = [makeSolidPaint(p.color)];
        if (p.description) style.description = p.description;
        figma.commitUndo();
        return {
          type: request.type,
          requestId: request.requestId,
          data: { id: style.id, name: style.name }
        };
      }
      case "create_text_style": {
        const p = request.params || {};
        if (!p.name) throw new Error("name is required");
        const existing = (yield figma.getLocalTextStylesAsync()).find((s) => s.name === p.name);
        if (existing) {
          return { type: request.type, requestId: request.requestId, data: { id: existing.id, name: existing.name } };
        }
        const family = p.fontFamily || "Inter";
        const fontStyle = p.fontStyle || "Regular";
        yield figma.loadFontAsync({ family, style: fontStyle });
        const style = figma.createTextStyle();
        style.name = p.name;
        style.fontName = { family, style: fontStyle };
        if (p.fontSize != null) style.fontSize = Number(p.fontSize);
        if (p.description) style.description = p.description;
        if (p.textDecoration && p.textDecoration !== "NONE") {
          style.textDecoration = p.textDecoration;
        }
        if (p.lineHeightValue != null) {
          style.lineHeight = { value: Number(p.lineHeightValue), unit: p.lineHeightUnit || "PIXELS" };
        }
        if (p.letterSpacingValue != null) {
          style.letterSpacing = { value: Number(p.letterSpacingValue), unit: p.letterSpacingUnit || "PIXELS" };
        }
        figma.commitUndo();
        return {
          type: request.type,
          requestId: request.requestId,
          data: { id: style.id, name: style.name }
        };
      }
      case "create_effect_style": {
        const p = request.params || {};
        if (!p.name) throw new Error("name is required");
        const existing = (yield figma.getLocalEffectStylesAsync()).find((s) => s.name === p.name);
        if (existing) {
          return { type: request.type, requestId: request.requestId, data: { id: existing.id, name: existing.name } };
        }
        const effectType = p.type || "DROP_SHADOW";
        let effect;
        if (effectType === "LAYER_BLUR") {
          effect = { type: "LAYER_BLUR", blurType: "NORMAL", radius: Number((_a = p.radius) != null ? _a : 4), visible: true };
        } else if (effectType === "BACKGROUND_BLUR") {
          effect = { type: "BACKGROUND_BLUR", blurType: "NORMAL", radius: Number((_b = p.radius) != null ? _b : 4), visible: true };
        } else {
          const { r, g, b, a } = hexToRgb(p.color || "#000000");
          const alpha = p.opacity != null ? Number(p.opacity) : a !== 1 ? a : 0.25;
          effect = {
            type: effectType,
            color: { r, g, b, a: alpha },
            offset: { x: Number((_c = p.offsetX) != null ? _c : 0), y: Number((_d = p.offsetY) != null ? _d : 4) },
            radius: Number((_e = p.radius) != null ? _e : 8),
            spread: Number((_f = p.spread) != null ? _f : 0),
            visible: true,
            blendMode: "NORMAL"
          };
        }
        const style = figma.createEffectStyle();
        style.name = p.name;
        style.effects = [effect];
        if (p.description) style.description = p.description;
        figma.commitUndo();
        return {
          type: request.type,
          requestId: request.requestId,
          data: { id: style.id, name: style.name }
        };
      }
      case "create_grid_style": {
        const p = request.params || {};
        if (!p.name) throw new Error("name is required");
        const existing = (yield figma.getLocalGridStylesAsync()).find((s) => s.name === p.name);
        if (existing) {
          return { type: request.type, requestId: request.requestId, data: { id: existing.id, name: existing.name } };
        }
        const pattern = p.pattern || "GRID";
        let grid;
        if (pattern === "COLUMNS" || pattern === "ROWS") {
          grid = {
            pattern,
            count: Number((_g = p.count) != null ? _g : 12),
            gutterSize: Number((_h = p.gutterSize) != null ? _h : 16),
            offset: Number((_i = p.offset) != null ? _i : 0),
            alignment: p.alignment || "STRETCH",
            visible: true
          };
        } else {
          const { r, g, b, a } = hexToRgb(p.color || "#FF0000");
          grid = {
            pattern: "GRID",
            sectionSize: Number((_j = p.sectionSize) != null ? _j : 8),
            visible: true,
            color: { r, g, b, a: p.opacity != null ? Number(p.opacity) : a !== 1 ? a : 0.1 }
          };
        }
        const style = figma.createGridStyle();
        style.name = p.name;
        style.layoutGrids = [grid];
        if (p.description) style.description = p.description;
        figma.commitUndo();
        return {
          type: request.type,
          requestId: request.requestId,
          data: { id: style.id, name: style.name }
        };
      }
      case "update_paint_style": {
        const p = request.params || {};
        if (!p.styleId) throw new Error("styleId is required");
        const style = yield figma.getStyleByIdAsync(p.styleId);
        if (!style) throw new Error(`Style not found: ${p.styleId}`);
        if (style.type !== "PAINT") throw new Error(`Style ${p.styleId} is not a paint style`);
        if (p.name) style.name = p.name;
        if (p.color) style.paints = [makeSolidPaint(p.color)];
        if (p.description != null) style.description = p.description;
        figma.commitUndo();
        return {
          type: request.type,
          requestId: request.requestId,
          data: { id: style.id, name: style.name }
        };
      }
      case "delete_style": {
        const p = request.params || {};
        if (!p.styleId) throw new Error("styleId is required");
        const style = yield figma.getStyleByIdAsync(p.styleId);
        if (!style) throw new Error(`Style not found: ${p.styleId}`);
        style.remove();
        figma.commitUndo();
        return {
          type: request.type,
          requestId: request.requestId,
          data: { styleId: p.styleId, deleted: true }
        };
      }
      case "apply_style_to_node": {
        const p = request.params || {};
        const nodeId = request.nodeIds && request.nodeIds[0];
        if (!nodeId) throw new Error("nodeId is required");
        if (!p.styleId) throw new Error("styleId is required");
        const node = yield figma.getNodeByIdAsync(nodeId);
        if (!node) throw new Error(`Node not found: ${nodeId}`);
        const style = yield figma.getStyleByIdAsync(p.styleId);
        if (!style) throw new Error(`Style not found: ${p.styleId}`);
        const n = node;
        switch (style.type) {
          case "PAINT": {
            const target = p.target || "fill";
            if (target === "stroke") {
              if (!("strokeStyleId" in node)) throw new Error(`Node ${nodeId} does not support stroke styles`);
              yield n.setStrokeStyleIdAsync(p.styleId);
            } else {
              if (!("fillStyleId" in node)) throw new Error(`Node ${nodeId} does not support fill styles`);
              yield n.setFillStyleIdAsync(p.styleId);
            }
            break;
          }
          case "TEXT":
            if (!("textStyleId" in node)) throw new Error(`Node ${nodeId} does not support text styles`);
            yield n.setTextStyleIdAsync(p.styleId);
            break;
          case "EFFECT":
            if (!("effectStyleId" in node)) throw new Error(`Node ${nodeId} does not support effect styles`);
            yield n.setEffectStyleIdAsync(p.styleId);
            break;
          case "GRID":
            if (!("gridStyleId" in node)) throw new Error(`Node ${nodeId} does not support grid styles`);
            yield n.setGridStyleIdAsync(p.styleId);
            break;
          default:
            throw new Error(`Unknown style type: ${style.type}`);
        }
        figma.commitUndo();
        return {
          type: request.type,
          requestId: request.requestId,
          data: { id: n.id, name: n.name, styleId: p.styleId, styleType: style.type }
        };
      }
      case "set_effects": {
        const p = request.params || {};
        const nodeId = request.nodeIds && request.nodeIds[0];
        if (!nodeId) throw new Error("nodeId is required");
        if (!Array.isArray(p.effects)) throw new Error("effects array is required");
        const node = yield figma.getNodeByIdAsync(nodeId);
        if (!node) throw new Error(`Node not found: ${nodeId}`);
        if (!("effects" in node)) throw new Error(`Node ${nodeId} does not support effects`);
        const effects = p.effects.map((e) => {
          var _a2, _b2, _c2, _d2, _e2, _f2, _g2, _h2, _i2, _j2;
          switch (e.type) {
            case "DROP_SHADOW":
            case "INNER_SHADOW": {
              const { r, g, b } = hexToRgb(e.color || "#000000");
              return {
                type: e.type,
                color: { r, g, b, a: e.opacity != null ? Number(e.opacity) : 0.25 },
                offset: { x: Number((_a2 = e.offsetX) != null ? _a2 : 0), y: Number((_b2 = e.offsetY) != null ? _b2 : 4) },
                radius: Number((_c2 = e.radius) != null ? _c2 : 4),
                spread: Number((_d2 = e.spread) != null ? _d2 : 0),
                visible: (_e2 = e.visible) != null ? _e2 : true,
                blendMode: e.blendMode || "NORMAL"
              };
            }
            case "LAYER_BLUR":
            case "BACKGROUND_BLUR":
              return {
                type: e.type,
                radius: Number((_f2 = e.radius) != null ? _f2 : 4),
                visible: (_g2 = e.visible) != null ? _g2 : true
              };
            case "NOISE": {
              const noiseType = e.noiseType || "MONOTONE";
              const { r, g, b } = hexToRgb(e.color || "#000000");
              const colorAlpha = e.colorOpacity != null ? Number(e.colorOpacity) : 1;
              const noise = {
                type: "NOISE",
                noiseType,
                noiseSize: Number((_h2 = e.noiseSize) != null ? _h2 : 2),
                density: Number((_i2 = e.density) != null ? _i2 : 0.5),
                color: { r, g, b, a: colorAlpha },
                visible: (_j2 = e.visible) != null ? _j2 : true,
                blendMode: e.blendMode || "NORMAL"
              };
              if (noiseType === "DUOTONE") {
                const sc = hexToRgb(e.secondaryColor || "#ffffff");
                noise.secondaryColor = { r: sc.r, g: sc.g, b: sc.b, a: e.secondaryColorOpacity != null ? Number(e.secondaryColorOpacity) : 1 };
              }
              if (noiseType === "MULTITONE") {
                noise.opacity = e.opacity != null ? Number(e.opacity) : 0.5;
              }
              return noise;
            }
            default:
              throw new Error(`Unknown effect type: ${e.type}. Must be DROP_SHADOW, INNER_SHADOW, LAYER_BLUR, BACKGROUND_BLUR, or NOISE`);
          }
        });
        node.effects = effects;
        figma.commitUndo();
        return {
          type: request.type,
          requestId: request.requestId,
          data: { id: node.id, name: node.name, effectCount: effects.length }
        };
      }
      case "bind_variable_to_node": {
        const p = request.params || {};
        const nodeId = request.nodeIds && request.nodeIds[0];
        if (!nodeId) throw new Error("nodeId is required");
        if (!p.variableId) throw new Error("variableId is required");
        if (!p.field) throw new Error("field is required");
        const node = yield figma.getNodeByIdAsync(nodeId);
        if (!node) throw new Error(`Node not found: ${nodeId}`);
        const variable = yield figma.variables.getVariableByIdAsync(p.variableId);
        if (!variable) throw new Error(`Variable not found: ${p.variableId}`);
        if (p.field === "fillColor") {
          if (!("fills" in node)) throw new Error(`Node ${nodeId} does not support fills`);
          const fills = [...node.fills];
          const base = fills.length > 0 ? fills[0] : makeSolidPaint("#000000");
          const paint = figma.variables.setBoundVariableForPaint(base, "color", variable);
          node.fills = [paint];
        } else if (p.field === "strokeColor") {
          if (!("strokes" in node)) throw new Error(`Node ${nodeId} does not support strokes`);
          const strokes = [...node.strokes];
          const base = strokes.length > 0 ? strokes[0] : makeSolidPaint("#000000");
          const paint = figma.variables.setBoundVariableForPaint(base, "color", variable);
          node.strokes = [paint];
        } else {
          if (!(p.field in node)) throw new Error(`Node ${nodeId} does not have field: ${p.field}`);
          node.setBoundVariable(p.field, variable);
        }
        figma.commitUndo();
        return {
          type: request.type,
          requestId: request.requestId,
          data: { id: node.id, name: node.name, variableId: p.variableId, field: p.field }
        };
      }
      default:
        return null;
    }
  });
  const VALID_VARIABLE_SCOPES = /* @__PURE__ */ new Set([
    "ALL_SCOPES",
    "TEXT_CONTENT",
    "CORNER_RADIUS",
    "WIDTH_HEIGHT",
    "GAP",
    "ALL_FILLS",
    "FRAME_FILL",
    "SHAPE_FILL",
    "TEXT_FILL",
    "STROKE_COLOR",
    "STROKE_FLOAT",
    "EFFECT_FLOAT",
    "EFFECT_COLOR",
    "OPACITY",
    "FONT_FAMILY",
    "FONT_STYLE",
    "FONT_WEIGHT",
    "FONT_SIZE",
    "LINE_HEIGHT",
    "LETTER_SPACING",
    "PARAGRAPH_SPACING",
    "PARAGRAPH_INDENT"
  ]);
  const VALID_CODE_SYNTAX_PLATFORMS = /* @__PURE__ */ new Set([
    "WEB",
    "ANDROID",
    "iOS"
  ]);
  const parseGwpVariableEnvelope = (value) => {
    if (typeof value !== "string") return null;
    let parsed;
    try {
      parsed = JSON.parse(value);
    } catch (e) {
      return null;
    }
    if (!parsed || parsed.$gwpToken !== 1) return null;
    if (!Array.isArray(parsed.scopes)) {
      throw new Error("GWP token envelope requires an explicit scopes array");
    }
    for (const scope of parsed.scopes) {
      if (!VALID_VARIABLE_SCOPES.has(scope)) {
        throw new Error(`Invalid variable scope: ${scope}`);
      }
    }
    if (parsed.scopes.includes("ALL_SCOPES")) {
      throw new Error("GWP token envelope forbids ALL_SCOPES");
    }
    if (!parsed.codeSyntax || typeof parsed.codeSyntax !== "object") {
      throw new Error("GWP token envelope requires codeSyntax");
    }
    const entries = Object.entries(parsed.codeSyntax);
    if (entries.length === 0) {
      throw new Error("GWP token envelope requires at least one code syntax entry");
    }
    for (const [platform, syntax] of entries) {
      if (!VALID_CODE_SYNTAX_PLATFORMS.has(platform)) {
        throw new Error(`Invalid code syntax platform: ${platform}`);
      }
      if (typeof syntax !== "string" || syntax.trim().length === 0) {
        throw new Error(`Code syntax for ${platform} must be a non-empty string`);
      }
    }
    return parsed;
  };
  const applyVariableMetadata = (variable, envelope) => {
    variable.scopes = [...envelope.scopes];
    for (const [platform, syntax] of Object.entries(envelope.codeSyntax)) {
      variable.setVariableCodeSyntax(
        platform,
        syntax
      );
    }
    if (typeof envelope.description === "string") {
      variable.description = envelope.description;
    }
  };
  const resolveEnvelopeValue = (type, value) => __async(null, null, function* () {
    if (value && typeof value === "object" && value.type === "VARIABLE_ALIAS" && typeof value.id === "string") {
      const target = yield figma.variables.getVariableByIdAsync(value.id);
      if (!target) throw new Error(`Alias target not found: ${value.id}`);
      if (target.resolvedType !== type) {
        throw new Error(
          `Alias type mismatch: ${type} variable cannot alias ${target.resolvedType}`
        );
      }
      return figma.variables.createVariableAlias(target);
    }
    return parseVariableValue(type, value);
  });
  const parseVariableValue = (type, value) => {
    if (type === "COLOR") {
      if (typeof value === "string") {
        const { r, g, b, a } = hexToRgb(value);
        return { r, g, b, a };
      }
      return value;
    }
    if (type === "FLOAT") return typeof value === "number" ? value : parseFloat(String(value));
    if (type === "BOOLEAN") return value === true || value === "true";
    return String(value);
  };
  const handleWriteVariableRequest = (request) => __async(null, null, function* () {
    switch (request.type) {
      case "create_variable_collection": {
        const p = request.params || {};
        if (!p.name) throw new Error("name is required");
        const collection = figma.variables.createVariableCollection(p.name);
        if (p.initialModeName && collection.modes.length > 0) {
          collection.renameMode(collection.modes[0].modeId, p.initialModeName);
        }
        figma.commitUndo();
        return {
          type: request.type,
          requestId: request.requestId,
          data: {
            id: collection.id,
            name: collection.name,
            modes: collection.modes.map((m) => ({ modeId: m.modeId, name: m.name }))
          }
        };
      }
      case "add_variable_mode": {
        const p = request.params || {};
        if (!p.collectionId) throw new Error("collectionId is required");
        if (!p.modeName) throw new Error("modeName is required");
        const collection = yield figma.variables.getVariableCollectionByIdAsync(p.collectionId);
        if (!collection) throw new Error(`Collection not found: ${p.collectionId}`);
        const modeId = collection.addMode(p.modeName);
        figma.commitUndo();
        return {
          type: request.type,
          requestId: request.requestId,
          data: { collectionId: p.collectionId, modeId, modeName: p.modeName }
        };
      }
      case "create_variable": {
        const p = request.params || {};
        if (!p.name) throw new Error("name is required");
        if (!p.collectionId) throw new Error("collectionId is required");
        const validTypes = ["COLOR", "FLOAT", "STRING", "BOOLEAN"];
        if (!p.type || !validTypes.includes(p.type)) {
          throw new Error("type is required: COLOR, FLOAT, STRING, or BOOLEAN");
        }
        const collection = yield figma.variables.getVariableCollectionByIdAsync(p.collectionId);
        if (!collection) throw new Error(`Collection not found: ${p.collectionId}`);
        const envelope = parseGwpVariableEnvelope(p.value);
        const variable = figma.variables.createVariable(p.name, collection, p.type);
        try {
          if (envelope && collection.modes.length > 0) {
            const modeId = collection.modes[0].modeId;
            if (envelope.value === void 0) {
              throw new Error("GWP token envelope requires value");
            }
            const resolvedValue = yield resolveEnvelopeValue(
              variable.resolvedType,
              envelope.value
            );
            variable.setValueForMode(modeId, resolvedValue);
            applyVariableMetadata(variable, envelope);
          } else if (p.value != null && collection.modes.length > 0) {
            const modeId = collection.modes[0].modeId;
            variable.setValueForMode(modeId, parseVariableValue(p.type, p.value));
          }
        } catch (error) {
          variable.remove();
          throw error;
        }
        figma.commitUndo();
        return {
          type: request.type,
          requestId: request.requestId,
          data: {
            id: variable.id,
            name: variable.name,
            resolvedType: variable.resolvedType,
            collectionId: p.collectionId,
            scopes: variable.scopes,
            codeSyntax: variable.codeSyntax
          }
        };
      }
      case "set_variable_value": {
        const p = request.params || {};
        if (!p.variableId) throw new Error("variableId is required");
        if (!p.modeId) throw new Error("modeId is required");
        if (p.value == null) throw new Error("value is required");
        const variable = yield figma.variables.getVariableByIdAsync(p.variableId);
        if (!variable) throw new Error(`Variable not found: ${p.variableId}`);
        if (p.modeId === "__metadata__") {
          const envelope = parseGwpVariableEnvelope(p.value);
          if (!envelope) {
            throw new Error("Metadata update requires a GWP token envelope");
          }
          applyVariableMetadata(variable, envelope);
        } else {
          const envelope = parseGwpVariableEnvelope(p.value);
          const rawValue = envelope ? envelope.value : p.value;
          const resolvedValue = yield resolveEnvelopeValue(
            variable.resolvedType,
            rawValue
          );
          variable.setValueForMode(p.modeId, resolvedValue);
          if (envelope) applyVariableMetadata(variable, envelope);
        }
        figma.commitUndo();
        return {
          type: request.type,
          requestId: request.requestId,
          data: {
            variableId: variable.id,
            name: variable.name,
            modeId: p.modeId,
            scopes: variable.scopes,
            codeSyntax: variable.codeSyntax
          }
        };
      }
      case "delete_variable": {
        const p = request.params || {};
        if (p.variableId) {
          const variable = yield figma.variables.getVariableByIdAsync(p.variableId);
          if (!variable) throw new Error(`Variable not found: ${p.variableId}`);
          variable.remove();
          figma.commitUndo();
          return {
            type: request.type,
            requestId: request.requestId,
            data: { variableId: p.variableId, deleted: true }
          };
        } else if (p.collectionId) {
          const collection = yield figma.variables.getVariableCollectionByIdAsync(p.collectionId);
          if (!collection) throw new Error(`Collection not found: ${p.collectionId}`);
          collection.remove();
          figma.commitUndo();
          return {
            type: request.type,
            requestId: request.requestId,
            data: { collectionId: p.collectionId, deleted: true }
          };
        } else {
          throw new Error("variableId or collectionId is required");
        }
      }
      default:
        return null;
    }
  });
  const parseEnvelope = (value) => {
    if (typeof value !== "string" || !value.startsWith("{")) return null;
    try {
      const parsed = JSON.parse(value);
      return parsed && parsed.$gwpComponent === 1 ? parsed : null;
    } catch (e) {
      return null;
    }
  };
  const requireNode = (id) => __async(null, null, function* () {
    const node = yield figma.getNodeByIdAsync(id);
    if (!node) throw new Error(`Node not found: ${id}`);
    return node;
  });
  const loadGwpResources = () => __async(null, null, function* () {
    const [collections, variables, textStyles, effectStyles] = yield Promise.all([
      figma.variables.getLocalVariableCollectionsAsync(),
      figma.variables.getLocalVariablesAsync(),
      figma.getLocalTextStylesAsync(),
      figma.getLocalEffectStylesAsync()
    ]);
    const collectionNames = new Map(collections.map((c) => [c.id, c.name]));
    const vars = /* @__PURE__ */ new Map();
    for (const variable of variables) {
      const collectionName = collectionNames.get(variable.variableCollectionId);
      if (collectionName == null ? void 0 : collectionName.startsWith("GWP /")) {
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
      "GWP / Typography/letter-spacing/micro"
    ];
    const missing = requiredVars.filter((name) => !vars.has(name));
    if (missing.length) throw new Error(`Missing GWP variables: ${missing.join(", ")}`);
    yield Promise.all([
      figma.loadFontAsync({ family: "Noto Sans SC", style: "Regular" }),
      figma.loadFontAsync({ family: "Noto Sans SC", style: "Bold" })
    ]);
    return { vars, text, effects };
  });
  const v = (resources, name) => {
    const variable = resources.vars.get(name);
    if (!variable) throw new Error(`Variable not found: ${name}`);
    return variable;
  };
  const bindPaint = (variable) => figma.variables.setBoundVariableForPaint(
    { type: "SOLID", color: { r: 0, g: 0, b: 0 } },
    "color",
    variable
  );
  const bind = (node, field, variable) => node.setBoundVariable(field, variable);
  const configureAutoLayout = (node, direction) => {
    node.layoutMode = direction;
    node.primaryAxisAlignItems = "CENTER";
    node.counterAxisAlignItems = "CENTER";
  };
  const applyContainerTokens = (node, resources, fillVariable, state, radius = "GWP / Layout/radius/20") => __async(null, null, function* () {
    node.fills = [bindPaint(fillVariable)];
    node.strokes = [bindPaint(v(resources, "GWP / Color Primitives/white/0"))];
    bind(node, "strokeWeight", v(resources, "GWP / Layout/stroke/sticker-white"));
    for (const field of ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"]) {
      bind(node, field, v(resources, radius));
    }
    const effectName = state === "Pressed" ? "GWP/Effect/Sticker/Pressed" : "GWP/Effect/Sticker/Default";
    const effect = resources.effects.get(effectName);
    if (!effect) throw new Error(`Effect style not found: ${effectName}`);
    yield node.setEffectStyleIdAsync(effect.id);
    if (state === "Pressed") bind(node, "opacity", v(resources, "GWP / Opacity/pressed"));
    if (state === "Disabled") bind(node, "opacity", v(resources, "GWP / Opacity/disabled"));
  });
  const applySpacing = (node, resources, horizontal = "GWP / Layout/spacing/16", vertical = "GWP / Layout/spacing/12", gap = "GWP / Layout/spacing/8") => {
    bind(node, "paddingLeft", v(resources, horizontal));
    bind(node, "paddingRight", v(resources, horizontal));
    bind(node, "paddingTop", v(resources, vertical));
    bind(node, "paddingBottom", v(resources, vertical));
    bind(node, "itemSpacing", v(resources, gap));
  };
  const makeText = (_0, _1, _2, ..._3) => __async(null, [_0, _1, _2, ..._3], function* (name, characters, resources, options = {}) {
    var _a, _b, _c;
    const strong = (_a = options.strong) != null ? _a : false;
    const scale = (_b = options.scale) != null ? _b : "body";
    const text = figma.createText();
    text.name = name;
    text.fontName = { family: "Noto Sans SC", style: strong ? "Bold" : "Regular" };
    text.fontSize = scale === "body" ? 16 : scale === "caption" ? 14 : 12;
    text.characters = characters;
    text.fills = [bindPaint((_c = options.color) != null ? _c : v(resources, "GWP / Color Semantics/text/primary"))];
    bind(text, "fontFamily", v(resources, "GWP / Typography/family/body"));
    bind(text, "fontStyle", v(resources, strong ? "GWP / Typography/style/strong" : "GWP / Typography/style/regular"));
    bind(text, "fontSize", v(resources, `GWP / Typography/size/${scale}`));
    bind(text, "lineHeight", v(resources, `GWP / Typography/line-height/${scale}`));
    bind(text, "letterSpacing", v(resources, `GWP / Typography/letter-spacing/${scale}`));
    return text;
  });
  const createIconComponents = (base, resources) => __async(null, null, function* () {
    const existing = base.findAll((n) => n.type === "COMPONENT" && n.name.startsWith("GWP/Icon/"));
    if (existing.length >= 8) return existing;
    const glyphs = [
      ["Default", "●"],
      ["Back", "←"],
      ["Close", "×"],
      ["Check", "✓"],
      ["Warning", "!"],
      ["Offline", "⌁"],
      ["Lock", "◆"],
      ["Spinner", "◌"]
    ];
    const icons = [];
    for (let index = 0; index < glyphs.length; index++) {
      const [name, glyph] = glyphs[index];
      const icon = figma.createComponent();
      icon.name = `GWP/Icon/${name}`;
      icon.resize(24, 24);
      configureAutoLayout(icon, "HORIZONTAL");
      icon.primaryAxisSizingMode = "FIXED";
      icon.counterAxisSizingMode = "FIXED";
      icon.fills = [];
      const text = yield makeText("Icon/Glyph", glyph, resources, { strong: true, scale: "body" });
      icon.appendChild(text);
      base.appendChild(icon);
      icon.x = 100 + index * 52;
      icon.y = 120;
      icons.push(icon);
    }
    return icons;
  });
  const iconByName = (base, name) => {
    const icon = base.findOne((n) => n.type === "COMPONENT" && n.name === `GWP/Icon/${name}`);
    if (!icon || icon.type !== "COMPONENT") throw new Error(`Icon component missing: ${name}`);
    return icon;
  };
  const appendIcon = (parent, base, name, layerName = "Icon") => {
    const instance = iconByName(base, name).createInstance();
    instance.name = layerName;
    parent.appendChild(instance);
    return instance;
  };
  const roleFill = (resources, role) => {
    if (["Primary", "Emphasis"].includes(role)) return v(resources, "GWP / Color Semantics/brand");
    if (["Danger", "Error"].includes(role)) return v(resources, "GWP / Color Semantics/danger");
    if (["Success", "Completed"].includes(role)) return v(resources, "GWP / Color Semantics/success");
    if (["Warning", "Offline"].includes(role)) return v(resources, "GWP / Color Semantics/warning");
    if (role === "Locked") return v(resources, "GWP / Color Semantics/surface");
    if (role === "Info") return v(resources, "GWP / Color Semantics/accent");
    return v(resources, "GWP / Color Semantics/surface");
  };
  const createButtonVariants = (base, resources) => __async(null, null, function* () {
    const records = [];
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
          yield applyContainerTokens(component, resources, state === "Disabled" ? roleFill(resources, "Locked") : roleFill(resources, role), state, "GWP / Layout/radius/pill");
          const icon = appendIcon(component, base, state === "Loading" ? "Spinner" : "Default", "Leading Icon");
          const label = yield makeText("Label", state === "Loading" ? "加载中…" : role === "Danger" ? "确认删除" : "开始压扁", resources, { strong: true });
          component.appendChild(label);
          records.push({ component, labels: { Label: label }, icon });
        }
      }
    }
    return records;
  });
  const createIconButtonVariants = (base, resources) => __async(null, null, function* () {
    const records = [];
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
          yield applyContainerTokens(component, resources, state === "Disabled" ? roleFill(resources, "Locked") : roleFill(resources, role), state, "GWP / Layout/radius/pill");
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
  });
  const createSegmentVariants = (_base, resources) => __async(null, null, function* () {
    const records = [];
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
          yield applyContainerTokens(component, resources, v(resources, "GWP / Color Semantics/surface"), state, "GWP / Layout/radius/pill");
          const labels = {};
          for (let index = 1; index <= items; index++) {
            const segment = figma.createFrame();
            segment.name = `Segment ${index}`;
            segment.resize(100, 40);
            configureAutoLayout(segment, "HORIZONTAL");
            segment.primaryAxisSizingMode = "FIXED";
            segment.counterAxisSizingMode = "FIXED";
            segment.fills = [bindPaint(String(index) === selected ? v(resources, "GWP / Color Semantics/brand") : v(resources, "GWP / Color Semantics/surface"))];
            for (const field of ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"]) bind(segment, field, v(resources, "GWP / Layout/radius/pill"));
            const label = yield makeText(`Item ${index}`, index === 1 ? "全部" : index === 2 ? "已发现" : "已完成", resources, { strong: String(index) === selected });
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
  });
  const createStatusPillVariants = (base, resources) => __async(null, null, function* () {
    const records = [];
    for (const tone of ["Info", "Success", "Warning", "Locked", "Completed"]) {
      for (const emphasis of ["Default", "Emphasized"]) {
        const component = figma.createComponent();
        component.name = `Tone=${tone}, Emphasis=${emphasis}`;
        component.resize(96, 36);
        configureAutoLayout(component, "HORIZONTAL");
        component.primaryAxisSizingMode = "AUTO";
        component.counterAxisSizingMode = "AUTO";
        applySpacing(component, resources, "GWP / Layout/spacing/12", "GWP / Layout/spacing/4", "GWP / Layout/spacing/4");
        yield applyContainerTokens(component, resources, roleFill(resources, tone), "Default", "GWP / Layout/radius/pill");
        if (emphasis === "Default") bind(component, "opacity", v(resources, "GWP / Opacity/secondary"));
        const iconName = tone === "Locked" ? "Lock" : tone === "Warning" ? "Warning" : tone === "Info" ? "Default" : "Check";
        const icon = appendIcon(component, base, iconName, "Status Icon");
        const label = yield makeText("Label", tone === "Info" ? "新内容" : tone === "Success" ? "成功" : tone === "Warning" ? "注意" : tone === "Locked" ? "未解锁" : "已完成", resources, { strong: emphasis === "Emphasized", scale: "caption" });
        component.appendChild(label);
        records.push({ component, labels: { Label: label }, icon });
      }
    }
    return records;
  });
  const createProgressVariants = (base, resources) => __async(null, null, function* () {
    const records = [];
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
        yield applyContainerTokens(component, resources, v(resources, "GWP / Color Semantics/surface"), "Default", "GWP / Layout/radius/12");
        let label;
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
          label = yield makeText("Label", state === "Completed" ? "完成" : state === "Error" ? "重试" : "50%", resources, { strong: true, scale: "caption" });
          component.appendChild(label);
        } else if (kind === "Stars") {
          label = yield makeText("Label", state === "Completed" ? "★★★" : state === "Error" ? "☆☆☆" : state === "Loading" ? "★☆☆" : "★★☆", resources, { strong: true });
          component.appendChild(label);
        } else {
          appendIcon(component, base, "Spinner", "Loading Icon");
          label = yield makeText("Label", state === "Error" ? "加载失败" : state === "Completed" ? "加载完成" : "加载中…", resources, { strong: true, scale: "caption" });
          component.appendChild(label);
        }
        records.push({ component, labels: { Label: label } });
      }
    }
    return records;
  });
  const createMessageVariants = (base, resources) => __async(null, null, function* () {
    const records = [];
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
        yield applyContainerTokens(component, resources, v(resources, "GWP / Color Semantics/surface"), "Default", "GWP / Layout/radius/20");
        const toneBar = figma.createRectangle();
        toneBar.name = "Tone Bar";
        toneBar.resize(4, kind === "Toast" ? 28 : 44);
        toneBar.fills = [bindPaint(roleFill(resources, tone))];
        bind(toneBar, "width", v(resources, "GWP / Layout/spacing/4"));
        bind(toneBar, "cornerRadius", v(resources, "GWP / Layout/radius/pill"));
        component.appendChild(toneBar);
        const iconName = tone === "Success" ? "Check" : tone === "Error" ? "Warning" : tone === "Offline" ? "Offline" : "Default";
        const icon = appendIcon(component, base, iconName, "Message Icon");
        const message = yield makeText("Message", tone === "Info" ? "设置已保存" : tone === "Success" ? "领取成功" : tone === "Error" ? "操作失败，请重试" : "网络不可用，已保留本地进度", resources, { strong: kind === "Toast", scale: kind === "Toast" ? "caption" : "body" });
        component.appendChild(message);
        message.layoutGrow = 1;
        records.push({ component, labels: { Message: message }, icon });
      }
    }
    return records;
  });
  const createLoadingVariants = (base, resources) => __async(null, null, function* () {
    const records = [];
    for (const context of ["Startup", "Local", "Button"]) {
      const component = figma.createComponent();
      component.name = `Context=${context}`;
      component.resize(context === "Startup" ? 320 : 120, context === "Startup" ? 96 : 48);
      configureAutoLayout(component, context === "Startup" ? "VERTICAL" : "HORIZONTAL");
      component.primaryAxisSizingMode = context === "Startup" ? "FIXED" : "AUTO";
      component.counterAxisSizingMode = context === "Startup" ? "FIXED" : "AUTO";
      if (context === "Startup") bind(component, "width", v(resources, "GWP / Layout/size/canvas-min-width"));
      applySpacing(component, resources, "GWP / Layout/spacing/16", "GWP / Layout/spacing/12", "GWP / Layout/spacing/8");
      yield applyContainerTokens(component, resources, context === "Button" ? v(resources, "GWP / Color Semantics/brand") : v(resources, "GWP / Color Semantics/surface"), "Default", "GWP / Layout/radius/20");
      appendIcon(component, base, "Spinner", "Spinner");
      const label = yield makeText("Label", context === "Startup" ? "正在启动压扁工坊…" : context === "Local" ? "加载中…" : "处理中…", resources, { strong: true, scale: "caption" });
      component.appendChild(label);
      records.push({ component, labels: { Label: label } });
    }
    return records;
  });
  const familyConfig = {
    Button: { setName: "GWP/A-Button", title: "Button", description: "主、次与危险文本按钮，覆盖 M/L 与 Default、Pressed、Disabled、Loading。", usage: "用于明确动作；禁止同一页面出现多个 Primary，也禁止用图片烘焙文字。", columns: 4, creator: createButtonVariants },
    IconButton: { setName: "GWP/A-IconButton", title: "IconButton", description: "44/52 触控热区的普通、强调、返回与关闭按钮。", usage: "Icon 使用 INSTANCE_SWAP；禁止为每个图标建立 variant。", columns: 3, creator: createIconButtonVariants },
    Segment: { setName: "GWP/A-SegmentedControl", title: "Tab / Segment", description: "2/3 项文字分页，显式建模当前项与 Default、Pressed、Disabled。", usage: "用于同层内容切换；禁止承载页面主导航或超过 3 项。", columns: 3, creator: createSegmentVariants },
    StatusPill: { setName: "GWP/A-StatusPill", title: "Badge / StatusPill", description: "Info、Success、Warning、Locked、Completed 状态胶囊。", usage: "用于短状态；禁止塞入长句或替代按钮。", columns: 2, creator: createStatusPillVariants },
    Progress: { setName: "GWP/A-Progress", title: "Progress", description: "Linear、Stars、Loading 三类进度与 Default、Loading、Completed、Error。", usage: "只表达进度或结果；禁止以动效制造虚假进度。", columns: 4, creator: createProgressVariants },
    Message: { setName: "GWP/C-Toast-InlineMessage", title: "Toast / InlineMessage", description: "Toast 与 Inline 两种密度，覆盖 Info、Success、Error、Offline。", usage: "Toast 短暂反馈，Inline 保留上下文；禁止用 Toast 承载必须确认的信息。", columns: 4, creator: createMessageVariants },
    Loading: { setName: "GWP/A-Loading", title: "Loading", description: "Startup、Local、Button 三种加载上下文。", usage: "用于真实等待；禁止无结束条件的装饰性旋转。", columns: 3, creator: createLoadingVariants }
  };
  const addDocumentation = (frame, config, resources) => __async(null, null, function* () {
    const title = yield makeText(`${config.title}/Title`, config.title, resources, { strong: true });
    title.x = 100;
    title.y = 60;
    frame.appendChild(title);
    const description = yield makeText(`${config.title}/Description`, config.description, resources, { scale: "caption" });
    description.x = 100;
    description.y = 110;
    frame.appendChild(description);
    const usage = yield makeText(`${config.title}/Usage`, `用法：${config.usage}`, resources, { scale: "micro" });
    usage.x = 100;
    usage.y = 155;
    frame.appendChild(usage);
    return [title.id, description.id, usage.id];
  });
  const wireProperties = (set, records, family, base) => {
    const propertyKeys = {};
    const addTextProperty = (property, fallback) => {
      var _a, _b;
      const key = set.addComponentProperty(property, "TEXT", fallback);
      propertyKeys[property] = key;
      for (const record of records) {
        const node = (_a = record.labels) == null ? void 0 : _a[property];
        if (node) node.componentPropertyReferences = __spreadProps(__spreadValues({}, (_b = node.componentPropertyReferences) != null ? _b : {}), { characters: key });
      }
    };
    const addBooleanProperty = (property, defaultValue, selector) => {
      var _a;
      const key = set.addComponentProperty(property, "BOOLEAN", defaultValue);
      propertyKeys[property] = key;
      for (const record of records) {
        const node = selector(record);
        if (node) node.componentPropertyReferences = __spreadProps(__spreadValues({}, (_a = node.componentPropertyReferences) != null ? _a : {}), { visible: key });
      }
    };
    const addIconProperty = (property, fallback) => {
      var _a;
      const defaultIcon = iconByName(base, fallback);
      const key = set.addComponentProperty(property, "INSTANCE_SWAP", defaultIcon.id);
      propertyKeys[property] = key;
      for (const record of records) {
        if (record.icon) record.icon.componentPropertyReferences = __spreadProps(__spreadValues({}, (_a = record.icon.componentPropertyReferences) != null ? _a : {}), { mainComponent: key });
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
      addBooleanProperty("Show Label", true, (r) => {
        var _a;
        return (_a = r.labels) == null ? void 0 : _a.Label;
      });
    } else if (family === "Message") {
      addTextProperty("Message", "设置已保存");
      addBooleanProperty("Show Icon", true, (r) => r.icon);
      addIconProperty("Icon", "Default");
    } else if (family === "Loading") {
      addTextProperty("Label", "加载中…");
      addBooleanProperty("Show Label", true, (r) => {
        var _a;
        return (_a = r.labels) == null ? void 0 : _a.Label;
      });
    }
    return propertyKeys;
  };
  const removePropertyReference = (node, field) => {
    var _a;
    if (!("componentPropertyReferences" in node)) return;
    const refs = __spreadValues({}, (_a = node.componentPropertyReferences) != null ? _a : {});
    delete refs[field];
    node.componentPropertyReferences = refs;
  };
  const setTextCharacters = (node, characters) => __async(null, null, function* () {
    if (node.fontName === figma.mixed) throw new Error(`Mixed font in semantic preset: ${node.id}`);
    yield figma.loadFontAsync(node.fontName);
    node.characters = characters;
  });
  const applyFamilyPresets = (set, records, family, base, resources, propertyKeys) => __async(null, null, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
    const mutatedNodeIds = [];
    const defaultIcon = iconByName(base, "Default");
    const editDefault = (key, value) => {
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
        const role = (_b = (_a = /Role=([^,]+)/.exec(name)) == null ? void 0 : _a[1]) != null ? _b : "Neutral";
        if (role === "Back" || role === "Close") {
          removePropertyReference(record.icon, "mainComponent");
          record.icon.swapComponent(iconByName(base, role));
        } else {
          record.icon.swapComponent(defaultIcon);
          record.icon.componentPropertyReferences = __spreadProps(__spreadValues({}, (_c = record.icon.componentPropertyReferences) != null ? _c : {}), {
            mainComponent: propertyKeys.Icon
          });
        }
        record.icon.name = "Icon";
        mutatedNodeIds.push(record.icon.id);
      }
      if (family === "Button") {
        const role = (_e = (_d = /Role=([^,]+)/.exec(name)) == null ? void 0 : _d[1]) != null ? _e : "Primary";
        const state = (_g = (_f = /State=([^,]+)/.exec(name)) == null ? void 0 : _f[1]) != null ? _g : "Default";
        const label = (_h = record.labels) == null ? void 0 : _h.Label;
        if (state === "Disabled") {
          record.component.fills = [bindPaint(v(resources, "GWP / Color Semantics/surface"))];
          mutatedNodeIds.push(record.component.id);
        }
        if (label && (role === "Danger" || state === "Loading")) {
          removePropertyReference(label, "characters");
          yield setTextCharacters(label, state === "Loading" ? "加载中…" : "确认删除");
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
        const tone = (_j = (_i = /Tone=([^,]+)/.exec(name)) == null ? void 0 : _i[1]) != null ? _j : "Info";
        const label = (_k = record.labels) == null ? void 0 : _k.Label;
        if (tone === "Locked") {
          record.component.fills = [bindPaint(v(resources, "GWP / Color Semantics/surface"))];
          mutatedNodeIds.push(record.component.id);
        }
        if (tone !== "Info" && label) {
          removePropertyReference(label, "characters");
          const copy = tone === "Success" ? "成功" : tone === "Warning" ? "注意" : tone === "Locked" ? "未解锁" : "已完成";
          yield setTextCharacters(label, copy);
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
        const kind = (_m = (_l = /Kind=([^,]+)/.exec(name)) == null ? void 0 : _l[1]) != null ? _m : "Linear";
        const state = (_o = (_n = /State=([^,]+)/.exec(name)) == null ? void 0 : _n[1]) != null ? _o : "Default";
        const label = (_p = record.labels) == null ? void 0 : _p.Label;
        const customizable = kind === "Linear" && (state === "Default" || state === "Loading");
        if (label && !customizable) {
          removePropertyReference(label, "characters");
          const copy = kind === "Linear" ? state === "Completed" ? "完成" : "重试" : kind === "Stars" ? state === "Completed" ? "★★★" : state === "Error" ? "☆☆☆" : state === "Loading" ? "★☆☆" : "★★☆" : state === "Error" ? "加载失败" : state === "Completed" ? "加载完成" : "加载中…";
          yield setTextCharacters(label, copy);
          mutatedNodeIds.push(label.id);
        }
      }
      if (family === "Message") {
        const tone = (_r = (_q = /Tone=([^,]+)/.exec(name)) == null ? void 0 : _q[1]) != null ? _r : "Info";
        const message = (_s = record.labels) == null ? void 0 : _s.Message;
        if (tone !== "Info" && message) {
          removePropertyReference(message, "characters");
          const copy = tone === "Success" ? "领取成功" : tone === "Error" ? "操作失败，请重试" : "网络不可用，已保留本地进度";
          yield setTextCharacters(message, copy);
          mutatedNodeIds.push(message.id);
        }
        if (record.icon && tone !== "Info") {
          removePropertyReference(record.icon, "mainComponent");
          record.icon.swapComponent(iconByName(base, tone === "Success" ? "Check" : tone === "Error" ? "Warning" : "Offline"));
          mutatedNodeIds.push(record.icon.id);
        }
      }
      if (family === "Loading") {
        const context = (_u = (_t = /Context=([^,]+)/.exec(name)) == null ? void 0 : _t[1]) != null ? _u : "Local";
        const label = (_v = record.labels) == null ? void 0 : _v.Label;
        if (label && context !== "Local") {
          removePropertyReference(label, "characters");
          yield setTextCharacters(label, context === "Startup" ? "正在启动压扁工坊…" : "处理中…");
          mutatedNodeIds.push(label.id);
        }
      }
      if (family === "IconButton") {
        const state = (_x = (_w = /State=([^,]+)/.exec(name)) == null ? void 0 : _w[1]) != null ? _x : "Default";
        if (state === "Disabled") {
          record.component.fills = [bindPaint(v(resources, "GWP / Color Semantics/surface"))];
          mutatedNodeIds.push(record.component.id);
        }
      }
    }
    return mutatedNodeIds;
  });
  const auditSet = (set) => __async(null, null, function* () {
    var _a, _b;
    const descendants = set.findAll();
    const components = set.children.filter((n) => n.type === "COMPONENT");
    const hardcodedPaints = [];
    const bindingCounts = {};
    const propertyReferences = [];
    const autoLayoutFailures = [];
    for (const node of [set, ...descendants]) {
      const anyNode = node;
      if (node.type === "COMPONENT" && anyNode.layoutMode === "NONE") autoLayoutFailures.push(node.id);
      const nodeBindings = anyNode.boundVariables || {};
      for (const field of Object.keys(nodeBindings)) bindingCounts[field] = (bindingCounts[field] || 0) + 1;
      if ("fills" in anyNode && Array.isArray(anyNode.fills)) {
        for (const paint of anyNode.fills) {
          if (paint.type === "SOLID" && !((_a = paint.boundVariables) == null ? void 0 : _a.color) && !anyNode.fillStyleId) hardcodedPaints.push({ id: node.id, name: node.name, property: "fills" });
        }
      }
      if ("strokes" in anyNode && Array.isArray(anyNode.strokes)) {
        for (const paint of anyNode.strokes) {
          if (paint.type === "SOLID" && !((_b = paint.boundVariables) == null ? void 0 : _b.color) && !anyNode.strokeStyleId) hardcodedPaints.push({ id: node.id, name: node.name, property: "strokes" });
        }
      }
      if (anyNode.componentPropertyReferences && Object.keys(anyNode.componentPropertyReferences).length) {
        propertyReferences.push({ id: node.id, name: node.name, references: anyNode.componentPropertyReferences });
      }
    }
    const opacityBindings = components.filter((component) => /State=(Pressed|Disabled)/.test(component.name)).map((component) => {
      var _a2, _b2, _c;
      return {
        id: component.id,
        name: component.name,
        opacityVariableId: (_c = (_b2 = (_a2 = component.boundVariables) == null ? void 0 : _a2.opacity) == null ? void 0 : _b2.id) != null ? _c : null,
        resolvedOpacity: component.opacity
      };
    });
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
      bounds: getBounds(set)
    };
  });
  const prepareBase = (componentsFrame, resources) => __async(null, null, function* () {
    let base = componentsFrame.findOne((n) => n.type === "FRAME" && n.name === "02_Components/Base");
    const createdNodeIds = [];
    const mutatedNodeIds = [componentsFrame.id];
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
      yield base.setEffectStyleIdAsync(raised.id);
      componentsFrame.appendChild(base);
      createdNodeIds.push(base.id);
    }
    componentsFrame.resizeWithoutConstraints(6080, 8200);
    componentsFrame.x = 160;
    componentsFrame.y = 9180;
    const subtitle = componentsFrame.findOne((n) => n.type === "TEXT" && n.name === "placeholder/02_Components/subtitle");
    if (subtitle) {
      yield figma.loadFontAsync(typeof subtitle.fontName === "symbol" ? { family: "Noto Sans SC", style: "Regular" } : subtitle.fontName);
      subtitle.characters = "GWP-015 · Base interaction components · 逐个创建、验证与截图";
      mutatedNodeIds.push(subtitle.id);
    }
    const section = componentsFrame.parent;
    if ((section == null ? void 0 : section.type) === "SECTION") {
      const positions = {
        "03_User_Flows": [160, 17540],
        "04_Core_Screens": [3280, 17540],
        "05_Modes_And_Collection": [160, 18500],
        "06_Overlays_And_States": [3280, 18500],
        "07_Prototype": [160, 19460],
        "08_Dev_Handoff": [3280, 19460],
        "99_Archive": [160, 20420]
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
    const icons = yield createIconComponents(base, resources);
    for (const icon of icons) if (!createdNodeIds.includes(icon.id)) createdNodeIds.push(icon.id);
    figma.commitUndo();
    return { base, createdNodeIds, mutatedNodeIds, iconIds: icons.map((icon) => icon.id) };
  });
  const buildFamily = (base, family, resources) => __async(null, null, function* () {
    const config = familyConfig[family];
    if (!config) throw new Error(`Unsupported GWP family: ${family}`);
    const existing = base.findOne((n) => n.type === "COMPONENT_SET" && n.name === config.setName);
    if (existing) return { skipped: true, family, componentSetId: existing.id, audit: yield auditSet(existing), createdNodeIds: [], mutatedNodeIds: [] };
    const familyFrames = base.children.filter((n) => n.type === "FRAME" && n.name.startsWith("Base/"));
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
    const docTextIds = yield addDocumentation(doc, config, resources);
    const records = yield config.creator(base, resources);
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
      component.x = 40 + index % config.columns * cellWidth;
      component.y = 40 + Math.floor(index / config.columns) * cellHeight;
    });
    const rows = Math.ceil(components.length / config.columns);
    set.resizeWithoutConstraints(80 + config.columns * cellWidth, 80 + rows * cellHeight);
    set.x = 100;
    set.y = 240;
    const propertyKeys = wireProperties(set, records, family, base);
    const semanticPresetMutations = yield applyFamilyPresets(set, records, family, base, resources, propertyKeys);
    const docHeight = set.y + set.height + 80;
    doc.resizeWithoutConstraints(5640, docHeight);
    base.resizeWithoutConstraints(5840, doc.y + doc.height + 100);
    const parent = base.parent;
    if ((parent == null ? void 0 : parent.type) === "FRAME") parent.resizeWithoutConstraints(6080, base.y + base.height + 120);
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
      mutatedNodeIds: [base.id, parent == null ? void 0 : parent.id, ...semanticPresetMutations].filter(Boolean),
      audit: yield auditSet(set)
    };
  });
  const createCapabilityProbe = (parent, resources) => __async(null, null, function* () {
    const existing = parent.findOne((n) => n.type === "COMPONENT_SET" && n.name === "GWP/Probe/ComponentCapabilities");
    if (existing) return { probeId: existing.id, createdNodeIds: [], audit: yield auditSet(existing) };
    const icon = iconByName(parent, "Default");
    const records = [];
    for (const state of ["Default", "Pressed"]) {
      const component = figma.createComponent();
      component.name = `State=${state}`;
      component.resize(160, 48);
      configureAutoLayout(component, "HORIZONTAL");
      component.primaryAxisSizingMode = "AUTO";
      component.counterAxisSizingMode = "FIXED";
      applySpacing(component, resources);
      yield applyContainerTokens(component, resources, v(resources, "GWP / Color Semantics/brand"), state, "GWP / Layout/radius/pill");
      const instance = icon.createInstance();
      instance.name = "Icon";
      component.appendChild(instance);
      const label = yield makeText("Label", "能力探针", resources, { strong: true });
      component.appendChild(label);
      records.push({ component, labels: { Label: label }, icon: instance });
    }
    const set = figma.combineAsVariants(records.map((record) => record.component), parent);
    set.name = "GWP/Probe/ComponentCapabilities";
    set.description = "Temporary GWP-015 capability probe; delete after validation.";
    set.fills = [];
    records.forEach((record, index) => {
      record.component.x = 40 + index * 220;
      record.component.y = 40;
    });
    set.resizeWithoutConstraints(520, 128);
    set.x = 4700;
    set.y = 100;
    const labelKey = set.addComponentProperty("Label", "TEXT", "能力探针");
    const showKey = set.addComponentProperty("Show Icon", "BOOLEAN", true);
    const iconKey = set.addComponentProperty("Icon", "INSTANCE_SWAP", icon.id);
    for (const record of records) {
      record.labels.Label.componentPropertyReferences = { characters: labelKey };
      record.icon.componentPropertyReferences = { visible: showKey, mainComponent: iconKey };
    }
    figma.commitUndo();
    return { probeId: set.id, createdNodeIds: [set.id, ...records.map((record) => record.component.id)], propertyKeys: { labelKey, showKey, iconKey }, audit: yield auditSet(set) };
  });
  const handleWriteComponentRequest = (request) => __async(null, null, function* () {
    var _a, _b;
    switch (request.type) {
      case "create_component": {
        const p = request.params || {};
        const nodeId = request.nodeIds && request.nodeIds[0];
        if (!nodeId) throw new Error("nodeId is required");
        const envelope = parseEnvelope(p.name);
        if (!envelope) return null;
        const resources = yield loadGwpResources();
        const node = yield requireNode(nodeId);
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
            data: { recoveredFrameId: frame.id, removedComponentId: nodeId, createdNodeIds: [frame.id], mutatedNodeIds: [] }
          };
        }
        if (envelope.operation === "prepare-base") {
          if (node.type !== "FRAME" || node.name !== "02_Components") throw new Error("prepare-base must target 02_Components frame");
          const result = yield prepareBase(node, resources);
          return { type: request.type, requestId: request.requestId, data: __spreadValues({ baseId: result.base.id }, result) };
        }
        if (envelope.operation === "capability-probe") {
          if (node.type !== "FRAME" || node.name !== "02_Components/Base") throw new Error("capability-probe must target 02_Components/Base");
          const result = yield createCapabilityProbe(node, resources);
          return { type: request.type, requestId: request.requestId, data: result };
        }
        if (envelope.operation === "build-family") {
          if (node.type !== "FRAME" || node.name !== "02_Components/Base") throw new Error("build-family must target 02_Components/Base");
          if (!envelope.family) throw new Error("family is required");
          const result = yield buildFamily(node, envelope.family, resources);
          return { type: request.type, requestId: request.requestId, data: result };
        }
        if (envelope.operation === "repair-family-presets") {
          if (node.type !== "COMPONENT_SET") throw new Error("repair-family-presets must target a GWP component set");
          const family = (_a = Object.entries(familyConfig).find(([, config]) => config.setName === node.name)) == null ? void 0 : _a[0];
          if (!family) throw new Error(`No GWP family configuration for ${node.name}`);
          const base = (_b = node.parent) == null ? void 0 : _b.parent;
          if (!base || base.type !== "FRAME" || base.name !== "02_Components/Base") {
            throw new Error("component set is not inside 02_Components/Base documentation frame");
          }
          const propertyKeys = Object.fromEntries(Object.entries(node.componentPropertyDefinitions).filter(([, definition]) => !["VARIANT"].includes(definition.type)).map(([key]) => [key.split("#")[0], key]));
          const records = node.children.filter((child) => child.type === "COMPONENT").map((component) => {
            const labelName = family === "Message" ? "Message" : "Label";
            const label = component.findOne((child) => child.type === "TEXT" && child.name === labelName);
            const icon = component.findOne((child) => child.type === "INSTANCE");
            return { component, labels: label ? { [labelName]: label } : void 0, icon: icon != null ? icon : void 0 };
          });
          const mutatedNodeIds = yield applyFamilyPresets(node, records, family, base, resources, propertyKeys);
          figma.commitUndo();
          return {
            type: request.type,
            requestId: request.requestId,
            data: { componentSetId: node.id, mutatedNodeIds, audit: yield auditSet(node) }
          };
        }
        if (envelope.operation === "audit") {
          if (node.type !== "COMPONENT_SET") throw new Error("audit must target a COMPONENT_SET");
          return { type: request.type, requestId: request.requestId, data: { audit: yield auditSet(node) } };
        }
        throw new Error(`Unsupported GWP component operation: ${envelope.operation}`);
      }
      case "swap_component": {
        const p = request.params || {};
        const nodeId = request.nodeIds && request.nodeIds[0];
        if (!nodeId) throw new Error("nodeId is required");
        if (!p.componentId) throw new Error("componentId is required");
        const node = yield figma.getNodeByIdAsync(nodeId);
        if (!node) throw new Error(`Node not found: ${nodeId}`);
        if (node.type !== "INSTANCE") throw new Error(`Node ${nodeId} is not a component INSTANCE`);
        const component = yield figma.getNodeByIdAsync(p.componentId);
        if (!component) throw new Error(`Component not found: ${p.componentId}`);
        if (component.type !== "COMPONENT") throw new Error(`Node ${p.componentId} is not a COMPONENT`);
        node.mainComponent = component;
        figma.commitUndo();
        return { type: request.type, requestId: request.requestId, data: { id: node.id, name: node.name, componentId: component.id, componentName: component.name } };
      }
      case "detach_instance": {
        const nodeIds = request.nodeIds || [];
        if (nodeIds.length === 0) throw new Error("nodeIds is required");
        const results = [];
        for (const nid of nodeIds) {
          const n = yield figma.getNodeByIdAsync(nid);
          if (!n) {
            results.push({ nodeId: nid, error: "Node not found" });
            continue;
          }
          if (n.type !== "INSTANCE") {
            results.push({ nodeId: nid, error: "Node is not an INSTANCE" });
            continue;
          }
          const frame = n.detachInstance();
          results.push({ nodeId: nid, newId: frame.id, name: frame.name });
        }
        figma.commitUndo();
        return { type: request.type, requestId: request.requestId, data: { results } };
      }
      case "delete_nodes": {
        const nodeIds = request.nodeIds || [];
        if (nodeIds.length === 0) throw new Error("nodeIds is required");
        const results = [];
        for (const nid of nodeIds) {
          const n = yield figma.getNodeByIdAsync(nid);
          if (!n) {
            results.push({ nodeId: nid, error: "Node not found" });
            continue;
          }
          n.remove();
          results.push({ nodeId: nid, deleted: true });
        }
        figma.commitUndo();
        return { type: request.type, requestId: request.requestId, data: { results } };
      }
      case "navigate_to_page": {
        const p = request.params || {};
        let page;
        if (p.pageId) {
          const found = yield figma.getNodeByIdAsync(p.pageId);
          if (!found) throw new Error(`Page not found: ${p.pageId}`);
          if (found.type !== "PAGE") throw new Error(`Node ${p.pageId} is not a PAGE`);
          page = found;
        } else if (p.pageName) {
          page = figma.root.children.find((pg) => pg.name === p.pageName);
          if (!page) throw new Error(`Page not found with name: ${p.pageName}`);
        } else {
          throw new Error("pageId or pageName is required");
        }
        yield figma.setCurrentPageAsync(page);
        return { type: request.type, requestId: request.requestId, data: { id: page.id, name: page.name } };
      }
      case "group_nodes": {
        const p = request.params || {};
        const nodeIds = request.nodeIds || [];
        if (nodeIds.length === 0) throw new Error("nodeIds is required");
        const nodes = yield Promise.all(nodeIds.map((id) => figma.getNodeByIdAsync(id)));
        const validNodes = nodes.filter((n) => n !== null && n.type !== "DOCUMENT" && n.type !== "PAGE");
        if (validNodes.length === 0) throw new Error("No valid scene nodes found");
        const parent = validNodes[0].parent;
        if (!parent) throw new Error("Nodes must have a parent");
        const group = figma.group(validNodes, parent);
        if (p.name) group.name = p.name;
        figma.commitUndo();
        return { type: request.type, requestId: request.requestId, data: { id: group.id, name: group.name, type: group.type } };
      }
      case "ungroup_nodes": {
        const nodeIds = request.nodeIds || [];
        if (nodeIds.length === 0) throw new Error("nodeIds is required");
        const results = [];
        for (const nid of nodeIds) {
          const n = yield figma.getNodeByIdAsync(nid);
          if (!n) {
            results.push({ nodeId: nid, error: "Node not found" });
            continue;
          }
          if (n.type !== "GROUP") {
            results.push({ nodeId: nid, error: "Node is not a GROUP" });
            continue;
          }
          const group = n;
          const parent = group.parent;
          const index = parent.children.indexOf(group);
          const childIds = [];
          for (const child of [...group.children]) {
            parent.insertChild(index, child);
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
  });
  function buildReaction(r) {
    var _a, _b;
    const actions = (_a = r.actions) != null ? _a : r.action != null ? [r.action] : [];
    return { trigger: (_b = r.trigger) != null ? _b : null, actions };
  }
  function parseArray(v2) {
    if (Array.isArray(v2)) return v2;
    if (typeof v2 === "string") {
      try {
        return JSON.parse(v2);
      } catch (e) {
        return [];
      }
    }
    return [];
  }
  function setReactions(node, reactions) {
    return __async(this, null, function* () {
      if (typeof node.setReactionsAsync === "function") {
        yield node.setReactionsAsync(reactions);
        return;
      }
      try {
        node.reactions = reactions;
      } catch (e) {
        throw new Error(`Failed to set reactions: ${e instanceof Error ? e.message : String(e)}`);
      }
    });
  }
  const handleWritePrototypeRequest = (request) => __async(null, null, function* () {
    switch (request.type) {
      case "set_reactions": {
        const p = request.params || {};
        const nodeId = request.nodeIds && request.nodeIds[0];
        if (!nodeId) throw new Error("nodeId is required");
        const node = yield figma.getNodeByIdAsync(nodeId);
        if (!node) throw new Error(`Node not found: ${nodeId}`);
        if (!("reactions" in node)) throw new Error(`Node ${nodeId} does not support reactions`);
        const incoming = parseArray(p.reactions).map(buildReaction);
        const current = node.reactions;
        const final = p.mode === "append" ? [...current, ...incoming] : incoming;
        yield setReactions(node, final);
        figma.commitUndo();
        return {
          type: request.type,
          requestId: request.requestId,
          data: { id: node.id, name: node.name, reactionCount: final.length }
        };
      }
      case "remove_reactions": {
        const p = request.params || {};
        const nodeId = request.nodeIds && request.nodeIds[0];
        if (!nodeId) throw new Error("nodeId is required");
        const node = yield figma.getNodeByIdAsync(nodeId);
        if (!node) throw new Error(`Node not found: ${nodeId}`);
        if (!("reactions" in node)) throw new Error(`Node ${nodeId} does not support reactions`);
        const current = node.reactions;
        let updated;
        if (p.indices == null) {
          updated = [];
        } else {
          const indices = parseArray(p.indices);
          if (indices.length === 0) {
            updated = [];
          } else {
            const toRemove = new Set(indices);
            updated = current.filter((_, i) => !toRemove.has(i));
          }
        }
        yield setReactions(node, updated);
        figma.commitUndo();
        return {
          type: request.type,
          requestId: request.requestId,
          data: {
            id: node.id,
            name: node.name,
            removed: current.length - updated.length,
            reactionCount: updated.length
          }
        };
      }
      default:
        return null;
    }
  });
  const handleWritePageRequest = (request) => __async(null, null, function* () {
    switch (request.type) {
      case "add_page": {
        const p = request.params || {};
        const page = figma.createPage();
        if (p.name) page.name = p.name;
        if (p.index != null) {
          figma.root.insertChild(Number(p.index), page);
        }
        figma.commitUndo();
        return {
          type: request.type,
          requestId: request.requestId,
          data: {
            id: page.id,
            name: page.name,
            index: figma.root.children.indexOf(page)
          }
        };
      }
      case "delete_page": {
        const p = request.params || {};
        let page;
        if (p.pageId) {
          const found = yield figma.getNodeByIdAsync(p.pageId);
          if (!found) throw new Error(`Page not found: ${p.pageId}`);
          if (found.type !== "PAGE") throw new Error(`Node ${p.pageId} is not a PAGE`);
          page = found;
        } else if (p.pageName) {
          page = figma.root.children.find((pg) => pg.name === p.pageName);
          if (!page) throw new Error(`Page not found with name: ${p.pageName}`);
        } else {
          throw new Error("pageId or pageName is required");
        }
        if (figma.root.children.length <= 1) {
          throw new Error("Cannot delete the only page in the document");
        }
        const deletedId = page.id;
        const deletedName = page.name;
        page.remove();
        figma.commitUndo();
        return {
          type: request.type,
          requestId: request.requestId,
          data: { id: deletedId, name: deletedName, deleted: true }
        };
      }
      case "rename_page": {
        const p = request.params || {};
        let page;
        if (p.pageId) {
          const found = yield figma.getNodeByIdAsync(p.pageId);
          if (!found) throw new Error(`Page not found: ${p.pageId}`);
          if (found.type !== "PAGE") throw new Error(`Node ${p.pageId} is not a PAGE`);
          page = found;
        } else if (p.pageName) {
          page = figma.root.children.find((pg) => pg.name === p.pageName);
          if (!page) throw new Error(`Page not found with name: ${p.pageName}`);
        } else {
          throw new Error("pageId or pageName is required");
        }
        if (!p.newName) throw new Error("newName is required");
        const oldName = page.name;
        page.name = p.newName;
        figma.commitUndo();
        return {
          type: request.type,
          requestId: request.requestId,
          data: { id: page.id, oldName, name: page.name }
        };
      }
      default:
        return null;
    }
  });
  const handleWriteRequest = (request) => __async(null, null, function* () {
    var _a, _b, _c, _d, _e, _f;
    return (_f = (_e = (_d = (_c = (_b = (_a = yield handleWriteComponentRequest(request)) != null ? _a : yield handleWriteCreateRequest(request)) != null ? _b : yield handleWriteModifyRequest(request)) != null ? _c : yield handleWriteStyleRequest(request)) != null ? _d : yield handleWriteVariableRequest(request)) != null ? _e : yield handleWritePrototypeRequest(request)) != null ? _f : yield handleWritePageRequest(request);
  });
  const FAST_TRAVERSAL = /* @__PURE__ */ new Set([
    "get_document",
    "get_design_context",
    "get_fonts",
    "get_annotations",
    "get_local_components",
    "search_nodes",
    "scan_text_nodes",
    "scan_nodes_by_types"
  ]);
  const sendStatus = () => {
    figma.ui.postMessage({
      type: "plugin-status",
      payload: {
        fileName: figma.root.name,
        pageName: figma.currentPage.name,
        selectionCount: figma.currentPage.selection.length
      }
    });
  };
  const handleRequest = (request) => __async(null, null, function* () {
    var _a;
    clearStyleCache();
    const prevSkip = figma.skipInvisibleInstanceChildren;
    const fast = FAST_TRAVERSAL.has(request.type);
    if (fast) figma.skipInvisibleInstanceChildren = true;
    try {
      const result = (_a = yield handleReadRequest(request)) != null ? _a : yield handleWriteRequest(request);
      if (result === null)
        throw new Error(`Unknown request type: ${request.type}`);
      return result;
    } catch (error) {
      return {
        type: request.type,
        requestId: request.requestId,
        error: error instanceof Error ? error.message : String(error)
      };
    } finally {
      if (fast) figma.skipInvisibleInstanceChildren = prevSkip;
    }
  });
  figma.showUI(__html__, { width: 320, height: 230 });
  sendStatus();
  figma.on("selectionchange", () => {
    sendStatus();
  });
  figma.on("currentpagechange", () => {
    sendStatus();
  });
  figma.ui.onmessage = (message) => __async(null, null, function* () {
    var _a, _b;
    if (message.type === "ui-ready") {
      sendStatus();
      return;
    }
    if (message.type === "get_ws_config") {
      const config = yield figma.clientStorage.getAsync("ws_config");
      figma.ui.postMessage({
        type: "ws_config",
        host: (_a = config == null ? void 0 : config.host) != null ? _a : "127.0.0.1",
        port: (_b = config == null ? void 0 : config.port) != null ? _b : "1994"
      });
      return;
    }
    if (message.type === "save_ws_config") {
      yield figma.clientStorage.setAsync("ws_config", {
        host: message.host,
        port: message.port
      });
      return;
    }
    if (message.type === "server-request") {
      const response = yield handleRequest(message.payload);
      try {
        figma.ui.postMessage(response);
      } catch (err) {
        figma.ui.postMessage({
          type: response.type,
          requestId: response.requestId,
          error: err instanceof Error ? err.message : String(err)
        });
      }
    }
  });
})();
