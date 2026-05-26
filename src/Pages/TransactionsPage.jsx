import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FilterIcon,
  SearchIcon,
  MoreHorizontalIcon,
  CheckCircle2Icon,
  XCircleIcon,
  ClockIcon,
  RefreshCwIcon,
  EyeIcon,
  XIcon,
  Loader2Icon,
  ArrowRightIcon,
  CopyIcon,
  CheckIcon,
  PlusIcon,
} from "lucide-react";
import { AppLayout } from "../Components/AppLayout";
import { LoadingSkeleton } from "../Components/LoadingSkeleton";
import {
  clearCreateTransactionError,
  clearTransactionsFilters,
  closeTransactionDrawer,
  createTransaction,
  fetchTransactionDetail,
  fetchTransactions,
  openTransactionDrawer,
  selectCreateTransactionError,
  selectSelectedTransaction,
  selectSelectedTransactionError,
  selectSelectedTransactionId,
  selectSelectedTransactionLoading,
  selectTransactionCreating,
  selectTransactionStatusUpdating,
  selectTransactionVerifyingId,
  selectTransactions,
  selectTransactionsError,
  selectTransactionsFilters,
  selectTransactionsLoading,
  selectTransactionsMeta,
  selectTransactionsPage,
  setTransactionsFilter,
  setTransactionsPage,
  updateTransactionStatus,
  verifyTransaction,
} from "../store/slices/transactionsSlice";
import { fetchGateways, selectGateways } from "../store/slices/gatewaysSlice";

