import Busboy from "busboy";
import { google } from "googleapis";
import nodemailer from "nodemailer";
import type { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";

// Keep headroom below the hosted request limit so rejected uploads return our
// JSON error instead of a platform-generated plain-text 413 response.
const MAX_FILE_BYTES = 4 * 1024 * 1024;
const MAX_REQUEST_BYTES = 4.5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(["pdf", "doc", "docx", "png", "jpg", "jpeg", "zip"]);
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "application/zip",
  "application/x-zip-compressed",
]);
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const localApplications: ApplicationRecord[] = [];

export type ApplicationRecord = {
  reference: string;
  createdAt: string;
  clientName: string;
  contactPerson: string;
  email: string;
  phone: string;
  country: string;
  selectedService: string;
  selectedPackage: string;
  projectDescription: string;
  requiredPages: string;
  existingWebsite: string;
  budgetRange: string;
  preferredStartDate: string;
  expectedCompletionDate: string;
  consent: boolean;
  files: Array<{ name: string; type: string; size: number; url?: string }>;
  status: string;
  owner: string;
  notes: string;
  consentRecorded: boolean;
};

type UploadedFile = {
  fieldName: string;
  name: string;
  type: string;
  buffer: Buffer;
};

type ParsedForm = {
  fields: Record<string, string>;
  files: UploadedFile[];
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

const checkRateLimit = (request: IncomingMessage) => {
  const key = getIp(request);
  const now = Date.now();
  const current = rateLimits.get(key);
  if (!current || current.resetAt < now) {
    rateLimits.set(key, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }
  if (current.count >= 5) return false;
  current.count += 1;
  return true;
};

const parseMultipart = (request: IncomingMessage): Promise<ParsedForm> =>
  new Promise((resolve, reject) => {
    const contentType = request.headers["content-type"];
    if (!contentType?.startsWith("multipart/form-data")) {
      reject(new Error("Expected multipart form data"));
      return;
    }

    let requestBytes = 0;
    let settled = false;
    const fields: Record<string, string> = {};
    const files: UploadedFile[] = [];
    const parser = Busboy({ headers: { "content-type": contentType }, limits: { files: 1, fileSize: MAX_FILE_BYTES } });

    const contentLength = Number(request.headers["content-length"] ?? 0);
    if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
      reject(new Error("That submission is too large. Please use an attachment smaller than 4 MB."));
      request.resume();
      return;
    }

    const fail = (error: Error) => {
      if (!settled) {
        settled = true;
        reject(error);
      }
    };

    request.on("data", (chunk: Buffer) => {
      requestBytes += chunk.length;
      if (requestBytes > MAX_REQUEST_BYTES) {
        fail(new Error("That submission is too large. Please use an attachment smaller than 4 MB."));
        request.resume();
      }
    });
    request.on("error", (error) => fail(error));
    parser.on("field", (name, value) => {
      fields[name] = value;
    });
    parser.on("file", (fieldName, stream, info) => {
      const chunks: Buffer[] = [];
      let fileBytes = 0;
      stream.on("data", (chunk: Buffer) => {
        fileBytes += chunk.length;
        if (fileBytes <= MAX_FILE_BYTES) chunks.push(chunk);
      });
      stream.on("limit", () => fail(new Error("File exceeds the 4 MB limit")));
      stream.on("error", (error) => fail(error));
      stream.on("end", () => {
        if (fileBytes > MAX_FILE_BYTES) return;
        files.push({ fieldName, name: info.filename, type: info.mimeType, buffer: Buffer.concat(chunks) });
      });
    });
    parser.on("error", (error) => fail(error instanceof Error ? error : new Error(String(error))));
    parser.on("close", () => {
      if (!settled) {
        settled = true;
        resolve({ fields, files });
      }
    });
    request.pipe(parser);
  });

const trimField = (fields: Record<string, string>, key: string, max = 4000) =>
  (fields[key] ?? "").trim().slice(0, max);

const validateForm = (form: ParsedForm) => {
  const fields = form.fields;
  const required = [
    ["clientName", "client or organization name"],
    ["contactPerson", "contact person"],
    ["email", "email address"],
    ["phone", "phone number"],
    ["country", "country"],
    ["selectedService", "selected service"],
    ["selectedPackage", "selected package"],
    ["projectDescription", "project description"],
    ["requiredPages", "required pages/features"],
    ["budgetRange", "budget range"],
    ["preferredStartDate", "preferred start date"],
    ["expectedCompletionDate", "expected completion date"],
  ] as const;
  for (const [key, label] of required) {
    if (!trimField(fields, key)) throw new Error(`Please provide your ${label}.`);
  }
  if (fields.website && !/^https?:\/\//i.test(fields.website.trim())) {
    throw new Error("Existing website URL must start with http:// or https://.");
  }
  if (!/^\S+@\S+\.\S+$/.test(trimField(fields, "email", 200))) {
    throw new Error("Please provide a valid email address.");
  }
  if (trimField(fields, "website", 500).length > 0 && trimField(fields, "website", 500).length < 10) {
    throw new Error("Please provide a complete existing website URL or leave it blank.");
  }
  if (trimField(fields, "website", 500).length > 500) throw new Error("Website URL is too long.");
  if (trimField(fields, "website", 500) && !/^https?:\/\//i.test(trimField(fields, "website", 500))) {
    throw new Error("Existing website URL must start with http:// or https://.");
  }
  if (fields.website?.length > 500) throw new Error("Website URL is too long.");
  if (fields.honeypot?.trim()) throw new Error("Submission rejected.");
  if (!['true', 'on', '1'].includes(fields.consent?.toLowerCase())) {
    throw new Error("Please confirm the consent checkbox before submitting.");
  }

  for (const file of form.files) {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXTENSIONS.has(extension) || !ALLOWED_MIME_TYPES.has(file.type)) {
      throw new Error("That file type is not supported. Upload PDF, DOC, DOCX, PNG, JPG, or ZIP files only.");
    }
    if (file.buffer.length > MAX_FILE_BYTES) throw new Error("File exceeds the 4 MB limit.");
  }
};

