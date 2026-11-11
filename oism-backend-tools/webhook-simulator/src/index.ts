import { createHmac } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
import { config } from "../../shared/config.js";
import { http, resolvePath } from "../../shared/http-client.js";
import { arg, numArg } from "../../shared/cli.js";
import { buildPayload, Platform } from "./payload-builder.js";

const platform = (arg("platform", "shopee") ?? "shopee") as Platform;
if (!["shopee", "tiktok", "lazada"].includes(platform)) throw new Error("Platform không hợp lệ");
const count = numArg("count", 1);
const results: unknown[] = [];

for (let i = 1; i <= count; i++) {
  const payload = buildPayload(platform, i);
  const body = JSON.stringify(payload);
  const signature = config.webhookSecret
    ? createHmac("sha256", config.webhookSecret).update(body).digest("hex")
    : "";
  const started = Date.now();
  try {
    const response = await http.post(resolvePath(config.webhookPath), payload, {
      headers: {
        "X-Event-Id": payload.eventId,
        "X-Platform": platform,
        ...(signature ? { "X-Webhook-Signature": signature } : {})
      }
    });
    results.push({ eventId: payload.eventId, status: response.status, latencyMs: Date.now() - started, response: response.data });
    console.log(`[OK] ${i}/${count} HTTP ${response.status} ${Date.now() - started}ms`);
  } catch (error: any) {
    results.push({ eventId: payload.eventId, status: error.response?.status ?? 0, latencyMs: Date.now() - started, error: error.response?.data ?? error.message });
    console.error(`[FAIL] ${i}/${count}`, error.response?.status ?? error.message);
  }
}
await mkdir("webhook-simulator/reports", { recursive: true });
const file = `webhook-simulator/reports/webhook-${Date.now()}.json`;
await writeFile(file, JSON.stringify({ platform, count, results }, null, 2));
console.log(`Report: ${file}`);
