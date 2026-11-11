import dotenv from "dotenv";
dotenv.config();

export const config = {
  baseUrl: process.env.API_BASE_URL ?? "http://localhost:5000",
  token: process.env.API_TOKEN ?? "",
  timeoutMs: Number(process.env.API_TIMEOUT_MS ?? 15000),
  webhookPath: process.env.WEBHOOK_PATH ?? "/api/webhooks/orders",
  orderCreatePath: process.env.ORDER_CREATE_PATH ?? "/api/orders",
  inventoryCheckPath: process.env.INVENTORY_CHECK_PATH ?? "",
  productCreatePath: process.env.PRODUCT_CREATE_PATH ?? "/api/products",
  tenantCreatePath: process.env.TENANT_CREATE_PATH ?? "/api/tenants",
  branchCreatePath: process.env.BRANCH_CREATE_PATH ?? "/api/branches",
  tenantId: process.env.DEFAULT_TENANT_ID ?? "",
  branchId: process.env.DEFAULT_BRANCH_ID ?? "",
  skuId: process.env.DEFAULT_SKU_ID ?? "",
  webhookSecret: process.env.WEBHOOK_SECRET ?? ""
};
