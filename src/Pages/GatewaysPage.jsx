import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  RefreshCwIcon,
  PlusIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  Trash2Icon,
  PowerIcon,
  XIcon,
  Loader2Icon,
} from "lucide-react";
import { AppLayout } from "../Components/AppLayout";
import { LoadingSkeleton } from "../Components/LoadingSkeleton";
import {
  clearGatewayFormError,
  createGateway,
  fetchGateways,
  selectGatewayDeletingId,
  selectGatewayFormError,
  selectGatewaySaving,
  selectGatewaySyncingId,
  selectGatewayTogglingId,
  selectGatewayValidatingId,
  selectGateways,
  selectGatewaysError,
  selectGatewaysLoading,
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
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [localFormError, setLocalFormError] = useState("");
  const [syncTarget, setSyncTarget] = useState(null);
  const [syncForm, setSyncForm] = useState(EMPTY_SYNC_FORM);

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

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto">
        {error && (
          <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-6">
            <p className="text-sm font-bold text-red-600">{error}</p>
            <button onClick={() => dispatch(fetchGateways())} className="text-sm font-bold text-red-600 underline">Retry</button>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
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
                        <h3 className="font-bold text-[#1A1A1A] text-lg">{gateway.name}</h3>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#1A1A1A]">Add Payment Gateway</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-[#1A1A1A] rounded-xl hover:bg-gray-100 transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {localFormError && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm font-bold text-red-600">
                  {localFormError}
                </div>
              )}
              {formError && !localFormError && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm font-bold text-red-600">{formError}</div>
              )}

              <div className="grid grid-cols-2 gap-4">
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-[#1A1A1A]">Sync Transactions</h3>
                <p className="text-sm text-gray-500 font-medium">Pull transactions from {syncTarget.name}. Leave dates empty to sync the default provider range.</p>
              </div>
              <button onClick={() => setSyncTarget(null)} className="p-2 text-gray-400 hover:text-[#1A1A1A] rounded-xl hover:bg-gray-100 transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
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
    </AppLayout>
  );
}
