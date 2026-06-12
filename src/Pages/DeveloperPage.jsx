import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  PlusIcon,
  PowerOffIcon,
  TerminalIcon,
  Trash2Icon,
  XIcon,
  ZapIcon,
} from "lucide-react";
import { webhooksApi } from "../API/apiClient";
import { AppLayout } from "../Components/AppLayout";
import { LoadingSkeleton } from "../Components/LoadingSkeleton";
import {
  clearDeveloperKeyError,
  clearDeveloperWebhookError,
  clearGeneratedKey,
  createWebhook,
  deleteApiKey,
  deleteWebhook,
  fetchDeveloperData,
  generateApiKey,
  revokeApiKey,
  selectDeveloperDeletingKeyId,
  selectDeveloperDeletingWebhookId,
  selectDeveloperError,
  selectDeveloperGateways,
  selectDeveloperKeyError,
  selectDeveloperKeys,
  selectDeveloperLoading,
  selectDeveloperRevokingId,
  selectDeveloperSavingKey,
  selectDeveloperSavingWebhook,
  selectDeveloperWebhookError,
  selectDeveloperWebhooks,
  selectGeneratedKeyValue,
} from "../store/slices/developerSlice";

const SDK_LANGUAGES = [
  { id: "javascript", label: "JavaScript" },
  { id: "node", label: "Node.js" },
  { id: "python", label: "Python" },
  { id: "curl", label: "cURL" },
];

const SDK_SECTIONS = [
  { id: "install", label: "Install" },
  { id: "client", label: "Client" },
  { id: "transaction", label: "Create Transaction" },
  { id: "webhook", label: "Webhook" },
];

