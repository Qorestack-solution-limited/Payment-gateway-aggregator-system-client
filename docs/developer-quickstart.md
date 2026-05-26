# PayOrchestra Developer Quickstart

## 1. Generate an API key

Go to the Developer page in the dashboard and generate a `TEST` or `LIVE` API key.

## 2. Choose a gateway

Make sure your organization has at least one connected gateway. You will need the gateway id for transaction creation.

## 3. Create a transaction

Send a `POST` request to:

`/api/v1/transactions`

With headers:

- `Authorization: Bearer <your_api_key>`
- `Content-Type: application/json`
- `Idempotency-Key: <unique_key_for_safe_retries>`

Example payload:

```json
{
  "amount": 25000,
  "currency": "NGN",
  "customerName": "Jane Doe",
  "customerEmail": "jane@example.com",
  "gatewayId": "your_gateway_id",
  "description": "Starter plan purchase"
}
```

## 4. Look up a transaction

By id:

`GET /api/v1/transactions/:id`

By reference:

`GET /api/v1/transactions/reference/:reference`

## 5. Configure webhooks

Create a webhook endpoint in the dashboard and subscribe to events like:

- `payment.created`
- `payment.success`
- `payment.failed`
- `payment.refunded`

Each webhook request includes:

- `x-payorchestra-event`
- `x-payorchestra-timestamp`
- `x-payorchestra-signature`

## 6. Verify webhook signatures

Compute:

`HMAC_SHA256(secret, "<timestamp>.<raw_request_body>")`

Compare the result with `x-payorchestra-signature`.
