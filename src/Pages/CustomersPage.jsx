import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  SearchIcon, UsersIcon, ArrowUpRightIcon, Loader2Icon,
  CheckCircle2Icon, XCircleIcon, ClockIcon, XIcon,
} from "lucide-react";
import { AppLayout } from "../Components/AppLayout";
import { LoadingSkeleton } from "../Components/LoadingSkeleton";
import { customersApi } from "../API/apiClient";

const fmt = (n) =>
  `₦${Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const STATUS_STYLES = {
  SUCCESS:  "bg-green-100 text-green-700",
  FAILED:   "bg-red-100 text-red-700",
  PENDING:  "bg-amber-100 text-amber-700",
  REFUNDED: "bg-blue-100 text-blue-700",
};

function CustomerDrawer({ email, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    customersApi.getOne(email)
      .then(setData)
      .catch((err) => setError(err.message || "Failed to load customer"))
      .finally(() => setLoading(false));
  }, [email]);

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full sm:max-w-lg bg-white z-50 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 sm:px-8 py-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-[#1A1A1A]">Customer Profile</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-[#1A1A1A] hover:bg-gray-100 rounded-xl transition-colors">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => <LoadingSkeleton key={i} className="h-12" />)}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-sm font-bold text-red-600">{error}</p>
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* Profile card */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#C5E63D]/20 flex items-center justify-center text-[#1A1A1A] font-black text-lg border border-[#C5E63D]/30">
                    {data.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <p className="font-bold text-[#1A1A1A]">{data.name}</p>
                    <p className="text-sm text-gray-500">{data.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-xl p-3 border border-gray-100">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-0.5">Total Spend</p>
                    <p className="text-base font-black text-[#1A1A1A] truncate">{fmt(data.totalSpend)}</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-gray-100">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-0.5">Transactions</p>
                    <p className="text-base font-black text-[#1A1A1A]">{data.totalTransactions}</p>
                  </div>
                </div>
              </div>

              {/* Transaction history */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Transaction History</p>
                {data.transactions?.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No transactions yet.</p>
                ) : (
                  <div className="space-y-2">
                    {data.transactions?.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between py-3 px-4 bg-white rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                        <div className="min-w-0">
                          <p className="font-mono text-xs text-gray-400 mb-0.5 truncate">{tx.reference.slice(0, 14)}</p>
                          <p className="text-xs text-gray-500">{tx.gateway?.name ?? "—"}</p>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <p className="text-sm font-bold text-[#1A1A1A]">{fmt(tx.amount)}</p>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${STATUS_STYLES[tx.status] ?? "bg-gray-100 text-gray-600"}`}>
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

export function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const debounceRef = useRef(null);

  const fetchCustomers = useCallback(async (q = "") => {
    setLoading(true);
    setError(null);
    try {
      const data = await customersApi.list(q || undefined);
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearch(q);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchCustomers(q), 350);
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#1A1A1A]">Customers</h2>
            <p className="text-sm text-gray-500 font-medium">
              {loading ? "Loading…" : `${customers.length} unique customer${customers.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search by name or email…"
              className="w-full sm:w-72 pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] shadow-sm font-medium"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
            <p className="text-sm font-bold text-red-600">{error}</p>
            <button onClick={() => fetchCustomers(search)} className="text-sm font-bold text-red-600 underline">Retry</button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 space-y-4">
                {[...Array(6)].map((_, i) => <LoadingSkeleton key={i} className="h-14" />)}
              </div>
            ) : customers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <UsersIcon className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">No customers found</p>
                <p className="text-xs mt-1">Customers appear here once they make a transaction.</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left min-w-[520px]">
                <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-4 sm:px-6 py-3">Customer</th>
                    <th className="px-4 sm:px-6 py-3">Total Spend</th>
                    <th className="px-4 sm:px-6 py-3">Transactions</th>
                    <th className="px-4 sm:px-6 py-3 hidden sm:table-cell">Status Breakdown</th>
                    <th className="px-4 sm:px-6 py-3 hidden md:table-cell">Last Seen</th>
                    <th className="px-4 sm:px-6 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customers.map((c) => (
                    <tr key={c.email} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#C5E63D]/20 flex items-center justify-center text-[#1A1A1A] font-black text-sm border border-[#C5E63D]/30 shrink-0">
                            {c.name?.[0]?.toUpperCase() ?? "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[#1A1A1A] truncate">{c.name}</p>
                            <p className="text-xs text-gray-400 font-medium truncate">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 font-bold text-[#1A1A1A] whitespace-nowrap">{fmt(c.totalSpend)}</td>
                      <td className="px-4 sm:px-6 py-4 font-bold text-[#1A1A1A]">{c.totalTransactions}</td>
                      <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {c.success > 0 && (
                            <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                              <CheckCircle2Icon className="w-3 h-3" />{c.success}
                            </span>
                          )}
                          {c.failed > 0 && (
                            <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                              <XCircleIcon className="w-3 h-3" />{c.failed}
                            </span>
                          )}
                          {c.pending > 0 && (
                            <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                              <ClockIcon className="w-3 h-3" />{c.pending}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-gray-400 font-medium text-xs hidden md:table-cell whitespace-nowrap">
                        {c.lastSeen ? new Date(c.lastSeen).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedEmail(c.email)}
                          className="p-2 text-gray-400 hover:text-[#22C55E] hover:bg-green-50 rounded-lg transition-colors"
                          title="View profile">
                          <ArrowUpRightIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {selectedEmail && (
        <CustomerDrawer email={selectedEmail} onClose={() => setSelectedEmail(null)} />
      )}
    </AppLayout>
  );
}
