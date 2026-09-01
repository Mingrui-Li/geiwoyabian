# GWP figma-mcp-rust design-system extension

This development-plugin bundle is based on `@alvinindra/figma-mcp-rust` 0.2.0. It keeps the upstream Rust MCP server and its existing 73-tool schema unchanged, while extending the companion Figma plugin for the GWP-014 foundation and GWP-015 component acceptance gates.

## Added behavior

- `create_variable.value` accepts a JSON string envelope with `$gwpToken: 1`, the variable value, explicit scopes, code syntax, and an optional description.
- The envelope rejects `ALL_SCOPES`, validates every scope and code-syntax platform, supports same-type `VARIABLE_ALIAS` values, and removes the just-created variable if the atomic create path fails.
- `set_variable_value` accepts the same envelope for targeted recovery; `modeId: "__metadata__"` updates metadata without changing the value.
- `get_variable_defs` returns `description`, `scopes`, `codeSyntax`, and `remote` so every write can be read back through the Rust toolchain.
- `get_fonts` additionally returns all available family names plus exact style names for detected CJK families, allowing typography to be chosen from the live Figma runtime rather than memory.
- `create_component.name` accepts a repository-private `$gwpComponent: 1` JSON envelope. Its prepare, capability-probe, family-build, semantic-preset repair, and audit operations create and verify token-bound GWP component sets without changing the Rust server schema.
- The component extension provides controlled variants, selective text/boolean/instance-swap properties, semantic state presets, Auto Layout roots, variable-bound colors/spacing/radii/opacity, documentation frames, and a structured audit for hardcoded paints, missing bindings, and layout failures.

Example envelope:

```json
{
  "$gwpToken": 1,
  "value": "#FFC83D",
  "scopes": [],
  "codeSyntax": {
    "WEB": "var(--gwp-yellow-500)"
  },
  "description": "Industrial yellow primitive"
}
```

## Run in Figma Desktop

1. Close the currently running `Figma MCP Rust` development plugin.
2. Choose **Plugins → Development → Import plugin from manifest**.
3. Select this directory's `manifest.json`.
4. Run `Figma MCP Rust — GWP-014` in the `mini-game` file and keep its window open. The distinct name and development ID prevent Figma from launching the unpatched upstream plugin by mistake.

The MCP server remains the installed 0.2.0 binary on `127.0.0.1:1994`; only the Figma-side bundle changes.

## Reproducibility

The five files in `src-overlay/` replace the matching upstream 0.2.0 source files before running the upstream Vite build. Built artifact SHA-256 values:

- `dist/code.js`: `d873718656bbb678f1479c0231a62e5e6e0470a2ecc864f0aafe44845976d5c2`
- `dist/index.html`: `bf21e369697ad95b52da3503ed228cb720f8de9fd022fc4cc9637ef5e5250ce1`

The upstream project is MIT-licensed. This bundle is repository-local tooling for the deterministic GWP design workflow; it is not a fork of the Rust server.
