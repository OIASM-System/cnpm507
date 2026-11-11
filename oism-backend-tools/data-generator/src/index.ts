import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { faker } from "@faker-js/faker";
import { arg, numArg, hasFlag } from "../../shared/cli.js";
import { config } from "../../shared/config.js";
import { http, resolvePath } from "../../shared/http-client.js";

const tenantCount = numArg("tenants", 1);
const branchesPerTenant = numArg("branches", 2);
const productsPerTenant = numArg("products", 20);
const skusPerProduct = numArg("skus", 2);
const ordersPerTenant = numArg("orders", 10);

const data: any = { tenants: [], branches: [], products: [], skus: [], inventory: [], orders: [] };

for (let t = 0; t < tenantCount; t++) {
  const tenantId = randomUUID();
  data.tenants.push({ id: tenantId, name: `Tenant ${faker.company.name()}`, code: `TEN-${t+1}` });
  const branchIds: string[] = [];
  for (let b = 0; b < branchesPerTenant; b++) {
    const branchId = randomUUID(); branchIds.push(branchId);
    data.branches.push({ id: branchId, tenantId, name: `Chi nhánh ${b+1}`, code: `BR-${t+1}-${b+1}` });
  }
  for (let p = 0; p < productsPerTenant; p++) {
    const productId = randomUUID();
    data.products.push({ id: productId, tenantId, name: faker.commerce.productName(), description: faker.commerce.productDescription() });
    for (let s = 0; s < skusPerProduct; s++) {
      const skuId = randomUUID();
      data.skus.push({ id: skuId, tenantId, productId, code: `SKU-${t+1}-${p+1}-${s+1}`, barcode: faker.string.numeric(13), price: Number(faker.commerce.price({ min: 50000, max: 2000000 })) });
      for (const branchId of branchIds) data.inventory.push({ id: randomUUID(), tenantId, branchId, skuId, onHand: faker.number.int({ min: 20, max: 200 }), reserved: 0 });
    }
  }
  const tenantSkus = data.skus.filter((x: any) => x.tenantId === tenantId);
  for (let o = 0; o < ordersPerTenant; o++) {
const sku = faker.helpers.arrayElement(tenantSkus) as {
  id: string;
  price: number;
};    data.orders.push({
      id: randomUUID(), tenantId, branchId: faker.helpers.arrayElement(branchIds),
      externalOrderId: `SEED-${t+1}-${o+1}`, channel: faker.helpers.arrayElement(["ONLINE", "POS"]),
      status: "DRAFT", items: [{ skuId: sku.id, quantity: faker.number.int({ min: 1, max: 3 }), unitPrice: sku.price }]
    });
  }
}

const output = arg("out", "./output/oism-demo-data.json")!;
await mkdir(output.substring(0, Math.max(output.lastIndexOf("/"), 1)), { recursive: true });
await writeFile(output, JSON.stringify(data, null, 2));
console.log(`Đã tạo dữ liệu: ${output}`);
console.log(Object.fromEntries(Object.entries(data).map(([k,v]: any) => [k, v.length])));

if (hasFlag("seed-api")) {
  if (hasFlag("dry-run")) {
    console.log("DRY RUN: không gửi dữ liệu lên API.");
  } else {
    console.warn("Seed API cần mapping DTO theo Swagger. Phiên bản starter này không tự POST vì contract endpoint chưa được xác nhận.");
    console.warn("Hãy triển khai adapter API sau khi nhóm chốt DTO; file JSON đã sẵn sàng.");
  }
}
