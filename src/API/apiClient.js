const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

function getToken()        { return localStorage.getItem("payToken"); }
function getRefreshToken() { return localStorage.getItem("payRefreshToken"); }

function clearAuth() {
  localStorage.removeItem("payToken");
  localStorage.removeItem("payRefreshToken");
  localStorage.removeItem("payUser");
}

function buildUnauthorizedError(message = "Unauthorized") {
  const error = new Error(message);
  error.code = "UNAUTHORIZED";
  return error;
}

let refreshPromise = null;

function isAuthRoute(path) {
  return path.startsWith("/auth/");
}

async function tryRefresh() {
  const rt = getRefreshToken();
  if (!rt) return false;

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: rt }),
      });
      if (!res.ok) return false;
      const json = await res.json();
      const { accessToken, refreshToken } = json.data ?? {};
      if (!accessToken) return false;
      localStorage.setItem("payToken", accessToken);
      if (refreshToken) localStorage.setItem("payRefreshToken", refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ─── Core request ─────────────────────────────────────────────────────────────
async function request(path, options = {}, isRetry = false) {
  const token = getToken();
  const shouldHandleSessionExpiry = !isAuthRoute(path);
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  } catch (networkErr) {
    throw new Error("Network error — check your connection or server status.");
  }

  if (res.status === 401 && shouldHandleSessionExpiry && !isRetry) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return request(path, options, true);
    }
    clearAuth();
    window.location.replace("/login");
    throw buildUnauthorizedError();
  }

  if (res.status === 401 && shouldHandleSessionExpiry && isRetry) {
    clearAuth();
    window.location.replace("/login");
    throw buildUnauthorizedError();
  }

  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error("Invalid response from server.");
  }

  if (!res.ok) {
    throw new Error(
      Array.isArray(json.message) ? json.message.join(", ") : json.message || "Request failed"
    );
  }

  return json.data;
}

