import { useEffect, useCallback, useRef, useState } from "react";
import {
  ArrowUpRightIcon, ArrowDownRightIcon, CreditCardIcon, UsersIcon,
  ActivityIcon, MoreHorizontalIcon, CheckCircle2Icon, XCircleIcon, ClockIcon,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppLayout } from "../Components/AppLayout";
import { LoadingSkeleton } from "../Components/LoadingSkeleton";
import { Link } from "react-router-dom";
import {
  fetchDashboardData,
  selectDashboardChart,
  selectDashboardError,
  selectDashboardLoading,
  selectDashboardOverview,
} from "../store/slices/dashboardSlice";

const fmt = (n) =>
  `₦${Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const STATUS_STYLES = {
  SUCCESS:  "bg-green-100 text-green-700",
  FAILED:   "bg-red-100 text-red-700",
  PENDING:  "bg-amber-100 text-amber-700",
  REFUNDED: "bg-blue-100 text-blue-700",
};

const fmtCurrency = (n) =>
  `₦${Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function DashboardPage() {
  const dispatch = useDispatch();
  const overview = useSelector(selectDashboardOverview);
  const chart    = useSelector(selectDashboardChart);
  const loading  = useSelector(selectDashboardLoading);
  const error    = useSelector(selectDashboardError);

  const [liveIndicator, setLiveIndicator] = useState(false);
  const sseRef = useRef(null);
  const flashRef = useRef(null);

  const load = useCallback(() => { dispatch(fetchDashboardData()); }, [dispatch]);
  useEffect(() => { load(); }, [load]);

  // SSE: subscribe to real-time transaction events
  useEffect(() => {
    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
    const token = localStorage.getItem("payToken");
    if (!token) return;

    const url = `${BASE_URL}/dashboard/events`;
    const es = new EventSource(`${url}?token=${token}`);
    sseRef.current = es;

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);
        if (event?.type === "transaction.created" || event?.type === "transaction.updated") {
          // Flash live indicator, then refresh dashboard data
          setLiveIndicator(true);
          clearTimeout(flashRef.current);
          flashRef.current = setTimeout(() => setLiveIndicator(false), 3000);
          dispatch(fetchDashboardData());
        }
      } catch { /* ignore parse errors */ }
    };

    es.onerror = () => {
      es.close();
    };

    return () => {
      es.close();
      clearTimeout(flashRef.current);
    };
  }, [dispatch]);

  const stats     = overview?.stats;
  const gateways  = overview?.gatewayPerformance ?? [];
  const recentTxs = overview?.recentTransactions ?? [];
  const maxRevenue = chart.length ? Math.max(...chart.map((d) => d.revenue)) : 1;

  const statCards = [
    { label: "Total Revenue",    value: stats ? fmtCurrency(stats.revenue.value) : null,                       change: stats?.revenue.change,        icon: CreditCardIcon,   color: "lime" },
    { label: "Transactions",     value: stats ? stats.transactions.value.toLocaleString() : null,              change: stats?.transactions.change,    icon: ActivityIcon,     color: "green" },
    { label: "Success Rate",     value: stats ? `${stats.successRate.value}%` : null,                          change: stats?.successRate.change,     icon: CheckCircle2Icon, color: "blue" },
    { label: "Active Customers", value: stats ? stats.activeCustomers.value.toLocaleString() : null,           change: stats?.activeCustomers.change, icon: UsersIcon,        color: "orange" },
  ];

  const colorMap = {
    lime:   "bg-[#C5E63D]/20 text-[#1A1A1A]",
    green:  "bg-green-100 text-green-600",
    blue:   "bg-blue-100 text-blue-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">

        {/* Live indicator */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#1A1A1A]">Overview</h2>
            <p className="text-sm text-gray-500 font-medium">Your payment operations at a glance</p>
          </div>
          <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${liveIndicator ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
            <span className={`w-2 h-2 rounded-full ${liveIndicator ? "bg-green-500 animate-pulse" : "bg-gray-300"}`} />
            {liveIndicator ? "Live update" : "Live"}
          </div>
        </div>

        {error && (
          <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-sm font-bold text-red-600">{error}</p>
            <button onClick={load} className="text-sm font-bold text-red-600 underline">Retry</button>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {statCards.map((stat, i) => (
            <div key={i} className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className={`p-2 sm:p-3 rounded-xl ${colorMap[stat.color]}`}>
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <button className="text-gray-400 hover:text-[#1A1A1A]">
                  <MoreHorizontalIcon className="w-4 h-4" />
                </button>
              </div>
              {loading || !stat.value ? (
                <>
                  <LoadingSkeleton className="h-7 w-24 mb-2" />
                  <LoadingSkeleton className="h-3 w-16" />
                </>
              ) : (
                <>
                  <h3 className="text-xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight mb-2 truncate">{stat.value}</h3>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${stat.change >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {stat.change >= 0 ? <ArrowUpRightIcon className="w-3 h-3 mr-0.5" /> : <ArrowDownRightIcon className="w-3 h-3 mr-0.5" />}
                      {Math.abs(stat.change).toFixed(1)}%
                    </span>
                    <span className="text-xs text-gray-500 font-medium hidden sm:inline">vs last period</span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-1">{stat.label}</p>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white p-5 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#1A1A1A]">Revenue Overview</h3>
                <p className="text-sm text-gray-500">Daily revenue — last 30 days</p>
              </div>
            </div>
            {loading ? (
              <LoadingSkeleton className="h-48 sm:h-64" />
            ) : chart.length === 0 ? (
              <div className="h-48 sm:h-64 flex items-center justify-center text-gray-400 text-sm font-medium">No revenue data yet</div>
            ) : (
              <>
                <div className="h-48 sm:h-64 flex items-end justify-between gap-1 px-1">
                  {chart.map((d, i) => {
                    const h = maxRevenue > 0 ? Math.max((d.revenue / maxRevenue) * 95, 4) : 4;
                    return (
                      <div key={i} className="flex-1 relative group cursor-pointer" style={{ height: "100%" }}>
                        <div className="absolute bottom-0 w-full flex flex-col justify-end h-full">
                          <div className="w-full bg-green-50 hover:bg-green-100 rounded-t-lg transition-colors relative" style={{ height: `${h}%` }}>
                            <div className="absolute bottom-0 w-full bg-[#22C55E] rounded-t-lg group-hover:bg-[#16a34a] transition-colors" style={{ height: "60%" }} />
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white text-xs font-bold py-1.5 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-xl pointer-events-none">
                              {fmtCurrency(d.revenue)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-3 text-xs font-medium text-gray-400 px-1">
                  <span>{chart[0]?.date?.slice(5)}</span>
                  <span>{chart[Math.floor(chart.length / 2)]?.date?.slice(5)}</span>
                  <span>{chart[chart.length - 1]?.date?.slice(5)}</span>
                </div>
              </>
            )}
          </div>

          {/* Gateway Performance */}
          <div className="bg-white p-5 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-base sm:text-lg font-bold text-[#1A1A1A] mb-6">Gateway Performance</h3>
            {loading ? (
              <div className="space-y-5">
                {[1, 2, 3].map((i) => <LoadingSkeleton key={i} className="h-10" />)}
              </div>
            ) : gateways.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No gateways connected yet.</p>
            ) : (
              <div className="space-y-5">
                {gateways.map((gw, i) => {
                  const maxVol = Math.max(...gateways.map((g) => g.volume), 1);
                  const pct    = Math.round((gw.volume / maxVol) * 100);
                  const colors = ["bg-[#1A1A1A]", "bg-blue-600", "bg-[#22C55E]", "bg-gray-400"];
                  return (
                    <div key={gw.id}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-bold text-[#1A1A1A] truncate mr-2">{gw.name}</span>
                        <span className="font-bold text-[#1A1A1A] shrink-0">{fmt(gw.volume)}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                        <div className={`h-2 rounded-full ${colors[i % colors.length]}`} style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-xs text-gray-500 font-medium text-right">{gw.count} txns</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-base sm:text-lg font-bold text-[#1A1A1A]">Recent Transactions</h3>
            <Link to="/transactions" className="text-sm text-[#22C55E] hover:text-[#16a34a] font-bold">View All</Link>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => <LoadingSkeleton key={i} className="h-12" />)}
              </div>
            ) : recentTxs.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-12">No transactions yet.</p>
            ) : (
              <table className="w-full text-sm text-left min-w-[480px]">
                <thead className="bg-gray-50 text-gray-500 font-semibold">
                  <tr>
                    <th className="px-4 sm:px-6 py-3">Transaction ID</th>
                    <th className="px-4 sm:px-6 py-3">Customer</th>
                    <th className="px-4 sm:px-6 py-3">Amount</th>
                    <th className="px-4 sm:px-6 py-3 hidden sm:table-cell">Gateway</th>
                    <th className="px-4 sm:px-6 py-3">Status</th>
                    <th className="px-4 sm:px-6 py-3 hidden md:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentTxs.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 sm:px-6 py-3 font-mono text-gray-600 font-medium text-xs">{tx.reference.slice(0, 10)}</td>
                      <td className="px-4 sm:px-6 py-3">
                        <p className="font-bold text-[#1A1A1A] truncate max-w-[100px] sm:max-w-none">{tx.customerName}</p>
                        <p className="text-xs text-gray-500 hidden sm:block">{tx.customerEmail}</p>
                      </td>
                      <td className="px-4 sm:px-6 py-3 font-bold text-[#1A1A1A] whitespace-nowrap">{fmt(tx.amount)}</td>
                      <td className="px-4 sm:px-6 py-3 text-gray-600 font-medium hidden sm:table-cell">{tx.gateway?.name ?? "—"}</td>
                      <td className="px-4 sm:px-6 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[tx.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {tx.status === "SUCCESS"  && <CheckCircle2Icon className="w-3 h-3" />}
                          {tx.status === "FAILED"   && <XCircleIcon       className="w-3 h-3" />}
                          {tx.status === "PENDING"  && <ClockIcon          className="w-3 h-3" />}
                          <span className="hidden sm:inline">{tx.status.charAt(0) + tx.status.slice(1).toLowerCase()}</span>
                          <span className="sm:hidden">{tx.status.slice(0, 3)}</span>
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-gray-500 font-medium text-xs hidden md:table-cell whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
