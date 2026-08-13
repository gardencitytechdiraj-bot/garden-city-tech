import type { IncomingMessage, ServerResponse } from "node:http";
import { handleApplicationsRequest } from "../server/application-handler.js";

export default function applications(request: IncomingMessage, response: ServerResponse) {
  return handleApplicationsRequest(request, response);
}
