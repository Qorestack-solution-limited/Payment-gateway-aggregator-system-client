import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  SaveIcon,
  Loader2Icon,
  CheckCircle2Icon,
  RefreshCwIcon,
  ShieldCheckIcon,
  LinkIcon,
} from "lucide-react";
import { AppLayout } from "../Components/AppLayout";
import { LoadingSkeleton } from "../Components/LoadingSkeleton";
import {
  clearCurrentGateway,
  fetchGatewayDetail,
  selectCurrentGateway,
  selectCurrentGatewayError,
  selectCurrentGatewayLoading,
  selectGatewayUpdateError,
  selectGatewayUpdating,
  updateGateway,
  validateGateway,
} from "../store/slices/gatewaysSlice";

const INBOUND_WEBHOOK_URL = `${
  (import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1").replace(/\/$/, "")
}/payments/webhooks/paystack`;

const FLUTTERWAVE_WEBHOOK_URL = `${
  (import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1").replace(/\/$/, "")
}/payments/webhooks/flutterwave`;

export function GatewayDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const gateway = useSelector(selectCurrentGateway);
  const loading = useSelector(selectCurrentGatewayLoading);
  const error = useSelector(selectCurrentGatewayError);
  const updating = useSelector(selectGatewayUpdating);
  const updateError = useSelector(selectGatewayUpdateError);
  const [form, setForm] = useState({
    name: "",
    publicKey: "",
    secretKey: "",
    webhookSecret: "",
  });
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchGatewayDetail(id));
    }
    return () => {
      dispatch(clearCurrentGateway());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (gateway) {
      setForm({
        name: gateway.name ?? "",
        publicKey: gateway.publicKey ?? "",
        secretKey: "",
        webhookSecret: "",
      });
    }
  }, [gateway]);

  const handleSave = async () => {
    setMessage("");
    const payload = {
      name: form.name,
      publicKey: form.publicKey || undefined,
      ...(form.secretKey ? { secretKey: form.secretKey } : {}),
      ...(form.webhookSecret ? { webhookSecret: form.webhookSecret } : {}),
    };

    const result = await dispatch(updateGateway({ id, payload }));
    if (updateGateway.fulfilled.match(result)) {
      setMessage("Gateway configuration updated.");
      setForm((current) => ({ ...current, secretKey: "", webhookSecret: "" }));
    }
  };

  const handleValidate = async () => {
    setMessage("");
    const result = await dispatch(validateGateway(id));
    if (validateGateway.fulfilled.match(result)) {
      setMessage(result.payload.result?.message ?? "Gateway validated successfully.");
    }
  };

  const handleCopy = async () => {
    try {
      const url = gateway?.provider === "FLUTTERWAVE" ? FLUTTERWAVE_WEBHOOK_URL : INBOUND_WEBHOOK_URL;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <AppLayout>
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link to="/gateways" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#1A1A1A] mb-3">
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Gateways
            </Link>
            {loading ? (
              <>
                <LoadingSkeleton className="h-8 w-52 mb-2" />
                <LoadingSkeleton className="h-4 w-72" />
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-[#1A1A1A]">{gateway?.name ?? "Gateway"}</h2>
                <p className="text-sm text-gray-500 font-medium">
                  Manage credentials, validation, webhook setup, and health for this configured gateway.
                </p>
              </>
            )}
          </div>
          {gateway && (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
              gateway.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
            }`}>
              <CheckCircle2Icon className="w-4 h-4" />
              {gateway.status}
            </div>
          )}
        </div>

        {(error || updateError) && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4">
            <p className="text-sm font-bold text-red-600">{error || updateError}</p>
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4">
            <p className="text-sm font-bold text-green-700">{message}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <LoadingSkeleton className="h-96 lg:col-span-2" />
            <LoadingSkeleton className="h-96" />
          </div>
        ) : gateway ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-[#1A1A1A]">Configuration</h3>
                  <p className="text-sm text-gray-500 font-medium">Update this gateway without exposing saved secrets.</p>
                </div>
                <button
                  onClick={handleValidate}
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ShieldCheckIcon className="w-4 h-4" />
                  Validate
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Display Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Provider</label>
                  <input
                    value={gateway.provider}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Type</label>
                  <input
                    value={gateway.type ?? ""}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Public Key</label>
                  <input
                    value={form.publicKey}
                    onChange={(e) => setForm((current) => ({ ...current, publicKey: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#C5E63D]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Replace Secret Key</label>
                  <input
                    type="password"
                    value={form.secretKey}
                    onChange={(e) => setForm((current) => ({ ...current, secretKey: e.target.value }))}
                    placeholder={gateway.hasSecretKey ? "A secret key is already stored" : "No secret key stored yet"}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#C5E63D]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Replace Webhook Secret</label>
                  <input
                    type="password"
                    value={form.webhookSecret}
                    onChange={(e) => setForm((current) => ({ ...current, webhookSecret: e.target.value }))}
                    placeholder={gateway.hasWebhookSecret ? "A webhook secret is already stored" : "Optional webhook secret"}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#C5E63D]"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={updating}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-60"
                >
                  {updating ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <SaveIcon className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-5">Overview</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Transactions</span>
                    <span className="font-bold text-[#1A1A1A]">{(gateway.transactionCount ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Webhook Events</span>
                    <span className="font-bold text-[#1A1A1A]">{(gateway.webhookEventCount ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Sync Runs</span>
                    <span className="font-bold text-[#1A1A1A]">{(gateway.syncRunCount ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Last Sync</span>
                    <span className="font-bold text-[#1A1A1A] text-right">
                      {gateway.lastSyncedAt ? new Date(gateway.lastSyncedAt).toLocaleString() : "Never"}
                    </span>
                  </div>
                </div>
              </div>

              {(gateway.provider === "PAYSTACK" || gateway.provider === "FLUTTERWAVE") && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#1A1A1A]">Webhook Setup</h3>
                      <p className="text-sm text-gray-500 font-medium">
                        Use this URL in your {gateway.provider === "FLUTTERWAVE" ? "Flutterwave" : "Paystack"} dashboard.
                      </p>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="p-2 text-gray-400 hover:text-[#22C55E] hover:bg-green-50 rounded-lg transition-colors"
                    >
                      {copied ? <CheckCircle2Icon className="w-4 h-4 text-green-600" /> : <LinkIcon className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs font-mono break-all text-gray-600 bg-gray-50 rounded-xl p-3 border border-gray-100">
                    {gateway.provider === "FLUTTERWAVE" ? FLUTTERWAVE_WEBHOOK_URL : INBOUND_WEBHOOK_URL}
                  </p>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => dispatch(fetchGatewayDetail(id))}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <RefreshCwIcon className="w-4 h-4" />
                    Refresh Details
                  </button>
                  <Link
                    to="/transactions"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C5E63D] rounded-xl text-sm font-bold text-[#1A1A1A] hover:bg-[#b7d43a] transition-colors"
                  >
                    View Transactions
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
}
