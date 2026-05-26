import crypto from "node:crypto";

export class PayOrchestraError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "PayOrchestraError";
    this.status = options.status ?? null;
    this.code = options.code ?? null;
    this.details = options.details ?? null;
    this.requestId = options.requestId ?? null;
  }
}

export class PayOrchestraClient {
  constructor({ apiKey, baseUrl = "http://localhost:3000/api/v1", timeout = 30000 } = {}) {
    if (!apiKey) {
      throw new Error("PayOrchestraClient requires an apiKey");
    }

    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.timeout = timeout;
  }

  async request(path, { method = "GET", body, headers = {}, idempotencyKey } = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new PayOrchestraError(
          payload?.message || payload?.error || "PayOrchestra request failed",
          {
            status: response.status,
            code: payload?.code ?? null,
            details: payload?.details ?? payload ?? null,
            requestId: payload?.requestId ?? null,
          },
        );
      }

      return payload?.data ?? payload;
    } finally {
      clearTimeout(timeout);
    }
  }

  createTransaction(input, options = {}) {
    return this.request("/transactions", {
      method: "POST",
      body: input,
      idempotencyKey: options.idempotencyKey,
    });
  }

  listTransactions(params = {}) {
    const search = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
      ),
    ).toString();
    return this.request(`/transactions${search ? `?${search}` : ""}`);
  }

  getTransaction(id) {
    return this.request(`/transactions/${id}`);
  }

  getTransactionByReference(reference) {
    return this.request(`/transactions/reference/${reference}`);
  }
}

export function generateWebhookSignature(secret, payload, timestamp) {
  return crypto.createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
}

export function verifyWebhookSignature({ secret, payload, timestamp, signature }) {
  const expected = generateWebhookSignature(secret, payload, timestamp);
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(signature || "");

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}
