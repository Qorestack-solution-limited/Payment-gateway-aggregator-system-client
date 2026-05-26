# PayOrchestra Webhooks

## Delivery Behavior

When subscribed events occur, PayOrchestra sends an HTTP `POST` request to your configured endpoint.

Current retry policy:

- up to 3 attempts
- simple backoff between retries

## Headers

- `Content-Type: application/json`
- `x-payorchestra-event`
- `x-payorchestra-timestamp`
- `x-payorchestra-signature`

## Signature Format

The signature is created using:

`sha256(secret, "<timestamp>.<payload>")`

Use the official SDK helper or implement the HMAC verification yourself.

## Recommended Validation Steps

1. Read the raw body
2. Read the `x-payorchestra-timestamp`
3. Read the `x-payorchestra-signature`
4. Recompute the HMAC
5. Reject the request if the signature does not match
