import { useEffect, useCallback } from "react";
import { CalendarIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppLayout } from "../Components/AppLayout";
import { LoadingSkeleton } from "../Components/LoadingSkeleton";
import {
  fetchAnalyticsData,
  selectAnalyticsBreakdown,
  selectAnalyticsChart,
  selectAnalyticsDays,
  selectAnalyticsError,
  selectAnalyticsKpis,
  selectAnalyticsLoading,
  selectAnalyticsSummary,
  setAnalyticsDays,
} from "../store/slices/analyticsSlice";

const fmt = (n) =>
  `₦${Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtShort = (n) => {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(1)}k`;
  return fmt(n);
};

const DAYS_OPTIONS = [7, 30, 90];

const GATEWAY_COLORS = ["bg-[#1A1A1A]", "bg-blue-600", "bg-[#22C55E]", "bg-orange-500", "bg-gray-400"];

const fmtCurrency = (n) =>
  `NGN ${Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtShortCurrency = (n) => {
  if (n >= 1_000_000) return `NGN ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `NGN ${(n / 1_000).toFixed(1)}k`;
  return fmtCurrency(n);
};

export function AnalyticsPage() {
  const dispatch = useDispatch();
  const days = useSelector(selectAnalyticsDays);
  const summary = useSelector(selectAnalyticsSummary);
  const chart = useSelector(selectAnalyticsChart);
  const breakdown = useSelector(selectAnalyticsBreakdown);
  const kpis = useSelector(selectAnalyticsKpis);
  const loading = useSelector(selectAnalyticsLoading);
  const error = useSelector(selectAnalyticsError);

  const load = useCallback(async () => {
    dispatch(fetchAnalyticsData());
  }, [dispatch, days]);

  useEffect(() => { load(); }, [load]);

  const maxRevenue = chart.length ? Math.max(...chart.map((d) => d.revenue ?? 0), 1) : 1;
  const maxBreakdown = breakdown.length ? Math.max(...breakdown.map((d) => d.volume ?? 0), 1) : 1;
  const totalBreakdown = breakdown.reduce((s, d) => s + (d.volume ?? 0), 0) || 1;

  const kpiTiles = kpis
    ? [
        { label: "Avg. Transaction Value", value: fmtCurrency(Number(kpis.avgTransactionValue ?? 0)), change: kpis.avgTransactionValueChange, up: Number(kpis.avgTransactionValueChange ?? 0) >= 0 },
        { label: "Refund Rate", value: `${Number(kpis.refundRate ?? 0).toFixed(2)}%`, change: kpis.refundRateChange, up: Number(kpis.refundRateChange ?? 0) <= 0 },
        { label: "Success Rate", value: `${Number(kpis.successRate ?? 0).toFixed(2)}%`, change: kpis.successRateChange, up: Number(kpis.successRateChange ?? 0) >= 0 },
        { label: "Authorization Rate", value: `${Number(kpis.authorizationRate ?? 0).toFixed(2)}%`, change: kpis.authorizationRateChange, up: Number(kpis.authorizationRateChange ?? 0) >= 0 },
      ]
    : null;

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">

        {error && (
          <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-5 py-4">
            <p className="text-sm font-bold text-red-600">{error}</p>
            <button onClick={load} className="text-sm font-bold text-red-600 underline">Retry</button>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-[#1A1A1A]">Analytics & Reports</h2>
            <p className="text-sm text-gray-500 font-medium">Deep dive into your payment performance</p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              {DAYS_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => dispatch(setAnalyticsDays(d))}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold transition-colors ${days === d ? "bg-[#C5E63D] text-[#1A1A1A]" : "text-gray-500 hover:bg-gray-50"}`}>
                  <CalendarIcon className="w-4 h-4" />
                  {d}d
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary stat strip */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map((i) => <LoadingSkeleton key={i} className="h-20" />)}
          </div>
        ) : summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Revenue", value: fmtCurrency(summary.totalRevenue ?? 0) },
              { label: "Total Transactions", value: Number(summary.totalTransactions ?? 0).toLocaleString() },
              { label: "Success Rate", value: `${Number(summary.successRate ?? 0).toFixed(1)}%` },
              { label: "Active Gateways", value: String(summary.activeGateways ?? 0) },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1">{s.label}</p>
                <p className="text-xl font-bold text-[#1A1A1A]">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Revenue Chart */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-[#1A1A1A] mb-8">Revenue Growth</h3>
          {loading ? (
            <LoadingSkeleton className="h-64" />
          ) : chart.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm font-medium">No revenue data for this period.</div>
          ) : (
            <>
              {/* SVG line chart */}
              <div className="relative h-64 w-full">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 240" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22C55E" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {(() => {
                    const pts = chart.map((d, i) => {
                      const x = (i / (chart.length - 1)) * 1000;
                      const y = 220 - ((d.revenue ?? 0) / maxRevenue) * 200;
                      return `${x},${y}`;
                    });
                    const path = `M${pts.join(" L")}`;
                    const fillPath = `${path} L1000,240 L0,240 Z`;
                    return (
                      <>
                        <path d={fillPath} fill="url(#revGrad)" />
                        <path d={path} fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </>
                    );
                  })()}
                </svg>
                {/* Y axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 font-medium pointer-events-none">
                  <span>{fmtShortCurrency(maxRevenue)}</span>
                  <span>{fmtShortCurrency(maxRevenue / 2)}</span>
                  <span>₦0</span>
                </div>
              </div>
              {/* X axis */}
              <div className="flex justify-between mt-3 text-xs font-medium text-gray-400 px-2">
                <span>{chart[0]?.date?.slice(5)}</span>
                <span>{chart[Math.floor(chart.length / 2)]?.date?.slice(5)}</span>
                <span>{chart[chart.length - 1]?.date?.slice(5)}</span>
              </div>
            </>
          )}
        </div>

        {/* Secondary metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Gateway Breakdown */}
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-8">Transaction Volume by Gateway</h3>
            {loading ? (
              <div className="space-y-5">
                {[1,2,3].map((i) => <LoadingSkeleton key={i} className="h-8" />)}
              </div>
            ) : breakdown.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No gateway data available.</p>
            ) : (
              <div className="space-y-5">
                {breakdown.map((item, i) => {
                  const pct = Math.round((item.volume / totalBreakdown) * 100);
                  return (
                    <div key={item.gatewayId ?? i} className="flex items-center gap-4">
                      <span className="w-24 text-sm font-bold text-[#1A1A1A] truncate">{item.name}</span>
                      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${GATEWAY_COLORS[i % GATEWAY_COLORS.length]} transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-12 text-sm text-gray-500 font-medium text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* KPI Tiles */}
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-8">Key Performance Indicators</h3>
            {loading ? (
              <div className="grid grid-cols-2 gap-4">
                {[1,2,3,4].map((i) => <LoadingSkeleton key={i} className="h-24" />)}
              </div>
            ) : kpiTiles ? (
              <div className="grid grid-cols-2 gap-4">
                {kpiTiles.map((kpi) => (
                  <div key={kpi.label} className="p-5 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1">{kpi.label}</p>
                    <p className="text-xl font-bold text-[#1A1A1A]">{kpi.value}</p>
                    {kpi.change !== undefined && kpi.change !== null && (
                      <span className={`text-xs font-bold flex items-center mt-2 ${kpi.up ? "text-[#22C55E]" : "text-red-500"}`}>
                        {kpi.up ? <TrendingUpIcon className="w-3 h-3 mr-1" /> : <TrendingDownIcon className="w-3 h-3 mr-1" />}
                        {kpi.change >= 0 ? "+" : ""}{Number(kpi.change).toFixed(1)}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">No KPI data available.</p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
