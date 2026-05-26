# PayOrchestra JavaScript SDK

Official JavaScript SDK for integrating with the PayOrchestra public API.

## Install

```bash
npm install @payorchestra/sdk
```

## Usage

```js
import { PayOrchestraClient } from "@payorchestra/sdk";

const client = new PayOrchestraClient({
  apiKey: process.env.PAYORCHESTRA_API_KEY,
  baseUrl: "http://localhost:3000/api/v1",
});

const transaction = await client.createTransaction(
  {
    amount: 25000,
    currency: "NGN",
    customerName: "Jane Doe",
    customerEmail: "jane@example.com",
    gatewayId: "your_gateway_id",
    description: "Starter plan purchase",
  },
  {
    idempotencyKey: "txn-create-001",
  },
);

console.log(transaction);
```

## Webhook Verification

```js
import { verifyWebhookSignature } from "@payorchestra/sdk";

const rawPayload = JSON.stringify(req.body);
const signature = req.headers["x-payorchestra-signature"];
const timestamp = req.headers["x-payorchestra-timestamp"];

const isValid = verifyWebhookSignature({
  secret: process.env.PAYORCHESTRA_WEBHOOK_SECRET,
  payload: rawPayload,
  timestamp,
  signature,
});
```
