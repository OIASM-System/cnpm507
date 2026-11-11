import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { config } from "../../shared/config.js";
import { http, resolvePath } from "../../shared/http-client.js";
import { arg, numArg } from "../../shared/cli.js";

const requests = numArg("requests", 50);
const concurrency = Math.min(numArg("concurrency", 50), requests);
const quantity = numArg("quantity", 1);
const skuId = arg("sku", config.skuId);
const branchId = arg("branch", config.branchId);
if (!skuId || !branchId) throw new Error("Cần --sku và --branch (ID theo Backend)");
if (!config.tenantId) throw new Error("Cần DEFAULT_TENANT_ID trong .env");

type Result = { index: number; status: number; latencyMs: number; success: boolean; error?: unknown };
const results: Result[] = [];
let next = 0;

function buildOrderPayload(index: number) {
  return {
    tenantId: config.tenantId,
    branchId,
    channel: "ONLINE",
    externalOrderId: `CONC-${Date.now()}-${index}-${randomUUID()}`,
    items: [{ skuId, quantity, unitPrice: 150000 }]
  };
}

async function worker() {
  while (true) {
    const index = next++;
    if (index >= requests) return;
    const started = Date.now();
    try {
      const response = await http.post(resolvePath(config.orderCreatePath), buildOrderPayload(index));
      results.push({ index, status: response.status, latencyMs: Date.now() - started, success: response.status >= 200 && response.status < 300 });
    } catch (error: any) {
      results.push({
        index, status: error.response?.status ?? 0, latencyMs: Date.now() - started,
        success: false, error: error.response?.data ?? error.message
      });
    }
  }
}

const testStarted = Date.now();
await Promise.all(Array.from({ length: concurrency }, () => worker()));
const durationMs = Date.now() - testStarted;
const latencies = results.map(x => x.latencyMs).sort((a,b) => a-b);
const success = results.filter(x => x.success).length;
const percentile = (p: number) => latencies[Math.min(Math.ceil(p * latencies.length) - 1, latencies.length - 1)] ?? 0;
const report = {
  scenario: "same SKU concurrent order creation",
  skuId, branchId, quantityPerOrder: quantity, totalRequests: requests, concurrency,
  successful: success, failed: requests - success,
  durationMs, throughputPerSecond: Number((requests / (durationMs / 1000)).toFixed(2)),
  latencyMs: {
    average: Number((latencies.reduce((a,b) => a+b, 0) / Math.max(latencies.length,1)).toFixed(2)),
    p95: percentile(0.95), max: latencies.at(-1) ?? 0
  },
  statusCounts: Object.fromEntries([...new Set(results.map(x => x.status))].map(s => [String(s), results.filter(x => x.status === s).length])),
  results
};
await mkdir("concurrency-runner/reports", { recursive: true });
const file = `concurrency-runner/reports/concurrency-${Date.now()}.json`;
await writeFile(file, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ...report, results: `[${results.length} detailed records]` }, null, 2));
console.log(`Report: ${file}`);
