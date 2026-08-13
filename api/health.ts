import type { IncomingMessage, ServerResponse } from "node:http";
import { handleHealthRequest } from "../server/application-handler.js";

export default function health(request: IncomingMessage, response: ServerResponse) {
  return handleHealthRequest(request, response);
}
