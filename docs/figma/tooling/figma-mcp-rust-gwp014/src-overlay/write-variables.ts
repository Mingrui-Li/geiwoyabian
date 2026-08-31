import { hexToRgb } from "./write-helpers";

const VALID_VARIABLE_SCOPES = new Set<VariableScope>([
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
  "PARAGRAPH_INDENT",
]);

const VALID_CODE_SYNTAX_PLATFORMS = new Set<CodeSyntaxPlatform>([
  "WEB",
  "ANDROID",
  "iOS",
]);

type GwpVariableEnvelope = {
  $gwpToken: 1;
  value?: any;
  scopes: VariableScope[];
  codeSyntax: Partial<Record<CodeSyntaxPlatform, string>>;
  description?: string;
};

const parseGwpVariableEnvelope = (value: any): GwpVariableEnvelope | null => {
  if (typeof value !== "string") return null;
  let parsed: any;
  try {
    parsed = JSON.parse(value);
  } catch {
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
    if (!VALID_CODE_SYNTAX_PLATFORMS.has(platform as CodeSyntaxPlatform)) {
      throw new Error(`Invalid code syntax platform: ${platform}`);
    }
    if (typeof syntax !== "string" || syntax.trim().length === 0) {
      throw new Error(`Code syntax for ${platform} must be a non-empty string`);
    }
  }
  return parsed as GwpVariableEnvelope;
};

const applyVariableMetadata = (
  variable: Variable,
  envelope: GwpVariableEnvelope,
) => {
  variable.scopes = [...envelope.scopes];
  for (const [platform, syntax] of Object.entries(envelope.codeSyntax)) {
    variable.setVariableCodeSyntax(
      platform as CodeSyntaxPlatform,
      syntax as string,
    );
  }
  if (typeof envelope.description === "string") {
    variable.description = envelope.description;
  }
};

const resolveEnvelopeValue = async (
  type: VariableResolvedDataType,
  value: any,
): Promise<VariableValue> => {
  if (
    value &&
    typeof value === "object" &&
    value.type === "VARIABLE_ALIAS" &&
    typeof value.id === "string"
  ) {
    const target = await figma.variables.getVariableByIdAsync(value.id);
    if (!target) throw new Error(`Alias target not found: ${value.id}`);
    if (target.resolvedType !== type) {
      throw new Error(
        `Alias type mismatch: ${type} variable cannot alias ${target.resolvedType}`,
      );
    }
    return figma.variables.createVariableAlias(target);
  }
  return parseVariableValue(type, value);
};

const parseVariableValue = (type: string, value: any): VariableValue => {
  if (type === "COLOR") {
    if (typeof value === "string") {
      const { r, g, b, a } = hexToRgb(value);
      return { r, g, b, a };
    }
    return value as RGBA;
  }
  if (type === "FLOAT") return typeof value === "number" ? value : parseFloat(String(value));
  if (type === "BOOLEAN") return value === true || value === "true";
  return String(value); // STRING
};

export const handleWriteVariableRequest = async (request: any) => {
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
          modes: collection.modes.map((m) => ({ modeId: m.modeId, name: m.name })),
        },
      };
    }

    case "add_variable_mode": {
      const p = request.params || {};
      if (!p.collectionId) throw new Error("collectionId is required");
      if (!p.modeName) throw new Error("modeName is required");
      const collection = await figma.variables.getVariableCollectionByIdAsync(p.collectionId);
      if (!collection) throw new Error(`Collection not found: ${p.collectionId}`);
      const modeId = collection.addMode(p.modeName);
      figma.commitUndo();
      return {
        type: request.type,
        requestId: request.requestId,
        data: { collectionId: p.collectionId, modeId, modeName: p.modeName },
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
      const collection = await figma.variables.getVariableCollectionByIdAsync(p.collectionId);
      if (!collection) throw new Error(`Collection not found: ${p.collectionId}`);
      const envelope = parseGwpVariableEnvelope(p.value);
      const variable = figma.variables.createVariable(p.name, collection, p.type as VariableResolvedDataType);
      try {
        if (envelope && collection.modes.length > 0) {
          const modeId = collection.modes[0].modeId;
          if (envelope.value === undefined) {
            throw new Error("GWP token envelope requires value");
          }
          const resolvedValue = await resolveEnvelopeValue(
            variable.resolvedType,
            envelope.value,
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
          codeSyntax: variable.codeSyntax,
        },
      };
    }

    case "set_variable_value": {
      const p = request.params || {};
      if (!p.variableId) throw new Error("variableId is required");
      if (!p.modeId) throw new Error("modeId is required");
      if (p.value == null) throw new Error("value is required");
      const variable = await figma.variables.getVariableByIdAsync(p.variableId);
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
        const resolvedValue = await resolveEnvelopeValue(
          variable.resolvedType,
          rawValue,
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
          codeSyntax: variable.codeSyntax,
        },
      };
    }

    case "delete_variable": {
      const p = request.params || {};
      if (p.variableId) {
        const variable = await figma.variables.getVariableByIdAsync(p.variableId);
        if (!variable) throw new Error(`Variable not found: ${p.variableId}`);
        variable.remove();
        figma.commitUndo();
        return {
          type: request.type,
          requestId: request.requestId,
          data: { variableId: p.variableId, deleted: true },
        };
      } else if (p.collectionId) {
        const collection = await figma.variables.getVariableCollectionByIdAsync(p.collectionId);
        if (!collection) throw new Error(`Collection not found: ${p.collectionId}`);
        collection.remove();
        figma.commitUndo();
        return {
          type: request.type,
          requestId: request.requestId,
          data: { collectionId: p.collectionId, deleted: true },
        };
      } else {
        throw new Error("variableId or collectionId is required");
      }
    }

    default:
      return null;
  }
};