function buildSdkSnippets({ language, apiKey, gatewayId }) {
  const baseUrl = "http://localhost:3000/api/v1";
  const key = apiKey || "pk_test_your_key_here";
  const gw = gatewayId || "your_gateway_id";

  if (language === "javascript") {
    return {
      install: "npm install @payorchestra/sdk",
      client: `import { PayOrchestraClient } from "@payorchestra/sdk";

const client = new PayOrchestraClient({
  apiKey: "${key}",
  // baseUrl defaults to https://api.payorchestra.com/v1
});`,
      transaction: `// Create a transaction
const tx = await client.createTransaction(
  {
    amount: 25000,
    currency: "NGN",
    customerName: "Jane Doe",
    customerEmail: "jane@example.com",
    gatewayId: "${gw}",
    description: "Order payment",
  },
  { idempotencyKey: \`order-\${crypto.randomUUID()}\` }
);

// List transactions
const { data, meta } = await client.listTransactions({ status: "SUCCESS", limit: 20 });

// Get gateways
const gateways = await client.listGateways();

console.log(tx.reference, meta.total);`,
      webhook: `import { verifyWebhookSignature } from "@payorchestra/sdk";

app.post("/webhooks/payorchestra", (req, res) => {
  const isValid = verifyWebhookSignature({
    secret: process.env.PAYORCHESTRA_WEBHOOK_SECRET,
    payload: JSON.stringify(req.body),
    timestamp: req.headers["x-payorchestra-timestamp"],
    signature: req.headers["x-payorchestra-signature"],
  });

  if (!isValid) return res.status(400).json({ error: "Invalid signature" });

  const { event, data } = req.body;
  console.log("PayOrchestra event:", event, data);
  res.status(200).json({ received: true });
});`,
    };
  }

  if (language === "node") {
    return {
      install: "npm install @payorchestra/sdk",
      client: `const { PayOrchestraClient } = require("@payorchestra/sdk");

const client = new PayOrchestraClient({
  apiKey: "${key}",
});`,
      transaction: `const { verifyWebhookSignature } = require("@payorchestra/sdk");

async function run() {
  // Create a transaction
  const tx = await client.createTransaction(
    {
      amount: 25000,
      currency: "NGN",
      customerName: "Jane Doe",
      customerEmail: "jane@example.com",
      gatewayId: "${gw}",
    },
    { idempotencyKey: \`order-\${Date.now()}\` }
  );

  // Verify & list
  const verified = await client.verifyTransaction(tx.id);
  const gateways = await client.listGateways();
  console.log(tx.reference, verified.status, gateways.length);
}

run().catch(console.error);`,
      webhook: `const express = require("express");
const { verifyWebhookSignature } = require("@payorchestra/sdk");
const app = express();
app.use(express.json());

app.post("/webhooks/payorchestra", (req, res) => {
  const isValid = verifyWebhookSignature({
    secret: process.env.PAYORCHESTRA_WEBHOOK_SECRET,
    payload: JSON.stringify(req.body),
    timestamp: req.headers["x-payorchestra-timestamp"],
    signature: req.headers["x-payorchestra-signature"],
  });

  if (!isValid) return res.status(400).json({ error: "Invalid signature" });
  console.log("Event:", req.body.event, req.body.data);
  res.json({ received: true });
});`,
    };
  }

  if (language === "python") {
    return {
      install: "pip install requests flask",
      client: `import requests

BASE_URL = "${baseUrl}"
API_KEY = "${key}"

def payorchestra_request(path, method="GET", payload=None):
    response = requests.request(
        method,
        f"{BASE_URL}{path}",
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=30,
    )
    response.raise_for_status()
    return response.json()["data"]`,
      transaction: `from payorchestra_client import payorchestra_request

transaction = payorchestra_request(
    "/transactions",
    method="POST",
    payload={
        "amount": 25000,
        "currency": "NGN",
        "customerName": "Jane Doe",
        "customerEmail": "jane@example.com",
        "gatewayId": "${gw}",
        "description": "Starter plan purchase",
    },
)

print(transaction)`,
      webhook: `from flask import Flask, request

app = Flask(__name__)

@app.post("/webhooks/payorchestra")
def payorchestra_webhook():
    print(request.json)
    return {"received": True}, 200`,
    };
  }

  return {
    install: "# No install needed for cURL",
    client: `export PAYORCHESTRA_API="${baseUrl}"
export PAYORCHESTRA_KEY="${key}"`,
    transaction: `curl -X POST "$PAYORCHESTRA_API/transactions" \\
  -H "Authorization: Bearer $PAYORCHESTRA_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 25000,
    "currency": "NGN",
    "customerName": "Jane Doe",
    "customerEmail": "jane@example.com",
    "gatewayId": "${gw}",
    "description": "Starter plan purchase"
  }'`,
    webhook: `curl -X POST "https://yourapp.com/webhooks/payorchestra" \\
  -H "Content-Type: application/json" \\
  -d '{"received": true}'`,
  };
}

