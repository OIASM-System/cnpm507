// Optional k6 scenario. Run: k6 run -e BASE_URL=http://localhost:5000 -e TOKEN=... -e SKU_ID=... -e BRANCH_ID=... flash-sale.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    flash_sale: {
      executor: 'shared-iterations',
      vus: 50,
      iterations: 50,
      maxDuration: '60s'
    }
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1000']
  }
};

export default function () {
  const url = `${__ENV.BASE_URL}/api/orders`; // Confirm route with Swagger.
  const payload = JSON.stringify({
    branchId: __ENV.BRANCH_ID,
    channel: 'ONLINE',
    externalOrderId: `K6-${__VU}-${__ITER}`,
    items: [{ skuId: __ENV.SKU_ID, quantity: 1, unitPrice: 150000 }]
  });
  const response = http.post(url, payload, {
    headers: {
      'Content-Type': 'application/json',
      ...( __ENV.TOKEN ? { Authorization: `Bearer ${__ENV.TOKEN}` } : {})
    }
  });
  check(response, { 'response is 2xx or expected stock rejection': r => (r.status >= 200 && r.status < 300) || [400, 409, 422].includes(r.status) });
  sleep(0.1);
}
