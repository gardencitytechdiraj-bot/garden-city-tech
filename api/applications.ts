import type { IncomingMessage, ServerResponse } from "node:http";
import { handleApplicationsRequest } from "../server/application-handler";

export default function applications(request: IncomingMessage, response: ServerResponse) {
  return handleApplicationsRequest(request, response);
}
