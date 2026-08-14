import type { IncomingMessage, ServerResponse } from "node:http";
import { handleAdminLoginRequest } from "../../server/admin-auth.js";

export default function handler(request: IncomingMessage, response: ServerResponse) {
  return handleAdminLoginRequest(request, response);
}
