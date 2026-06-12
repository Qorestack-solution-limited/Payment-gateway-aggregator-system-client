import { useState, useEffect, useCallback } from "react";
import { Loader2Icon, BanknoteIcon, CheckCircle2Icon, ClockIcon, AlertTriangleIcon, RefreshCwIcon } from "lucide-react";
import { AppLayout } from "../Components/AppLayout";
import { LoadingSkeleton } from "../Components/LoadingSkeleton";
import { api } from "../API/apiClient";

const STATUS_STYLES = {
  COMPLETED:  "bg-green-100 text-green-700",
  PENDING:    "bg-amber-100 text-amber-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  FAILED:     "bg-red-100 text-red-700",
};

const STATUS_ICONS = {
  COMPLETED:  CheckCircle2Icon,
  PENDING:    ClockIcon,
  PROCESSING: Loader2Icon,
  FAILED:     AlertTriangleIcon,
};

const fmt = (n, c = "NGN") =>
  `${c} ${Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

export function SettlementsPage() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterGateway, setFilterGateway] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const qs = new URLSearchParams({ page, limit: 20 });
      if (filterGateway) qs.set("gatewayId", filterGateway);
      if (filterStatus) qs.set("status", filterStatus);

      const [settData, sumData, gwData] = await Promise.all([
        api.get(`/settlements?${qs}`),
        api.get("/settlements/summary"),
        api.get("/gateways"),
      ]);

      setData(settData?.data ?? []);
      setMeta(settData?.meta ?? { total: 0, totalPages: 1 });
      setSummary(sumData);
      setGateways(Array.isArray(gwData) ? gwData : []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [page, filterGateway, filterStatus]);

  useEffect(() => { load(); }, [load]);

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#1A1A1A]">Settlements</h2>
            <p className="text-sm text-gray-500 font-medium">Track funds settled to your bank account by each gateway</p>
          </div>
          <button onClick={load} disabled={loading} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 disabled:opacity-60 transition-colors">
            <RefreshCwIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm font-bold text-red-600">{error}</div>}

        {/* Summary cards */}
        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Settled", value: fmt(summary.totalAmount), color: "text-[#1A1A1A]" },
              { label: "Pending", value: fmt(summary.pendingAmount), sub: `${summary.pendingCount} settlement${summary.pendingCount !== 1 ? "s" : ""}`, color: "text-amber-600" },
              { label: "Completed", value: fmt(summary.completedAmount), sub: `${summary.completedCount} settlement${summary.completedCount !== 1 ? "s" : ""}`, color: "text-green-600" },
              { label: "Gateways", value: String(gateways.filter((g) => g.status === "ACTIVE").length), sub: "active", color: "text-[#1A1A1A]" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-1">{s.label}</p>
                <p className={`text-lg sm:text-xl font-black truncate ${s.color}`}>{s.value}</p>
                {s.sub && <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select value={filterGateway} onChange={(e) => { setFilterGateway(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C5E63D]">
            <option value="">All gateways</option>
            {gateways.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C5E63D]">
            <option value="">All statuses</option>
            {["PENDING","PROCESSING","COMPLETED","FAILED"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 space-y-4">
                {[1,2,3,4,5].map((i) => <LoadingSkeleton key={i} className="h-14" />)}
              </div>
            ) : data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <BanknoteIcon className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">No settlements found</p>
                <p className="text-xs mt-1">Settlements are synced automatically from Paystack every hour.</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left min-w-[540px]">
                <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-4 sm:px-6 py-3">Settlement ID</th>
                    <th className="px-4 sm:px-6 py-3">Amount</th>
                    <th className="px-4 sm:px-6 py-3">Gateway</th>
                    <th className="px-4 sm:px-6 py-3">Status</th>
                    <th className="px-4 sm:px-6 py-3 hidden md:table-cell">Expected</th>
                    <th className="px-4 sm:px-6 py-3 hidden lg:table-cell">Bank Account</th>
                    <th className="px-4 sm:px-6 py-3 hidden sm:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.map((s) => {
                    const Icon = STATUS_ICONS[s.status] ?? ClockIcon;
                    return (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 sm:px-6 py-4 font-mono text-xs text-gray-500 truncate max-w-[100px]">
                          {s.providerSettlementId ?? s.id.slice(0, 10)}
                        </td>
                        <td className="px-4 sm:px-6 py-4 font-black text-[#1A1A1A] whitespace-nowrap">{fmt(s.amount, s.currency)}</td>
                        <td className="px-4 sm:px-6 py-4 font-medium text-gray-600">{s.gateway?.name ?? "—"}</td>
                        <td className="px-4 sm:px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[s.status] ?? "bg-gray-100 text-gray-600"}`}>
                            <Icon className="w-3 h-3" />
                            {s.status}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-xs text-gray-400 hidden md:table-cell whitespace-nowrap">
                          {s.expectedAt ? new Date(s.expectedAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-xs text-gray-400 hidden lg:table-cell truncate max-w-[160px]">
                          {s.bankAccount ?? "—"}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-xs text-gray-400 hidden sm:table-cell whitespace-nowrap">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {!loading && meta.totalPages > 1 && (
            <div className="px-4 sm:px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Page <span className="font-bold">{meta.page ?? page}</span> of <span className="font-bold">{meta.totalPages}</span> · {meta.total} total
              </p>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors">Previous</button>
                <button disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
