import type { IncomingMessage, ServerResponse } from "node:http";
import { handleAdminSessionRequest } from "../../server/admin-auth.js";

export default function handler(request: IncomingMessage, response: ServerResponse) {
  return handleAdminSessionRequest(request, response);
}
