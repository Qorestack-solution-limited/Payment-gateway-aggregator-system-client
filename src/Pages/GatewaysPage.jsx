import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  RefreshCwIcon,
  PlusIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  Trash2Icon,
  PowerIcon,
  XIcon,
  Loader2Icon,
  CopyIcon,
  CheckIcon,
  HistoryIcon,
} from "lucide-react";
import { AppLayout } from "../Components/AppLayout";
import { LoadingSkeleton } from "../Components/LoadingSkeleton";
import {
  clearGatewayFormError,
  createGateway,
  clearGatewayWebhookEvents,
  clearGatewaySyncRuns,
  fetchGateways,
  fetchGatewayWebhookEvents,
  fetchGatewaySyncRuns,
  selectGatewayDeletingId,
  selectGatewayFormError,
  selectGatewaySaving,
  selectGatewaySyncingId,
  selectGatewayTogglingId,
  selectGatewayValidatingId,
  selectGateways,
  selectGatewaysError,
  selectGatewaysLoading,
  selectGatewayWebhookEvents,
  selectGatewayWebhookEventsError,
  selectGatewayWebhookEventsGatewayId,
  selectGatewayWebhookEventsLoading,
  selectGatewaySyncRuns,
  selectGatewaySyncRunsError,
  selectGatewaySyncRunsGatewayId,
  selectGatewaySyncRunsLoading,
  syncGatewayTransactions,
  toggleGateway,
  validateGateway,
  deleteGateway,
} from "../store/slices/gatewaysSlice";

const PROVIDERS = ["STRIPE", "PAYPAL", "ADYEN", "SQUARE", "FLUTTERWAVE", "PAYSTACK", "OTHER"];

const GATEWAY_COLORS = {
  STRIPE: "bg-[#635BFF]",
  PAYPAL: "bg-blue-600",
  ADYEN: "bg-[#0ABF53]",
  SQUARE: "bg-gray-800",
  FLUTTERWAVE: "bg-orange-500",
  PAYSTACK: "bg-[#00C3F7]",
  OTHER: "bg-gray-600",
};

const EMPTY_FORM = {
  name: "",
  provider: "STRIPE",
  type: "CREDIT_CARD",
  publicKey: "",
  secretKey: "",
  webhookSecret: "",
};

const EMPTY_SYNC_FORM = {
  from: "",
  to: "",
};

const INBOUND_WEBHOOK_URL = `${
  (import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1").replace(/\/$/, "")
}/payments/webhooks/paystack`;

const FLUTTERWAVE_WEBHOOK_URL = `${
  (import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1").replace(/\/$/, "")
}/payments/webhooks/flutterwave`;

