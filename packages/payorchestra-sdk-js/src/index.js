import crypto from "node:crypto";

// ─── Error ────────────────────────────────────────────────────────────────────

export class PayOrchestraError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "PayOrchestraError";
    this.status = options.status ?? null;
    this.code = options.code ?? null;
    this.details = options.details ?? null;
  }
}

// ─── Client ───────────────────────────────────────────────────────────────────

export class PayOrchestraClient {
  /**
   * @param {{ apiKey: string, baseUrl?: string, timeout?: number, maxRetries?: number }} opts
   */
  constructor({
    apiKey,
    baseUrl = "https://api.payorchestra.com/v1",
    timeout = 30_000,
    maxRetries = 2,
  } = {}) {
    if (!apiKey) throw new Error("PayOrchestraClient requires an apiKey");
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.timeout = timeout;
    this.maxRetries = maxRetries;
  }

  async request(path, { method = "GET", body, headers = {}, idempotencyKey } = {}, attempt = 0) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
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

      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        throw new PayOrchestraError(
          payload?.message || payload?.error || "PayOrchestra request failed",
          { status: res.status, code: payload?.code ?? null, details: payload ?? null },
        );
      }

      return payload?.data ?? payload;
    } catch (err) {
      if (err instanceof PayOrchestraError) throw err;
      if (attempt < this.maxRetries) {
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
        return this.request(path, { method, body, headers, idempotencyKey }, attempt + 1);
      }
      throw new PayOrchestraError(err.message || "Network error", { code: "NETWORK_ERROR" });
    } finally {
      clearTimeout(timer);
    }
  }

  // ── Transactions ────────────────────────────────────────────────────────────

  /**
   * Create a transaction.
   * @param {{ amount: number, currency?: string, customerName: string, customerEmail: string, gatewayId: string, description?: string, metadata?: object }} input
   * @param {{ idempotencyKey?: string }} [opts]
   */
  createTransaction(input, opts = {}) {
    return this.request("/transactions", {
      method: "POST",
      body: input,
      idempotencyKey: opts.idempotencyKey,
    });
  }

  /**
   * List transactions with optional filters and pagination.
   * @param {{ page?: number, limit?: number, status?: 'PENDING'|'SUCCESS'|'FAILED'|'REFUNDED', gatewayId?: string, search?: string, from?: string, to?: string }} [params]
   * @returns {Promise<{ data: object[], meta: { total: number, page: number, limit: number, totalPages: number } }>}
   */
  listTransactions(params = {}) {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")),
    ).toString();
    return this.request(`/transactions${qs ? `?${qs}` : ""}`);
  }

  /**
   * Get a single transaction by ID.
   * @param {string} id
   */
  getTransaction(id) {
    return this.request(`/transactions/${id}`);
  }

  /**
   * Find a transaction by its reference string.
   * @param {string} reference
   */
  getTransactionByReference(reference) {
    return this.request(`/transactions/reference/${reference}`);
  }

  /**
   * Re-verify a transaction's status with the payment provider.
   * @param {string} id
   */
  verifyTransaction(id) {
    return this.request(`/transactions/${id}/verify`, { method: "POST" });
  }

  // ── Gateways ────────────────────────────────────────────────────────────────

  /**
   * List all payment gateways in your organisation.
   */
  listGateways() {
    return this.request("/gateways");
  }

  /**
   * Get a single gateway by ID.
   * @param {string} id
   */
  getGateway(id) {
    return this.request(`/gateways/${id}`);
  }

  // ── Webhooks ────────────────────────────────────────────────────────────────

  /**
   * List all registered webhook endpoints.
   */
  listWebhooks() {
    return this.request("/webhooks");
  }

  /**
   * Get recent delivery history for a webhook endpoint.
   * @param {string} id
   */
  getWebhookDeliveries(id) {
    return this.request(`/webhooks/${id}/deliveries`);
  }
}

// ── Webhook signature helpers ─────────────────────────────────────────────────

/**
 * Generate the HMAC-SHA256 signature for a webhook payload.
 * @param {string} secret - Your webhook signing secret
 * @param {string} payload - Raw JSON body string
 * @param {string} timestamp - Value from x-payorchestra-timestamp header
 */
export function generateWebhookSignature(secret, payload, timestamp) {
  return crypto.createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
}

/**
 * Verify an incoming PayOrchestra webhook using constant-time comparison.
 * @param {{ secret: string, payload: string, timestamp: string, signature: string }} opts
 * @returns {boolean}
 */
export function verifyWebhookSignature({ secret, payload, timestamp, signature }) {
  const expected = generateWebhookSignature(secret, payload, timestamp);
  const a = Buffer.from(expected);
  const b = Buffer.from(signature || "");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