export function DeveloperPage() {
  const dispatch = useDispatch();
  const keys = useSelector(selectDeveloperKeys);
  const gateways = useSelector(selectDeveloperGateways);
  const webhooks = useSelector(selectDeveloperWebhooks);
  const loading = useSelector(selectDeveloperLoading);
  const error = useSelector(selectDeveloperError);
  const keyError = useSelector(selectDeveloperKeyError);
  const webhookError = useSelector(selectDeveloperWebhookError);
  const savingKey = useSelector(selectDeveloperSavingKey);
  const savingWebhook = useSelector(selectDeveloperSavingWebhook);
  const newKeyValue = useSelector(selectGeneratedKeyValue);
  const revokingId = useSelector(selectDeveloperRevokingId);
  const deletingKeyId = useSelector(selectDeveloperDeletingKeyId);
  const deletingWebhookId = useSelector(selectDeveloperDeletingWebhookId);

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [keyType, setKeyType] = useState("LIVE");
  const [whUrl, setWhUrl] = useState("");
  const [whEvents, setWhEvents] = useState("payment.success,payment.failed");
  const [localKeyError, setLocalKeyError] = useState("");
  const [localWebhookError, setLocalWebhookError] = useState("");
  const [revealedKeys, setRevealedKeys] = useState(new Set());
  const [copiedId, setCopiedId] = useState(null);
  const [sdkLanguage, setSdkLanguage] = useState("javascript");
  const [sdkSection, setSdkSection] = useState("transaction");
  const [sdkKeyId, setSdkKeyId] = useState("");
  const [sdkGatewayId, setSdkGatewayId] = useState("");
  const [testingWebhookId, setTestingWebhookId] = useState(null);
  const [testResult, setTestResult] = useState({});
  const [expandedWebhook, setExpandedWebhook] = useState(null);
  const [deliveries, setDeliveries] = useState({});
  const [loadingDeliveries, setLoadingDeliveries] = useState(null);
  const [retryingDelivery, setRetryingDelivery] = useState(null);

  useEffect(() => {
    dispatch(fetchDeveloperData());
  }, [dispatch]);

  useEffect(() => {
    if (!sdkKeyId && keys.length > 0) {
      const activeKey = keys.find((item) => !item.isRevoked) ?? keys[0];
      setSdkKeyId(activeKey.id);
    }
  }, [keys, sdkKeyId]);

  useEffect(() => {
    if (!sdkGatewayId && gateways.length > 0) {
      setSdkGatewayId(gateways[0].id);
    }
  }, [gateways, sdkGatewayId]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadSnippet = (content, section) => {
    const extMap = {
      javascript: "js",
      node: "js",
      python: "py",
      curl: "sh",
    };
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payorchestra-${section}.${extMap[sdkLanguage]}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGenerateKey = async () => {
    if (!keyName.trim()) {
      setLocalKeyError("Key name is required.");
      return;
    }

    setLocalKeyError("");
    const result = await dispatch(generateApiKey({ name: keyName.trim(), type: keyType }));
    if (generateApiKey.fulfilled.match(result)) {
      setKeyName("");
    }
  };

  const handleDeleteKey = async (id) => {
    if (!window.confirm("Delete this API key permanently?")) return;
    dispatch(deleteApiKey(id));
  };

  const handleAddWebhook = async () => {
    if (!whUrl.trim()) {
      setLocalWebhookError("URL is required.");
      return;
    }

    setLocalWebhookError("");
    const events = whEvents.split(",").map((item) => item.trim()).filter(Boolean);
    const result = await dispatch(createWebhook({ url: whUrl.trim(), events }));
    if (createWebhook.fulfilled.match(result)) {
      setWhUrl("");
      setWhEvents("payment.success,payment.failed");
      setShowWebhookModal(false);
    }
  };

  const handleDeleteWebhook = async (id) => {
    if (!window.confirm("Delete this webhook endpoint?")) return;
    dispatch(deleteWebhook(id));
  };

  const handleToggleDeliveries = async (webhookId) => {
    if (expandedWebhook === webhookId) { setExpandedWebhook(null); return; }
    setExpandedWebhook(webhookId);
    if (deliveries[webhookId]) return;
    setLoadingDeliveries(webhookId);
    try {
      const data = await webhooksApi.deliveries(webhookId);
      setDeliveries((prev) => ({ ...prev, [webhookId]: Array.isArray(data) ? data : [] }));
    } catch { /* silent */ }
    finally { setLoadingDeliveries(null); }
  };

  const handleRetryDelivery = async (deliveryId, webhookId) => {
    setRetryingDelivery(deliveryId);
    try {
      await webhooksApi.retryDelivery(deliveryId);
      // Refresh deliveries for this webhook
      const data = await webhooksApi.deliveries(webhookId);
      setDeliveries((prev) => ({ ...prev, [webhookId]: Array.isArray(data) ? data : [] }));
    } catch { /* silent */ }
    finally { setRetryingDelivery(null); }
  };

  const handleTestWebhook = async (id) => {
    setTestingWebhookId(id);
    setTestResult((prev) => ({ ...prev, [id]: null }));
    try {
      const result = await webhooksApi.test(id);
      const ok = result?.statusCode >= 200 && result?.statusCode < 300;
      setTestResult((prev) => ({ ...prev, [id]: { ok, code: result?.statusCode ?? "—" } }));
    } catch (err) {
      setTestResult((prev) => ({ ...prev, [id]: { ok: false, code: "ERR", message: err.message } }));
    } finally {
      setTestingWebhookId(null);
    }
  };

  const selectedKey = keys.find((item) => item.id === sdkKeyId) ?? null;
  const selectedGateway = gateways.find((item) => item.id === sdkGatewayId) ?? null;
  const snippets = buildSdkSnippets({
    language: sdkLanguage,
    apiKey: newKeyValue || selectedKey?.key || selectedKey?.prefix,
    gatewayId: selectedGateway?.id,
  });

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 lg:space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4">
            <p className="text-sm font-bold text-red-600">{error}</p>
          </div>
        )}

        <div className="bg-white p-5 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex flex-wrap items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h3 className="text-xl font-bold text-[#1A1A1A]">API Keys</h3>
              <p className="text-sm text-gray-500 font-medium">Manage your secret keys for API access</p>
            </div>
            <button
              onClick={() => {
                setShowKeyModal(true);
                setKeyName("");
                setKeyType("LIVE");
                setLocalKeyError("");
                dispatch(clearDeveloperKeyError());
                dispatch(clearGeneratedKey());
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 shadow-sm transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Generate New Key
            </button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((index) => <LoadingSkeleton key={index} className="h-16" />)}
            </div>
          ) : keys.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No API keys yet. Generate one to get started.</p>
          ) : (
            <div className="space-y-4">
              {keys.map((key) => {
                const isRevealed = revealedKeys.has(key.id);
                const displayKey = `${key.prefix}${isRevealed ? "************" : "****************"}`;

                return (
                  <div key={key.id} className="p-5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-[#1A1A1A]">{key.name}</span>
                        <span className={`px-2.5 py-0.5 text-xs rounded-full font-bold ${key.type === "LIVE" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                          {key.type === "LIVE" ? "Live" : "Test"}
                        </span>
                        {key.isRevoked && (
                          <span className="px-2.5 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-bold">Revoked</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <p className="text-xs text-gray-400 font-medium">Created {new Date(key.createdAt).toLocaleDateString()}</p>
                        {key.lastUsedAt && <p className="text-xs text-gray-400 font-medium">Last used {new Date(key.lastUsedAt).toLocaleDateString()}</p>}
                        {key.requestCount > 0 && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                            {key.requestCount.toLocaleString()} requests
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <code className="px-4 py-2 bg-gray-200 rounded-lg text-sm font-mono text-gray-700">{displayKey}</code>
                      <button
                        onClick={() => handleCopy(key.prefix, key.id)}
                        className="p-2 text-gray-500 hover:text-[#22C55E] hover:bg-white rounded-lg transition-colors"
                        title="Copy"
                      >
                        {copiedId === key.id ? <CheckIcon className="w-4 h-4 text-green-500" /> : <CopyIcon className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() =>
                          setRevealedKeys((current) => {
                            const next = new Set(current);
                            if (isRevealed) next.delete(key.id);
                            else next.add(key.id);
                            return next;
                          })
                        }
                        className="p-2 text-gray-500 hover:text-[#22C55E] hover:bg-white rounded-lg transition-colors"
                        title="Toggle visibility"
                      >
                        {isRevealed ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      </button>
                      {!key.isRevoked && (
                        <button
                          onClick={() => dispatch(revokeApiKey(key.id))}
                          disabled={revokingId === key.id}
                          className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-40"
                          title="Revoke"
                        >
                          {revokingId === key.id ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <PowerOffIcon className="w-4 h-4" />}
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteKey(key.id)}
                        disabled={deletingKeyId === key.id}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                        title="Delete"
                      >
                        {deletingKeyId === key.id ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <Trash2Icon className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white p-5 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex flex-wrap items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h3 className="text-xl font-bold text-[#1A1A1A]">Webhooks</h3>
              <p className="text-sm text-gray-500 font-medium">Configure event notifications for your endpoints</p>
            </div>
            <button
              onClick={() => {
                setShowWebhookModal(true);
                setWhUrl("");
                setWhEvents("payment.success,payment.failed");
                setLocalWebhookError("");
                dispatch(clearDeveloperWebhookError());
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-[#1A1A1A] rounded-xl text-sm font-bold hover:bg-gray-50 shadow-sm transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Add Endpoint
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((index) => <LoadingSkeleton key={index} className="h-14" />)}
            </div>
          ) : webhooks.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No webhook endpoints yet.</p>
          ) : (
            <table className="w-full text-sm text-left min-w-[480px]">
              <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-4 sm:px-6 py-3">URL</th>
                  <th className="px-4 sm:px-6 py-3 hidden sm:table-cell">Events</th>
                  <th className="px-4 sm:px-6 py-3">Status</th>
                  <th className="px-4 sm:px-6 py-3 hidden md:table-cell">Created</th>
                  <th className="px-4 sm:px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {webhooks.map((webhook) => (
                  <>
                    <tr key={webhook.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 sm:px-6 py-4 font-mono text-gray-600 font-medium text-xs max-w-[140px] sm:max-w-xs truncate">{webhook.url}</td>
                      <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {(webhook.events ?? []).slice(0, 2).map((event) => (
                            <span key={event} className="px-2 py-0.5 bg-gray-100 rounded-md text-xs font-bold text-gray-700">{event}</span>
                          ))}
                          {webhook.events?.length > 2 && (
                            <span className="px-2 py-0.5 bg-gray-100 rounded-md text-xs font-bold text-gray-500">+{webhook.events.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`font-bold text-xs sm:text-sm ${webhook.isActive ? "text-[#22C55E]" : "text-gray-400"}`}>
                          {webhook.isActive ? "On" : "Off"}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-gray-500 font-medium text-xs hidden md:table-cell">{new Date(webhook.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 sm:px-6 py-4 text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => handleTestWebhook(webhook.id)}
                            disabled={testingWebhookId === webhook.id}
                            title="Send test event"
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#5a8a00] hover:bg-[#C5E63D]/20 rounded-lg transition-colors disabled:opacity-40"
                          >
                            {testingWebhookId === webhook.id ? <Loader2Icon className="w-3.5 h-3.5 animate-spin" /> : <ZapIcon className="w-3.5 h-3.5" />}
                            {testResult[webhook.id] != null ? (
                              <span className={testResult[webhook.id].ok ? "text-green-600" : "text-red-600"}>
                                {testResult[webhook.id].ok ? `${testResult[webhook.id].code} OK` : `${testResult[webhook.id].code} Fail`}
                              </span>
                            ) : "Test"}
                          </button>
                          <button
                            onClick={() => handleToggleDeliveries(webhook.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Delivery history"
                          >
                            History {expandedWebhook === webhook.id ? "▲" : "▼"}
                          </button>
                          <button
                            onClick={() => handleDeleteWebhook(webhook.id)}
                            disabled={deletingWebhookId === webhook.id}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                          >
                            {deletingWebhookId === webhook.id ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <Trash2Icon className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedWebhook === webhook.id && (
                      <tr>
                        <td colSpan={5} className="bg-gray-50 px-4 sm:px-6 py-4 border-b border-gray-100">
                          {loadingDeliveries === webhook.id ? (
                            <div className="flex items-center gap-2 text-sm text-gray-400"><Loader2Icon className="w-4 h-4 animate-spin" /> Loading deliveries…</div>
                          ) : !deliveries[webhook.id]?.length ? (
                            <p className="text-sm text-gray-400">No deliveries yet.</p>
                          ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {deliveries[webhook.id].map((d) => (
                                <div key={d.id} className="flex items-center justify-between gap-3 bg-white rounded-xl border border-gray-100 px-3 py-2 text-xs">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <span className={`font-black shrink-0 ${d.statusCode >= 200 && d.statusCode < 300 ? "text-green-600" : "text-red-600"}`}>
                                      {d.statusCode === 0 ? "ERR" : d.statusCode}
                                    </span>
                                    <span className="font-bold text-gray-600 shrink-0">{d.event}</span>
                                    <span className="text-gray-400 truncate hidden sm:block">{new Date(d.deliveredAt).toLocaleString()}</span>
                                  </div>
                                  {(d.statusCode === 0 || d.statusCode >= 300) && (
                                    <button
                                      onClick={() => handleRetryDelivery(d.id, webhook.id)}
                                      disabled={retryingDelivery === d.id}
                                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors disabled:opacity-60 shrink-0"
                                    >
                                      {retryingDelivery === d.id ? <Loader2Icon className="w-3 h-3 animate-spin" /> : "↺"} Retry
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-[#1A1A1A] rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
            <div className="flex items-center gap-3 text-gray-300">
              <TerminalIcon className="w-4 h-4" />
              <span className="text-sm font-bold">Developer SDK</span>
            </div>
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="w-3 h-3 rounded-full bg-[#22C55E]" />
            </div>
          </div>

          <div className="p-5 sm:p-8 space-y-6">
            <div className="flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">
              <div className="flex flex-wrap gap-2">
                {SDK_LANGUAGES.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSdkLanguage(item.id)}
                    className={`px-3 py-2 rounded-xl text-sm font-bold transition-colors ${
                      sdkLanguage === item.id
                        ? "bg-[#C5E63D] text-[#111827]"
                        : "bg-white/5 text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-3 xl:min-w-[420px]">
                <select
                  value={sdkKeyId}
                  onChange={(e) => setSdkKeyId(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-gray-200 outline-none"
                >
                  <option value="">Select API key</option>
                  {keys.filter((item) => !item.isRevoked).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.type})
                    </option>
                  ))}
                </select>

                <select
                  value={sdkGatewayId}
                  onChange={(e) => setSdkGatewayId(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-gray-200 outline-none"
                >
                  <option value="">Select gateway</option>
                  {gateways.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400 font-bold mb-2">Auth Mode</p>
                <p className="text-sm text-white font-bold">Bearer API Key</p>
                <p className="text-xs text-gray-400 mt-1">SDK examples call `POST /transactions` with generated API keys.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400 font-bold mb-2">Selected Key</p>
                <p className="text-sm text-white font-bold">{selectedKey?.name ?? "No key selected"}</p>
                <p className="text-xs text-gray-400 mt-1 font-mono">{selectedKey?.prefix ?? "Generate a key to begin"}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400 font-bold mb-2">Selected Gateway</p>
                <p className="text-sm text-white font-bold">{selectedGateway?.name ?? "No gateway selected"}</p>
                <p className="text-xs text-gray-400 mt-1 font-mono">{selectedGateway?.id ?? "Connect a gateway first"}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {SDK_SECTIONS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSdkSection(item.id)}
                  className={`px-3 py-2 rounded-xl text-sm font-bold transition-colors ${
                    sdkSection === item.id
                      ? "bg-white text-[#111827]"
                      : "bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="bg-[#111827] border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-white">{SDK_SECTIONS.find((item) => item.id === sdkSection)?.label}</p>
                  <p className="text-xs text-gray-400">Generated from your current developer settings.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(snippets[sdkSection], `sdk-${sdkLanguage}-${sdkSection}`)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-gray-200 text-sm font-bold hover:bg-white/10 transition-colors"
                  >
                    {copiedId === `sdk-${sdkLanguage}-${sdkSection}` ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                    Copy
                  </button>
                  <button
                    onClick={() => handleDownloadSnippet(snippets[sdkSection], sdkSection)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-gray-200 text-sm font-bold hover:bg-white/10 transition-colors"
                  >
                    <DownloadIcon className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
              <pre className="p-5 text-xs leading-relaxed text-blue-200 overflow-x-auto whitespace-pre-wrap break-words">{snippets[sdkSection]}</pre>
            </div>
          </div>
        </div>
      </div>

      {showKeyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#1A1A1A]">Generate API Key</h3>
              <button onClick={() => setShowKeyModal(false)} className="p-2 text-gray-400 hover:text-[#1A1A1A] rounded-xl hover:bg-gray-100 transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {localKeyError && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm font-bold text-red-600">{localKeyError}</div>}
              {keyError && !localKeyError && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm font-bold text-red-600">{keyError}</div>}

              {newKeyValue ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-sm font-bold text-green-700 mb-2">Key generated. Copy it now. It will not be shown again.</p>
                    <code className="block text-xs font-mono text-green-800 break-all">{newKeyValue}</code>
                  </div>
                  <button
                    onClick={() => handleCopy(newKeyValue, "new")}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors"
                  >
                    {copiedId === "new" ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                    {copiedId === "new" ? "Copied!" : "Copy Key"}
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Key Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Production Backend"
                      value={keyName}
                      onChange={(e) => {
                        setLocalKeyError("");
                        dispatch(clearDeveloperKeyError());
                        setKeyName(e.target.value);
                      }}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Environment</label>
                    <div className="flex gap-3">
                      {["LIVE", "TEST"].map((type) => (
                        <button
                          key={type}
                          onClick={() => setKeyType(type)}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors ${keyType === type ? "bg-[#C5E63D] border-[#C5E63D] text-[#1A1A1A]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                        >
                          {type === "LIVE" ? "Live" : "Test"}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            {!newKeyValue && (
              <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
                <button onClick={() => setShowKeyModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button
                  onClick={handleGenerateKey}
                  disabled={savingKey}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-60"
                >
                  {savingKey ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <PlusIcon className="w-4 h-4" />}
                  Generate
                </button>
              </div>
            )}
            {newKeyValue && (
              <div className="flex justify-end p-6 border-t border-gray-100">
                <button onClick={() => setShowKeyModal(false)} className="px-5 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">Done</button>
              </div>
            )}
          </div>
        </div>
      )}

      {showWebhookModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#1A1A1A]">Add Webhook Endpoint</h3>
              <button onClick={() => setShowWebhookModal(false)} className="p-2 text-gray-400 hover:text-[#1A1A1A] rounded-xl hover:bg-gray-100 transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {localWebhookError && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm font-bold text-red-600">{localWebhookError}</div>}
              {webhookError && !localWebhookError && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm font-bold text-red-600">{webhookError}</div>}
              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Endpoint URL *</label>
                <input
                  type="url"
                  placeholder="https://yourapp.com/webhooks"
                  value={whUrl}
                  onChange={(e) => {
                    setLocalWebhookError("");
                    dispatch(clearDeveloperWebhookError());
                    setWhUrl(e.target.value);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Events (comma-separated)</label>
                <input
                  type="text"
                  placeholder="payment.success,payment.failed"
                  value={whEvents}
                  onChange={(e) => setWhEvents(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] font-medium"
                />
                <p className="text-xs text-gray-500 mt-1.5 font-medium">e.g. payment.success, payment.failed, refund.created</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowWebhookModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
              <button
                onClick={handleAddWebhook}
                disabled={savingWebhook}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-60"
              >
                {savingWebhook ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <PlusIcon className="w-4 h-4" />}
                Add Endpoint
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
