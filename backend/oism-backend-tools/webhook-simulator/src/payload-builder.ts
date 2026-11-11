import { randomUUID } from "node:crypto";

export type Platform = "shopee" | "tiktok" | "lazada";

export function buildPayload(platform: Platform, index: number) {
  const prefixes = { shopee: "SP", tiktok: "TT", lazada: "LZ" };
  const statuses = { shopee: "READY_TO_SHIP", tiktok: "UNPAID", lazada: "pending" };
  return {
    eventId: randomUUID(),
    platform,
    eventType: "order.created",
    occurredAt: new Date().toISOString(),
    order: {
      externalOrderId: `${prefixes[platform]}-TEST-${Date.now()}-${index}`,
      status: statuses[platform],
      currency: "VND",
      items: [{
        sku: process.env.TEST_SKU_CODE ?? "SKU-DEMO-001",
        quantity: Number(process.env.TEST_ORDER_QUANTITY ?? 1),
        unitPrice: 150000
      }]
    }
  };
}
