import bcrypt from "bcryptjs";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

const SESSION_COOKIE = "gct_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const MAX_BODY_BYTES = 16 * 1024;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

type SessionPayload = {
  sub: string;
  exp: number;
  iat: number;
  jti: string;
};

const json = (response: ServerResponse, status: number, body: unknown) => {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(body));
};

const getIp = (request: IncomingMessage) => {
  const forwarded = request.headers["x-forwarded-for"];
  return typeof forwarded === "string"
    ? forwarded.split(",")[0].trim()
    : request.socket.remoteAddress ?? "unknown";
};

const checkLoginRateLimit = (request: IncomingMessage) => {
  const key = getIp(request);
  const now = Date.now();
  const current = loginAttempts.get(key);
  if (!current || current.resetAt <= now) {
    loginAttempts.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  if (current.count >= 10) return false;
  current.count += 1;
  return true;
};

const readJsonBody = (request: IncomingMessage): Promise<unknown> =>
  new Promise((resolve, reject) => {
    let body = "";
    let bytes = 0;
    request.setEncoding("utf8");
    request.on("data", (chunk: string) => {
      bytes += Buffer.byteLength(chunk);
      if (bytes > MAX_BODY_BYTES) {
        reject(new Error("Request body too large"));
        request.resume();
        return;
      }
      body += chunk;
    });
    request.on("error", reject);
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
  });

const getConfig = () => ({
  username: process.env.ADMIN_USERNAME?.trim() ?? "",
  passwordHash: process.env.ADMIN_PASSWORD_HASH?.trim() ?? "",
  sessionSecret: process.env.ADMIN_SESSION_SECRET?.trim() ?? "",
});

const parseCookies = (header: string | undefined) => {
  const cookies = new Map<string, string>();
  for (const part of (header ?? "").split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    cookies.set(part.slice(0, separator).trim(), decodeURIComponent(part.slice(separator + 1).trim()));
  }
  return cookies;
};

const encode = (payload: SessionPayload) => Buffer.from(JSON.stringify(payload)).toString("base64url");

const sign = (value: string, secret: string) => createHmac("sha256", secret).update(value).digest("base64url");

const createSessionToken = (username: string, secret: string) => {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    sub: username,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
    jti: randomBytes(12).toString("hex"),
  };
  const encoded = encode(payload);
  return `${encoded}.${sign(encoded, secret)}`;
};

const readSession = (request: IncomingMessage): SessionPayload | null => {
  const { username, sessionSecret } = getConfig();
  if (!username || !sessionSecret) return null;
  const token = parseCookies(request.headers.cookie).get(SESSION_COOKIE);
  if (!token) return null;
  const [encoded, receivedSignature] = token.split(".");
  if (!encoded || !receivedSignature) return null;
  const expectedSignature = sign(encoded, sessionSecret);
  const received = Buffer.from(receivedSignature);
  const expected = Buffer.from(expectedSignature);
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
    if (payload.sub !== username || !Number.isFinite(payload.exp) || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
};

const secureCookie = () => process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);

const setSessionCookie = (response: ServerResponse, token: string) => {
  const secure = secureCookie() ? "; Secure" : "";
  response.setHeader("Set-Cookie", `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${SESSION_TTL_SECONDS}; HttpOnly; SameSite=Lax${secure}`);
};

const clearSessionCookie = (response: ServerResponse) => {
  const secure = secureCookie() ? "; Secure" : "";
  response.setHeader("Set-Cookie", `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`);
};

export const isAdminSessionRequest = (request: IncomingMessage) => Boolean(readSession(request));

export async function handleAdminLoginRequest(request: IncomingMessage, response: ServerResponse) {
  if (request.method === "OPTIONS") {
    response.statusCode = 204;
    response.end();
    return;
  }
  if (request.method !== "POST") {
    json(response, 405, { error: "Method not allowed" });
    return;
  }
  if (!checkLoginRateLimit(request)) {
    json(response, 429, { error: "Too many login attempts. Please try again later." });
    return;
  }

  const config = getConfig();
  if (!config.username || !config.passwordHash || !config.sessionSecret) {
    json(response, 503, { error: "Admin authentication is not configured." });
    return;
  }

  try {
    const body = await readJsonBody(request);
    const credentials = typeof body === "object" && body !== null ? body as { username?: unknown; password?: unknown } : {};
    const username = typeof credentials.username === "string" ? credentials.username.trim() : "";
    const password = typeof credentials.password === "string" ? credentials.password : "";
    const passwordMatches = await bcrypt.compare(password, config.passwordHash).catch(() => false);
    if (username !== config.username || !passwordMatches) {
      json(response, 401, { error: "Invalid credentials" });
      return;
    }
    setSessionCookie(response, createSessionToken(config.username, config.sessionSecret));
    json(response, 200, { ok: true });
  } catch {
    json(response, 400, { error: "Invalid credentials" });
  }
}

export function handleAdminSessionRequest(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== "GET") {
    json(response, 405, { error: "Method not allowed" });
    return;
  }
  if (!readSession(request)) {
    json(response, 401, { authenticated: false });
    return;
  }
  json(response, 200, { authenticated: true });
}

export function handleAdminLogoutRequest(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== "POST") {
    json(response, 405, { error: "Method not allowed" });
    return;
  }
  clearSessionCookie(response);
  json(response, 200, { ok: true });
}