const createRecord = (form: ParsedForm, reference: string): ApplicationRecord => {
  const f = form.fields;
  return {
    reference,
    createdAt: new Date().toISOString(),
    clientName: trimField(f, "clientName", 200),
    contactPerson: trimField(f, "contactPerson", 200),
    email: trimField(f, "email", 200),
    phone: trimField(f, "phone", 80),
    country: trimField(f, "country", 120),
    selectedService: trimField(f, "selectedService", 120),
    selectedPackage: trimField(f, "selectedPackage", 120),
    projectDescription: trimField(f, "projectDescription"),
    requiredPages: trimField(f, "requiredPages"),
    existingWebsite: trimField(f, "website", 500),
    budgetRange: trimField(f, "budgetRange", 120),
    preferredStartDate: trimField(f, "preferredStartDate", 40),
    expectedCompletionDate: trimField(f, "expectedCompletionDate", 40),
    consent: true,
    files: form.files.map((file) => ({ name: file.name, type: file.type, size: file.buffer.length })),
    status: "New",
    owner: "",
    notes: "",
    consentRecorded: true,
  };
};

const getGoogleClients = () => {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!raw || !folderId || !sheetId) return null;
  const credentials = JSON.parse(raw) as { client_email: string; private_key: string };
  const auth = new google.auth.GoogleAuth({ credentials, scopes: ["https://www.googleapis.com/auth/drive", "https://www.googleapis.com/auth/spreadsheets"] });
  return { drive: google.drive({ version: "v3", auth }), sheets: google.sheets({ version: "v4", auth }), folderId, sheetId };
};

const persistRecord = async (record: ApplicationRecord, form: ParsedForm) => {
  const clients = getGoogleClients();
  if (!clients) {
    if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
      throw new Error("Production storage is not configured. Add Google Drive and Google Sheets credentials.");
    }
    localApplications.unshift(record);
    return record;
  }

  const uploaded = [] as ApplicationRecord["files"];
  for (const file of form.files) {
    const result = await clients.drive.files.create({
      requestBody: { name: `${record.reference}-${file.name}`, parents: [clients.folderId], mimeType: file.type },
      media: { mimeType: file.type, body: Readable.from(file.buffer) },
      fields: "id,name,webViewLink",
    });
    uploaded.push({ name: file.name, type: file.type, size: file.buffer.length, url: result.data.webViewLink ?? `https://drive.google.com/open?id=${result.data.id}` });
  }
  record.files = uploaded;
  const values = [[record.reference, record.createdAt, record.clientName, record.contactPerson, record.email, record.phone, record.country, record.selectedService, record.selectedPackage, record.projectDescription, record.requiredPages, record.existingWebsite, record.budgetRange, record.preferredStartDate, record.expectedCompletionDate, JSON.stringify(record.files), record.status, record.owner, record.notes, record.consentRecorded ? "Yes" : "No"]];
  await clients.sheets.spreadsheets.values.append({ spreadsheetId: clients.sheetId, range: process.env.GOOGLE_SHEET_RANGE || "Applications!A:T", valueInputOption: "USER_ENTERED", requestBody: { values } });
  return record;
};

