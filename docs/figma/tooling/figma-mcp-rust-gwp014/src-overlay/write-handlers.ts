import { handleWriteCreateRequest } from "./write-create";
import { handleWriteModifyRequest } from "./write-modify";
import { handleWriteStyleRequest } from "./write-styles";
import { handleWriteVariableRequest } from "./write-variables";
import { handleWriteComponentRequest } from "./write-components";
import { handleWritePrototypeRequest } from "./write-prototype";
import { handleWritePageRequest } from "./write-page";

// Component handling precedes generic creation so the repository-private
// $gwpComponent envelope can extend create_component without changing the
// upstream Rust MCP tool schema. Non-envelope create_component requests return
// null from this handler and continue to the upstream create path unchanged.
export const handleWriteRequest = async (request: any) =>
  (await handleWriteComponentRequest(request)) ??
  (await handleWriteCreateRequest(request)) ??
  (await handleWriteModifyRequest(request)) ??
  (await handleWriteStyleRequest(request)) ??
  (await handleWriteVariableRequest(request)) ??
  (await handleWritePrototypeRequest(request)) ??
  (await handleWritePageRequest(request));