export function GatewaysPage() {
  const dispatch = useDispatch();
  const gateways = useSelector(selectGateways);
  const loading = useSelector(selectGatewaysLoading);
  const error = useSelector(selectGatewaysError);
  const saving = useSelector(selectGatewaySaving);
  const formError = useSelector(selectGatewayFormError);
  const togglingId = useSelector(selectGatewayTogglingId);
  const deletingId = useSelector(selectGatewayDeletingId);
  const validatingId = useSelector(selectGatewayValidatingId);
  const syncingId = useSelector(selectGatewaySyncingId);
  const webhookEvents = useSelector(selectGatewayWebhookEvents);
  const webhookEventsLoading = useSelector(selectGatewayWebhookEventsLoading);
  const webhookEventsError = useSelector(selectGatewayWebhookEventsError);
  const webhookEventsGatewayId = useSelector(selectGatewayWebhookEventsGatewayId);
  const syncRuns = useSelector(selectGatewaySyncRuns);
  const syncRunsLoading = useSelector(selectGatewaySyncRunsLoading);
  const syncRunsError = useSelector(selectGatewaySyncRunsError);
  const syncRunsGatewayId = useSelector(selectGatewaySyncRunsGatewayId);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [localFormError, setLocalFormError] = useState("");
  const [syncTarget, setSyncTarget] = useState(null);
  const [syncForm, setSyncForm] = useState(EMPTY_SYNC_FORM);
  const [copiedWebhookFor, setCopiedWebhookFor] = useState("");
  const [eventsTarget, setEventsTarget] = useState(null);
  const [syncRunsTarget, setSyncRunsTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchGateways());
  }, [dispatch]);

  const handleAdd = async () => {
    if (!form.name || !form.secretKey) {
      setLocalFormError("Name and Secret Key are required.");
      return;
    }

    setLocalFormError("");
    const result = await dispatch(createGateway(form));
    if (createGateway.fulfilled.match(result)) {
      setShowModal(false);
      setForm(EMPTY_FORM);
      setLocalFormError("");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this gateway? This cannot be undone.")) return;
    dispatch(deleteGateway(id));
  };

  const handleSync = async () => {
    if (!syncTarget) return;
    const payload = {
      ...(syncForm.from ? { from: syncForm.from } : {}),
      ...(syncForm.to ? { to: syncForm.to } : {}),
    };
    const result = await dispatch(syncGatewayTransactions({ id: syncTarget.id, payload }));
    if (syncGatewayTransactions.fulfilled.match(result)) {
      setSyncTarget(null);
      setSyncForm(EMPTY_SYNC_FORM);
    }
  };

  const handleCopyWebhookUrl = async (gatewayId, url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedWebhookFor(gatewayId);
      window.setTimeout(() => setCopiedWebhookFor(""), 1800);
    } catch {}
  };

  const openEventsModal = (gateway) => {
    setEventsTarget(gateway);
    dispatch(fetchGatewayWebhookEvents(gateway.id));
  };

  const openSyncRunsModal = (gateway) => {
    setSyncRunsTarget(gateway);
    dispatch(fetchGatewaySyncRuns(gateway.id));
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {error && (
          <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-6">
            <p className="text-sm font-bold text-red-600">{error}</p>
            <button onClick={() => dispatch(fetchGateways())} className="text-sm font-bold text-red-600 underline">Retry</button>
          </div>
        )}

        <div className="flex flex-wrap items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl font-bold text-[#1A1A1A]">Connected Gateways</h2>
            <p className="text-sm text-gray-500 font-medium">Manage your payment providers and configurations</p>
          </div>
          <button
            onClick={() => {
              setShowModal(true);
              setForm(EMPTY_FORM);
              setLocalFormError("");
              dispatch(clearGatewayFormError());
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 shadow-sm transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Add Gateway
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((index) => <LoadingSkeleton key={index} className="h-56" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gateways.map((gateway) => {
              const isActive = gateway.status === "ACTIVE";
              const color = GATEWAY_COLORS[gateway.provider] ?? "bg-gray-600";

              return (
                <div key={gateway.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-white font-bold text-lg shadow-sm`}>
                        {gateway.name[0].toUpperCase()}
                      </div>
                      <div>
                        <Link to={`/gateways/${gateway.id}`} className="font-bold text-[#1A1A1A] text-lg hover:text-[#22C55E] transition-colors">
                          {gateway.name}
                        </Link>
                        <p className="text-xs text-gray-500 font-medium capitalize">{gateway.provider}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => dispatch(validateGateway(gateway.id))}
                        disabled={validatingId === gateway.id}
                        title="Validate configuration"
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-40"
                      >
                        {validatingId === gateway.id ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <CheckCircle2Icon className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => {
                          setSyncTarget(gateway);
                          setSyncForm(EMPTY_SYNC_FORM);
                        }}
                        disabled={syncingId === gateway.id}
                        title="Sync transactions"
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-40"
                      >
                        {syncingId === gateway.id ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <RefreshCwIcon className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => openSyncRunsModal(gateway)}
                        title="View sync history"
                        className="p-1.5 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                      >
                        <RefreshCwIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEventsModal(gateway)}
                        title="View webhook events"
                        className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                      >
                        <HistoryIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => dispatch(toggleGateway(gateway.id))}
                        disabled={togglingId === gateway.id}
                        title={isActive ? "Disable" : "Enable"}
                        className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-40"
                      >
                        {togglingId === gateway.id ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <PowerIcon className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(gateway.id)}
                        disabled={deletingId === gateway.id}
                        title="Remove"
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                      >
                        {deletingId === gateway.id ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <Trash2Icon className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-sm text-gray-500 font-medium">Status</span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {isActive ? <CheckCircle2Icon className="w-3.5 h-3.5" /> : <AlertTriangleIcon className="w-3.5 h-3.5" />}
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-sm text-gray-500 font-medium">Type</span>
                      <span className="text-sm font-bold text-[#1A1A1A] capitalize">{gateway.type?.replace(/_/g, " ") ?? "-"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-500 font-medium">Transactions</span>
                      <span className="text-sm font-bold text-[#1A1A1A]">{(gateway.transactionCount ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="pt-2">
                      <p className="text-xs text-gray-400 font-medium">
                        Last sync: {gateway.lastSyncedAt ? new Date(gateway.lastSyncedAt).toLocaleString() : "Never"}
                      </p>
                      {gateway.provider === "PAYSTACK" && (
                        <div className="mt-2 rounded-xl border border-gray-100 bg-gray-50 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[11px] uppercase tracking-wide text-gray-400 font-bold">Inbound webhook</p>
                              <p className="text-xs text-gray-600 font-mono break-all">{INBOUND_WEBHOOK_URL}</p>
                            </div>
                            <button
                              onClick={() => handleCopyWebhookUrl(gateway.id, INBOUND_WEBHOOK_URL)}
                              className="shrink-0 p-2 text-gray-400 hover:text-[#22C55E] hover:bg-green-50 rounded-lg transition-colors"
                              title="Copy webhook URL"
                            >
                              {copiedWebhookFor === gateway.id ? <CheckIcon className="w-4 h-4 text-green-600" /> : <CopyIcon className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      )}
                      {gateway.provider === "FLUTTERWAVE" && (
                        <div className="mt-2 rounded-xl border border-gray-100 bg-gray-50 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[11px] uppercase tracking-wide text-gray-400 font-bold">Inbound webhook</p>
                              <p className="text-xs text-gray-600 font-mono break-all">{FLUTTERWAVE_WEBHOOK_URL}</p>
                            </div>
                            <button
                              onClick={() => handleCopyWebhookUrl(gateway.id, FLUTTERWAVE_WEBHOOK_URL)}
                              className="shrink-0 p-2 text-gray-400 hover:text-[#22C55E] hover:bg-green-50 rounded-lg transition-colors"
                              title="Copy webhook URL"
                            >
                              {copiedWebhookFor === gateway.id ? <CheckIcon className="w-4 h-4 text-green-600" /> : <CopyIcon className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      )}
                      {gateway.validationMessage && (
                        <p className="text-xs text-blue-600 font-medium mt-1">{gateway.validationMessage}</p>
                      )}
                      {gateway.lastSyncMessage && (
                        <p className={`text-xs font-medium mt-1 ${gateway.lastSyncStatus === "SUCCESS" ? "text-green-600" : "text-red-500"}`}>
                          {gateway.lastSyncMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              onClick={() => {
                setShowModal(true);
                setForm(EMPTY_FORM);
                setLocalFormError("");
                dispatch(clearGatewayFormError());
              }}
              className="border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-500 hover:border-[#22C55E] hover:text-[#22C55E] hover:bg-green-50/30 transition-all group min-h-[220px]"
            >
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                <PlusIcon className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg mb-1 text-[#1A1A1A] group-hover:text-[#22C55E]">Connect Gateway</h3>
              <p className="text-sm text-center max-w-[200px] font-medium">Add a new payment provider to your orchestration layer</p>
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#1A1A1A]">Add Payment Gateway</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-[#1A1A1A] rounded-xl hover:bg-gray-100 transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
              {localFormError && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm font-bold text-red-600">
                  {localFormError}
                </div>
              )}
              {formError && !localFormError && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm font-bold text-red-600">{formError}</div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Display Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. My Stripe"
                    value={form.name}
                    onChange={(e) => {
                      setLocalFormError("");
                      dispatch(clearGatewayFormError());
                      setForm((current) => ({ ...current, name: e.target.value }));
                    }}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Provider</label>
                  <select
                    value={form.provider}
                    onChange={(e) => setForm((current) => ({ ...current, provider: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] font-medium bg-white"
                  >
                    {PROVIDERS.map((provider) => <option key={provider} value={provider}>{provider}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Public Key</label>
                <input
                  type="text"
                  placeholder="pk_live_..."
                  value={form.publicKey}
                  onChange={(e) => setForm((current) => ({ ...current, publicKey: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Secret Key *</label>
                <input
                  type="password"
                  placeholder="sk_live_..."
                  value={form.secretKey}
                  onChange={(e) => {
                    setLocalFormError("");
                    dispatch(clearGatewayFormError());
                    setForm((current) => ({ ...current, secretKey: e.target.value }));
                  }}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Webhook Secret</label>
                <input
                  type="password"
                  placeholder="whsec_..."
                  value={form.webhookSecret}
                  onChange={(e) => setForm((current) => ({ ...current, webhookSecret: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-60"
              >
                {saving ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <PlusIcon className="w-4 h-4" />}
                Add Gateway
              </button>
            </div>
          </div>
        </div>
      )}

      {syncTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-[#1A1A1A]">Sync Transactions</h3>
                <p className="text-sm text-gray-500 font-medium">Pull transactions from {syncTarget.name}. Leave dates empty to sync the default provider range.</p>
              </div>
              <button onClick={() => setSyncTarget(null)} className="p-2 text-gray-400 hover:text-[#1A1A1A] rounded-xl hover:bg-gray-100 transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-2">From</label>
                  <input
                    type="date"
                    value={syncForm.from}
                    onChange={(e) => setSyncForm((current) => ({ ...current, from: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-2">To</label>
                  <input
                    type="date"
                    value={syncForm.to}
                    onChange={(e) => setSyncForm((current) => ({ ...current, to: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setSyncTarget(null)}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSync}
                disabled={syncingId === syncTarget.id}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-60"
              >
                {syncingId === syncTarget.id ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <RefreshCwIcon className="w-4 h-4" />}
                Sync Now
              </button>
            </div>
          </div>
        </div>
      )}

      {eventsTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-[#1A1A1A]">Webhook Events</h3>
                <p className="text-sm text-gray-500 font-medium">Recent inbound provider events for {eventsTarget.name}.</p>
              </div>
              <button
                onClick={() => {
                  setEventsTarget(null);
                  dispatch(clearGatewayWebhookEvents());
                }}
                className="p-2 text-gray-400 hover:text-[#1A1A1A] rounded-xl hover:bg-gray-100 transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {webhookEventsLoading && webhookEventsGatewayId === eventsTarget.id ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((index) => <LoadingSkeleton key={index} className="h-20" />)}
                </div>
              ) : webhookEventsError ? (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm font-bold text-red-600">
                  {webhookEventsError}
                </div>
              ) : webhookEvents.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-12 font-medium">No inbound webhook events yet.</p>
              ) : (
                <div className="space-y-4">
                  {webhookEvents.map((event) => (
                    <div key={event.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-sm font-bold text-[#1A1A1A]">{event.event}</span>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            event.status === "PROCESSED"
                              ? "bg-green-100 text-green-700"
                              : event.status === "IGNORED"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                          }`}>
                            {event.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 font-medium">{new Date(event.receivedAt).toLocaleString()}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <p><span className="text-gray-500 font-medium">Reference:</span> <span className="font-mono text-[#1A1A1A]">{event.reference ?? "-"}</span></p>
                        <p><span className="text-gray-500 font-medium">Transaction:</span> <span className="font-mono text-[#1A1A1A]">{event.transaction?.reference ?? "-"}</span></p>
                      </div>
                      {event.errorMessage && (
                        <p className="mt-3 text-sm font-medium text-red-600">{event.errorMessage}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => dispatch(fetchGatewayWebhookEvents(eventsTarget.id))}
                className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <RefreshCwIcon className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={() => {
                  setEventsTarget(null);
                  dispatch(clearGatewayWebhookEvents());
                }}
                className="px-5 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {syncRunsTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-[#1A1A1A]">Sync History</h3>
                <p className="text-sm text-gray-500 font-medium">Recent transaction sync runs for {syncRunsTarget.name}.</p>
              </div>
              <button
                onClick={() => {
                  setSyncRunsTarget(null);
                  dispatch(clearGatewaySyncRuns());
                }}
                className="p-2 text-gray-400 hover:text-[#1A1A1A] rounded-xl hover:bg-gray-100 transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {syncRunsLoading && syncRunsGatewayId === syncRunsTarget.id ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((index) => <LoadingSkeleton key={index} className="h-20" />)}
                </div>
              ) : syncRunsError ? (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm font-bold text-red-600">
                  {syncRunsError}
                </div>
              ) : syncRuns.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-12 font-medium">No sync runs recorded yet.</p>
              ) : (
                <div className="space-y-4">
                  {syncRuns.map((run) => (
                    <div key={run.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            run.status === "SUCCESS" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>
                            {run.status}
                          </span>
                          <span className="text-sm font-bold text-[#1A1A1A]">
                            Imported {run.imported}, updated {run.updated}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 font-medium">{new Date(run.startedAt).toLocaleString()}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <p><span className="text-gray-500 font-medium">Fetched:</span> <span className="font-bold text-[#1A1A1A]">{run.totalFetched}</span></p>
                        <p><span className="text-gray-500 font-medium">From:</span> <span className="font-medium text-[#1A1A1A]">{run.fromDate || "-"}</span></p>
                        <p><span className="text-gray-500 font-medium">To:</span> <span className="font-medium text-[#1A1A1A]">{run.toDate || "-"}</span></p>
                      </div>
                      {run.message && (
                        <p className={`mt-3 text-sm font-medium ${run.status === "SUCCESS" ? "text-green-700" : "text-red-600"}`}>
                          {run.message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => dispatch(fetchGatewaySyncRuns(syncRunsTarget.id))}
                className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <RefreshCwIcon className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={() => {
                  setSyncRunsTarget(null);
                  dispatch(clearGatewaySyncRuns());
                }}
                className="px-5 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