export const api = {
  get:    (path)        => request(path),
  post:   (path, body)  => request(path, { method: "POST",   body: JSON.stringify(body) }),
  patch:  (path, body)  => request(path, { method: "PATCH",  body: JSON.stringify(body) }),
  delete: (path)        => request(path, { method: "DELETE" }),
  // Raw blob download — bypasses JSON parsing for file exports
  download: async (path) => {
    const token = getToken();
    let res;
    try {
      res = await fetch(`${BASE_URL}${path}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
    } catch {
      throw new Error("Network error — check your connection or server status.");
    }
    if (res.status === 401) {
      const refreshed = await tryRefresh();
      if (refreshed) return api.download(path);
      clearAuth();
      window.location.replace("/login");
      throw new Error("Unauthorized");
    }
    if (!res.ok) throw new Error("Export failed");
    return res.blob();
  },
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register:       (data)              => api.post("/auth/register", data),
  login:          (data)              => api.post("/auth/login", data),
  forgotPassword: (email)             => api.post("/auth/forgot-password", { email }),
  resetPassword:  (token, password)   => api.post("/auth/reset-password", { token, password }),
  refresh:        (refreshToken)      => api.post("/auth/refresh", { refreshToken }),
};

// ─── 2FA ──────────────────────────────────────────────────────────────────────
export const twoFactorApi = {
  setup:   ()           => api.post("/auth/2fa/setup", {}),
  enable:  (totpCode)   => api.post("/auth/2fa/enable", { totpCode }),
  disable: (totpCode)   => api.post("/auth/2fa/disable", { totpCode }),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersApi = {
  me:             ()                          => api.get("/users/me"),
  updateProfile:  (data)                      => api.patch("/users/me", data),
  changePassword: (currentPassword, newPassword) =>
    api.post("/users/me/change-password", { currentPassword, newPassword }),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardApi = {
  overview:     () => api.get("/dashboard/overview"),
  revenueChart: () => api.get("/dashboard/revenue-chart"),
};

// ─── Transactions ─────────────────────────────────────────────────────────────
export const transactionsApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null))
    ).toString();
    return api.get(`/transactions${qs ? `?${qs}` : ""}`);
  },
  export: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null))
    ).toString();
    return api.download(`/transactions/export${qs ? `?${qs}` : ""}`);
  },
  get:          (id)            => api.get(`/transactions/${id}`),
  getByReference:(reference)    => api.get(`/transactions/reference/${reference}`),
  create:       (data)          => api.post("/transactions", data),
  verify:       (id)            => api.post(`/transactions/${id}/verify`, {}),
  updateStatus: (id, status)    => api.patch(`/transactions/${id}/status`, { status }),
  refund:       (id, amount)    => api.post(`/transactions/${id}/refund`, amount != null ? { amount } : {}),
};

// ─── Gateways ─────────────────────────────────────────────────────────────────
export const gatewaysApi = {
  list:   ()          => api.get("/gateways"),
  get:    (id)        => api.get(`/gateways/${id}`),
  webhookEvents: (id) => api.get(`/gateways/${id}/webhook-events`),
  syncRuns: (id)      => api.get(`/gateways/${id}/sync-runs`),
  create: (data)      => api.post("/gateways", data),
  update: (id, data)  => api.patch(`/gateways/${id}`, data),
  validate:(id)       => api.post(`/gateways/${id}/validate`, {}),
  syncTransactions: (id, data = {}) => api.post(`/gateways/${id}/sync-transactions`, data),
  toggle: (id)        => api.patch(`/gateways/${id}/toggle`),
  remove: (id)        => api.delete(`/gateways/${id}`),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsApi = {
  summary:          (days = 30) => api.get(`/analytics/summary?days=${days}`),
  revenueChart:     (days = 30) => api.get(`/analytics/revenue-chart?days=${days}`),
  gatewayBreakdown: (days = 30) => api.get(`/analytics/gateway-breakdown?days=${days}`),
  kpis:             (days = 30) => api.get(`/analytics/kpis?days=${days}`),
};

// ─── API Keys ─────────────────────────────────────────────────────────────────
export const apiKeysApi = {
  list:     ()              => api.get("/api-keys"),
  generate: (name, type)    => api.post("/api-keys", { name, type }),
  revoke:   (id)            => api.patch(`/api-keys/${id}/revoke`),
  remove:   (id)            => api.delete(`/api-keys/${id}`),
};

// ─── Webhooks ─────────────────────────────────────────────────────────────────
export const webhooksApi = {
  list:          ()           => api.get("/webhooks"),
  create:        (data)       => api.post("/webhooks", data),
  update:        (id, data)   => api.patch(`/webhooks/${id}`, data),
  remove:        (id)         => api.delete(`/webhooks/${id}`),
  deliveries:    (id)         => api.get(`/webhooks/${id}/deliveries`),
  test:          (id)         => api.post(`/webhooks/${id}/test`, {}),
  retryDelivery: (deliveryId) => api.post(`/webhooks/deliveries/${deliveryId}/retry`, {}),
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationsApi = {
  list:       ()    => api.get("/notifications"),
  markRead:   (id)  => api.patch(`/notifications/${id}/read`),
  markAllRead:()    => api.patch("/notifications/read-all"),
  remove:     (id)  => api.delete(`/notifications/${id}`),
};

// ─── Search ───────────────────────────────────────────────────────────────────
export const searchApi = {
  global: (q) => api.get(`/search?q=${encodeURIComponent(q)}`),
};

// ─── Organization ─────────────────────────────────────────────────────────────
export const organizationApi = {
  members:       ()      => api.get("/users/organization/members"),
  updatePlan:    (plan)  => api.patch("/users/me/organization", { plan }),
  updateProfile: (data)  => api.patch("/users/me/organization/profile", data),
};

// ─── Customers ────────────────────────────────────────────────────────────────
export const customersApi = {
  list:    (search)  => api.get(`/customers${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  getOne:  (email)   => api.get(`/customers/${encodeURIComponent(email)}`),
};

// ─── Audit log ────────────────────────────────────────────────────────────────
export const auditApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null))
    ).toString();
    return api.get(`/audit${qs ? `?${qs}` : ""}`);
  },
};

// ─── Notification preferences ─────────────────────────────────────────────────
export const notifPrefsApi = {
  save: (prefs) => api.patch("/users/me/notification-preferences", prefs),
};
