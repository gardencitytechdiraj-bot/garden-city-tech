import type { IncomingMessage, ServerResponse } from "node:http";
import { handleAdminLogoutRequest } from "../../server/admin-auth.js";

export default function handler(request: IncomingMessage, response: ServerResponse) {
  return handleAdminLogoutRequest(request, response);
}