const fmt = (n) =>
  `NGN ${Number(n).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const STATUS_STYLES = {
  SUCCESS: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  PENDING: "bg-amber-100 text-amber-700",
  REFUNDED: "bg-blue-100 text-blue-700",
};

const PROVIDER_OPTIONS = ["", "PAYSTACK", "FLUTTERWAVE", "STRIPE", "PAYPAL", "ADYEN", "SQUARE", "OTHER"];

const EMPTY_PAYMENT_FORM = {
  gatewayId: "",
  amount: "",
  currency: "NGN",
  customerName: "",
  customerEmail: "",
  description: "",
};

function PaymentModal({ gateways, onClose }) {
  const dispatch = useDispatch();
  const creating = useSelector(selectTransactionCreating);
  const createError = useSelector(selectCreateTransactionError);
  const activeGateways = gateways.filter((gateway) => gateway.status === "ACTIVE");
  const [form, setForm] = useState({
    ...EMPTY_PAYMENT_FORM,
    gatewayId: activeGateways[0]?.id ?? "",
  });
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!form.gatewayId && activeGateways[0]?.id) {
      setForm((current) => ({ ...current, gatewayId: activeGateways[0].id }));
    }
  }, [activeGateways, form.gatewayId]);

  const handleChange = (key, value) => {
    setLocalError("");
    if (createError) {
      dispatch(clearCreateTransactionError());
    }
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.gatewayId || !form.amount || !form.customerName || !form.customerEmail) {
      setLocalError("Gateway, amount, customer name, and email are required.");
      return;
    }

    const result = await dispatch(
      createTransaction({
        gatewayId: form.gatewayId,
        amount: Number(form.amount),
        currency: form.currency || "NGN",
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        description: form.description || undefined,
      }),
    );

    if (createTransaction.fulfilled.match(result)) {
      onClose();
      dispatch(fetchTransactions());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-[#1A1A1A]">Create Payment</h3>
            <p className="text-sm text-gray-500 font-medium">Use one selected configured gateway for this payment.</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-[#1A1A1A] hover:bg-gray-100 rounded-xl transition-colors">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {(localError || createError) && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm font-bold text-red-600">
              {localError || createError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Gateway</label>
              <select
                value={form.gatewayId}
                onChange={(e) => handleChange("gatewayId", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] bg-white font-medium"
              >
                {activeGateways.map((gateway) => (
                  <option key={gateway.id} value={gateway.id}>
                    {gateway.name} ({gateway.provider})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Currency</label>
              <input
                type="text"
                value={form.currency}
                onChange={(e) => handleChange("currency", e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Amount</label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={form.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Customer Name</label>
              <input
                type="text"
                value={form.customerName}
                onChange={(e) => handleChange("customerName", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Customer Email</label>
              <input
                type="email"
                value={form.customerEmail}
                onChange={(e) => handleChange("customerEmail", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] font-medium"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={creating || activeGateways.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-60"
          >
            {creating ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <PlusIcon className="w-4 h-4" />}
            Create Payment
          </button>
        </div>
      </div>
    </div>
  );
}

function TransactionDrawer({ onClose }) {
  const dispatch = useDispatch();
  const tx = useSelector(selectSelectedTransaction);
  const loading = useSelector(selectSelectedTransactionLoading);
  const error = useSelector(selectSelectedTransactionError);
  const updatingStatus = useSelector(selectTransactionStatusUpdating);
  const verifyingId = useSelector(selectTransactionVerifyingId);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMarkAs = async (status) => {
    if (!tx) return;
    await dispatch(updateTransactionStatus({ id: tx.id, status }));
  };

  const handleVerify = async () => {
    if (!tx) return;
    await dispatch(verifyTransaction(tx.id));
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-[#1A1A1A]">Transaction Details</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-[#1A1A1A] hover:bg-gray-100 rounded-xl transition-colors">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          {loading ? (
            <div className="space-y-5">
              {[1, 2, 3, 4, 5].map((index) => <LoadingSkeleton key={index} className="h-14" />)}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4">
              <p className="text-sm font-bold text-red-600">{error}</p>
            </div>
          ) : tx ? (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                <p className="text-3xl font-black text-[#1A1A1A] mb-3">{fmt(tx.amount)}</p>
                <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold ${STATUS_STYLES[tx.status] ?? "bg-gray-100 text-gray-600"}`}>
                  {tx.status === "SUCCESS" && <CheckCircle2Icon className="w-4 h-4" />}
                  {tx.status === "FAILED" && <XCircleIcon className="w-4 h-4" />}
                  {tx.status === "PENDING" && <ClockIcon className="w-4 h-4" />}
                  {tx.status.charAt(0) + tx.status.slice(1).toLowerCase()}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-500 font-medium">Reference</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono text-[#1A1A1A] font-bold">{tx.reference}</code>
                  <button onClick={() => handleCopy(tx.reference)} className="p-1 text-gray-400 hover:text-[#22C55E] transition-colors">
                    {copied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <CopyIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {tx.providerReference && (
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-500 font-medium">Provider Reference</span>
                  <code className="text-sm font-mono text-[#1A1A1A] font-bold">{tx.providerReference}</code>
                </div>
              )}

              {tx.providerTransactionId && (
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-500 font-medium">Provider Transaction ID</span>
                  <code className="text-sm font-mono text-[#1A1A1A] font-bold">{tx.providerTransactionId}</code>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Customer</p>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500 font-medium">Name</span>
                  <span className="text-sm font-bold text-[#1A1A1A]">{tx.customerName}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-500 font-medium">Email</span>
                  <span className="text-sm font-bold text-[#1A1A1A]">{tx.customerEmail}</span>
                </div>
              </div>

              {tx.gateway && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Gateway</p>
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-500 font-medium">Name</span>
                    <span className="text-sm font-bold text-[#1A1A1A]">{tx.gateway.name}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-gray-500 font-medium">Provider</span>
                    <span className="text-sm font-bold text-[#1A1A1A] capitalize">{tx.gateway.provider?.toLowerCase()}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-gray-500 font-medium">Source</span>
                    <span className="text-sm font-bold text-[#1A1A1A]">
                      {tx.syncedFromProvider ? "Pulled from provider" : "Created from dashboard/API"}
                    </span>
                  </div>
                  {tx.providerStatus && (
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-500 font-medium">Provider Status</span>
                      <span className="text-sm font-bold text-[#1A1A1A] capitalize">{tx.providerStatus}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Timestamps</p>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500 font-medium">Created</span>
                  <span className="text-sm font-bold text-[#1A1A1A]">{new Date(tx.createdAt).toLocaleString()}</span>
                </div>
                {tx.updatedAt && tx.updatedAt !== tx.createdAt && (
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-gray-500 font-medium">Updated</span>
                    <span className="text-sm font-bold text-[#1A1A1A]">{new Date(tx.updatedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {tx.metadata && Object.keys(tx.metadata).length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Metadata</p>
                  <pre className="bg-gray-50 rounded-xl p-4 text-xs font-mono text-gray-600 overflow-x-auto border border-gray-100">
                    {JSON.stringify(tx.metadata, null, 2)}
                  </pre>
                </div>
              )}

              {tx.providerPayload && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Provider Payload</p>
                  <pre className="bg-gray-50 rounded-xl p-4 text-xs font-mono text-gray-600 overflow-x-auto border border-gray-100">
                    {JSON.stringify(tx.providerPayload, null, 2)}
                  </pre>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Provider Actions</p>
                <button
                  onClick={handleVerify}
                  disabled={verifyingId === tx.id}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  {verifyingId === tx.id ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <RefreshCwIcon className="w-4 h-4" />}
                  Verify With Gateway
                </button>
              </div>

              {tx.status === "PENDING" && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Actions</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleMarkAs("SUCCESS")}
                      disabled={updatingStatus}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors disabled:opacity-60"
                    >
                      {updatingStatus ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <CheckCircle2Icon className="w-4 h-4" />}
                      Mark Success
                    </button>
                    <button
                      onClick={() => handleMarkAs("FAILED")}
                      disabled={updatingStatus}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-60"
                    >
                      {updatingStatus ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <XCircleIcon className="w-4 h-4" />}
                      Mark Failed
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="px-8 py-5 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors"
          >
            Close
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}

export function TransactionsPage() {
  const dispatch = useDispatch();
  const transactions = useSelector(selectTransactions);
  const meta = useSelector(selectTransactionsMeta);
  const loading = useSelector(selectTransactionsLoading);
  const error = useSelector(selectTransactionsError);
  const filters = useSelector(selectTransactionsFilters);
  const page = useSelector(selectTransactionsPage);
  const selectedTxId = useSelector(selectSelectedTransactionId);
  const gateways = useSelector(selectGateways);
  const [showFilters, setShowFilters] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => dispatch(fetchTransactions()), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [dispatch, filters.search, filters.status, filters.gatewayId, filters.provider, filters.startDate, filters.endDate, page]);

  useEffect(() => {
    dispatch(fetchGateways());
  }, [dispatch]);

  useEffect(() => {
    if (selectedTxId) {
      dispatch(fetchTransactionDetail(selectedTxId));
    }
  }, [dispatch, selectedTxId]);

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto">
        {error && (
          <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-6">
            <p className="text-sm font-bold text-red-600">{error}</p>
            <button onClick={() => dispatch(fetchTransactions())} className="text-sm font-bold text-red-600 underline">Retry</button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID, customer, email..."
                value={filters.search}
                onChange={(e) => dispatch(setTransactionsFilter({ key: "search", value: e.target.value }))}
                className="w-72 pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] focus:border-transparent shadow-sm font-medium"
              />
            </div>
            <button
              onClick={() => setShowFilters((value) => !value)}
              className={`flex items-center gap-2 px-4 py-2.5 bg-white border rounded-xl text-sm font-bold shadow-sm transition-colors ${showFilters ? "border-[#C5E63D]" : "border-gray-200 hover:bg-gray-50"}`}
            >
              <FilterIcon className="w-4 h-4" />
              Filters
              {(filters.status || filters.gatewayId || filters.provider || filters.startDate || filters.endDate) && <span className="w-2 h-2 rounded-full bg-[#22C55E]" />}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#22C55E] text-white rounded-xl text-sm font-bold hover:bg-[#16a34a] shadow-sm transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Create Payment
            </button>
            <button
              onClick={() => dispatch(fetchTransactions())}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-gray-800 shadow-sm transition-colors"
            >
              <RefreshCwIcon className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 flex flex-wrap gap-6 items-end">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Status</label>
              <select
                value={filters.status}
                onChange={(e) => dispatch(setTransactionsFilter({ key: "status", value: e.target.value }))}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C5E63D]"
              >
                <option value="">All statuses</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILED">Failed</option>
                <option value="PENDING">Pending</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Gateway</label>
              <select
                value={filters.gatewayId}
                onChange={(e) => dispatch(setTransactionsFilter({ key: "gatewayId", value: e.target.value }))}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C5E63D]"
              >
                <option value="">All gateways</option>
                {gateways.map((gateway) => (
                  <option key={gateway.id} value={gateway.id}>
                    {gateway.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Provider</label>
              <select
                value={filters.provider}
                onChange={(e) => dispatch(setTransactionsFilter({ key: "provider", value: e.target.value }))}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C5E63D]"
              >
                {PROVIDER_OPTIONS.map((provider) => (
                  <option key={provider || "all"} value={provider}>
                    {provider || "All providers"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">From</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => dispatch(setTransactionsFilter({ key: "startDate", value: e.target.value }))}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C5E63D]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">To</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => dispatch(setTransactionsFilter({ key: "endDate", value: e.target.value }))}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C5E63D]"
              />
            </div>
            <button
              onClick={() => dispatch(clearTransactionsFilters())}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-gray-500 hover:text-red-600 border border-gray-200 rounded-xl hover:border-red-200 hover:bg-red-50 transition-colors"
            >
              <XIcon className="w-4 h-4" /> Clear
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3, 4, 5, 6].map((index) => <LoadingSkeleton key={index} className="h-14" />)}
              </div>
            ) : transactions.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-16 font-medium">No transactions found.</p>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Transaction ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Gateway</th>
                    <th className="px-6 py-4">Source</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4 font-mono text-gray-600 font-medium text-xs">{tx.reference.slice(0, 16)}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#1A1A1A]">{tx.customerName}</div>
                        <div className="text-xs text-gray-500 font-medium">{tx.customerEmail}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-[#1A1A1A]">{fmt(tx.amount)}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-700">
                          {tx.gateway?.name ?? "-"}
                        </span>
                        <p className="text-[11px] text-gray-400 font-medium mt-1">{tx.gateway?.provider ?? "-"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${tx.syncedFromProvider ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}>
                          {tx.syncedFromProvider ? "Synced" : "Created"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[tx.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {tx.status === "SUCCESS" && <CheckCircle2Icon className="w-3.5 h-3.5" />}
                          {tx.status === "FAILED" && <XCircleIcon className="w-3.5 h-3.5" />}
                          {tx.status === "PENDING" && <ClockIcon className="w-3.5 h-3.5" />}
                          {tx.status.charAt(0) + tx.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-medium text-xs">{new Date(tx.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => dispatch(openTransactionDrawer(tx.id))}
                            className="p-2 text-gray-400 hover:text-[#22C55E] hover:bg-green-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-[#1A1A1A] hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreHorizontalIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {!loading && transactions.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500 font-medium">
                Showing <span className="font-bold text-[#1A1A1A]">{(meta.page - 1) * meta.limit + 1}</span>-<span className="font-bold text-[#1A1A1A]">{Math.min(meta.page * meta.limit, meta.total)}</span> of <span className="font-bold text-[#1A1A1A]">{meta.total.toLocaleString()}</span> results
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => dispatch(setTransactionsPage(meta.page - 1))}
                  disabled={meta.page <= 1}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 font-bold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => dispatch(setTransactionsPage(meta.page + 1))}
                  disabled={meta.page >= meta.totalPages}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 font-bold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedTxId && (
        <TransactionDrawer onClose={() => dispatch(closeTransactionDrawer())} />
      )}

      {showPaymentModal && (
        <PaymentModal
          gateways={gateways}
          onClose={() => {
            dispatch(clearCreateTransactionError());
            setShowPaymentModal(false);
          }}
        />
      )}
    </AppLayout>
  );
}
