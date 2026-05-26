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
} from "lucide-react";
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
      install: "npm install",
      client: `const PAYORCHESTRA_API = "${baseUrl}";
const PAYORCHESTRA_KEY = "${key}";

export async function payOrchestraRequest(path, options = {}) {
  const response = await fetch(\`\${PAYORCHESTRA_API}\${path}\`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: \`Bearer \${PAYORCHESTRA_KEY}\`,
      ...(options.headers || {}),
    },
  });

  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || "Request failed");
  return payload.data;
}`,
      transaction: `import { payOrchestraRequest } from "./payorchestra-client";

const transaction = await payOrchestraRequest("/transactions", {
  method: "POST",
  body: JSON.stringify({
    amount: 25000,
    currency: "NGN",
    customerName: "Jane Doe",
    customerEmail: "jane@example.com",
    gatewayId: "${gw}",
    description: "Starter plan purchase",
  }),
});

console.log(transaction);`,
      webhook: `app.post("/webhooks/payorchestra", async (req, res) => {
  console.log("Incoming PayOrchestra event", req.body);
  res.status(200).json({ received: true });
});`,
    };
  }

  if (language === "node") {
    return {
      install: "npm install axios express",
      client: `const axios = require("axios");

const client = axios.create({
  baseURL: "${baseUrl}",
  headers: {
    Authorization: "Bearer ${key}",
    "Content-Type": "application/json",
  },
});

module.exports = client;`,
      transaction: `const client = require("./payorchestra");

async function createTransaction() {
  const { data } = await client.post("/transactions", {
    amount: 25000,
    currency: "NGN",
    customerName: "Jane Doe",
    customerEmail: "jane@example.com",
    gatewayId: "${gw}",
    description: "Starter plan purchase",
  });

  console.log(data);
}

createTransaction().catch(console.error);`,
      webhook: `const express = require("express");
const app = express();

app.use(express.json());

app.post("/webhooks/payorchestra", (req, res) => {
  console.log(req.body);
  res.status(200).json({ received: true });
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

  const selectedKey = keys.find((item) => item.id === sdkKeyId) ?? null;
  const selectedGateway = gateways.find((item) => item.id === sdkGatewayId) ?? null;
  const snippets = buildSdkSnippets({
    language: sdkLanguage,
    apiKey: newKeyValue || selectedKey?.key || selectedKey?.prefix,
    gatewayId: selectedGateway?.id,
  });

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4">
            <p className="text-sm font-bold text-red-600">{error}</p>
          </div>
        )}

        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
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
                      <p className="text-xs text-gray-500 font-medium">Created {new Date(key.createdAt).toLocaleDateString()}</p>
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

        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
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
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">URL</th>
                  <th className="px-6 py-4">Events</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {webhooks.map((webhook) => (
                  <tr key={webhook.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5 font-mono text-gray-600 font-medium text-xs max-w-xs truncate">{webhook.url}</td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-1">
                        {(webhook.events ?? []).slice(0, 3).map((event) => (
                          <span key={event} className="px-2 py-0.5 bg-gray-100 rounded-md text-xs font-bold text-gray-700">{event}</span>
                        ))}
                        {webhook.events?.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-100 rounded-md text-xs font-bold text-gray-500">+{webhook.events.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`font-bold text-sm ${webhook.isActive ? "text-[#22C55E]" : "text-gray-400"}`}>
                        {webhook.isActive ? "Enabled" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-gray-500 font-medium text-xs">{new Date(webhook.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => handleDeleteWebhook(webhook.id)}
                        disabled={deletingWebhookId === webhook.id}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                      >
                        {deletingWebhookId === webhook.id ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <Trash2Icon className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
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

          <div className="p-8 space-y-6">
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

            <div className="grid md:grid-cols-3 gap-4">
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
