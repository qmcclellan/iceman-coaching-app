// Iceman feedback API: one Lambda behind an HTTP API, shared by QB Cards and the Coach Playbook.
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { randomUUID } from "node:crypto";

const db = new DynamoDBClient({});
const TABLE = process.env.TABLE_NAME;
const list = v => new Set((v || "").split(",").map(s => s.trim()).filter(Boolean));
const APPS = list(process.env.ALLOWED_APPS);
const ORIGINS = list(process.env.ALLOWED_ORIGINS);
const MAX_BODY = 4096;   // bytes
const MAX_MSG = 2000;    // characters
const MAX_SCREEN = 60;   // characters

const reply = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body)
});

export const handler = async (event) => {
  // Only the two apps' sites may send. (CORS also stops other sites in the browser.)
  const origin = (event.headers && event.headers.origin) || "";
  if (!ORIGINS.has(origin)) return reply(403, { ok: false, error: "origin not allowed" });

  let raw = event.body || "";
  if (event.isBase64Encoded) raw = Buffer.from(raw, "base64").toString("utf8");
  if (!raw) return reply(400, { ok: false, error: "empty body" });
  if (Buffer.byteLength(raw, "utf8") > MAX_BODY) return reply(413, { ok: false, error: "too large" });

  let data;
  try { data = JSON.parse(raw); } catch { return reply(400, { ok: false, error: "bad json" }); }
  if (!data || typeof data !== "object" || Array.isArray(data)) return reply(400, { ok: false, error: "bad json" });

  const app = typeof data.app === "string" ? data.app : "";
  if (!APPS.has(app)) return reply(400, { ok: false, error: "unknown app" });

  const message = typeof data.message === "string" ? data.message.trim() : "";
  if (!message) return reply(400, { ok: false, error: "message required" });
  if (message.length > MAX_MSG) return reply(400, { ok: false, error: "message too long" });

  const screen = typeof data.screen === "string" ? data.screen.trim().slice(0, MAX_SCREEN) : "";
  const now = new Date().toISOString();

  try {
    await db.send(new PutItemCommand({
      TableName: TABLE,
      Item: {
        app: { S: app },                          // partition key
        sk: { S: `${now}#${randomUUID()}` },      // sort key: newest last
        message: { S: message },
        screen: { S: screen },
        receivedAt: { S: now }
      }
    }));
  } catch (err) {
    console.error("save failed", err.name); // never log the message text
    return reply(500, { ok: false, error: "could not save" });
  }
  return reply(201, { ok: true });
};