const notifyTeam = async (record: ApplicationRecord) => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const to = process.env.NOTIFICATION_EMAIL || "info@gardencitytech.net";
  if (!host || !user || !password) {
    if (process.env.NODE_ENV === "production" || process.env.VERCEL) throw new Error("Notification email is not configured.");
    return;
  }
  const transporter = nodemailer.createTransport({ host, port: Number(process.env.SMTP_PORT || 465), secure: Number(process.env.SMTP_PORT || 465) === 465, auth: { user, pass: password } });
  const attachmentLinks = record.files.length
    ? record.files.map((file) => `- ${file.name}: ${file.url || "stored in the Garden City Tech Drive folder"}`).join("\n")
    : "None";
  await transporter.sendMail({ from: process.env.SMTP_FROM || user, to, subject: `New service application ${record.reference}`, text: [`Reference: ${record.reference}`, `Client: ${record.clientName}`, `Contact: ${record.contactPerson}`, `Email: ${record.email}`, `Service: ${record.selectedService}`, `Package: ${record.selectedPackage}`, `Start: ${record.preferredStartDate}`, `Completion: ${record.expectedCompletionDate}`, "", "Attachments:", attachmentLinks, "", record.projectDescription].join("\n") });
};

const readRecords = async () => {
  const clients = getGoogleClients();
  if (!clients) return localApplications;
  const result = await clients.sheets.spreadsheets.values.get({ spreadsheetId: clients.sheetId, range: process.env.GOOGLE_SHEET_RANGE || "Applications!A:T" });
  return (result.data.values || []).slice(1).map((row) => ({ reference: row[0], createdAt: row[1], clientName: row[2], contactPerson: row[3], email: row[4], phone: row[5], country: row[6], selectedService: row[7], selectedPackage: row[8], projectDescription: row[9], requiredPages: row[10], existingWebsite: row[11], budgetRange: row[12], preferredStartDate: row[13], expectedCompletionDate: row[14], consent: true, files: JSON.parse(row[15] || "[]"), status: row[16] || "New", owner: row[17] || "", notes: row[18] || "", consentRecorded: row[19] !== "No" })) satisfies ApplicationRecord[];
};

export async function handleHealthRequest(_request: IncomingMessage, response: ServerResponse) {
  json(response, 200, { ok: true, service: "garden-city-tech" });
}

export async function handleApplicationsRequest(request: IncomingMessage, response: ServerResponse) {
  if (request.method === "OPTIONS") {
    response.statusCode = 204;
    response.end();
    return;
  }
  if (request.method === "GET") {
    const key = request.headers["x-admin-key"] || new URL(request.url || "/", "http://localhost").searchParams.get("accessKey");
    if (!process.env.ADMIN_PANEL_KEY || key !== process.env.ADMIN_PANEL_KEY) {
      json(response, 401, { error: "Unauthorized" });
      return;
    }
    try {
      json(response, 200, { applications: await readRecords() });
    } catch (error) {
      json(response, 500, { error: error instanceof Error ? error.message : "Could not load applications." });
    }
    return;
  }
  if (request.method !== "POST") {
    json(response, 405, { error: "Method not allowed" });
    return;
  }
  if (!checkRateLimit(request)) {
    json(response, 429, { error: "Too many submissions. Please try again later." });
    return;
  }
  try {
    const form = await parseMultipart(request);
    validateForm(form);
    const reference = `GCT-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const record = createRecord(form, reference);
    const saved = await persistRecord(record, form);
    await notifyTeam(saved);
    json(response, 201, { reference: saved.reference });
  } catch (error) {
    json(response, 400, { error: error instanceof Error ? error.message : "We could not submit the application." });
  }
}
