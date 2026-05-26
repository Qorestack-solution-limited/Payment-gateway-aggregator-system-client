import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { analyticsApi } from "../../API/apiClient";

function normalizeSummary(summary, breakdown) {
  if (!summary) return null;

  if ("totalRevenue" in summary || "totalTransactions" in summary || "activeGateways" in summary) {
    return summary;
  }

  return {
    totalRevenue: summary.revenue?.value ?? 0,
    totalTransactions: summary.transactions?.value ?? 0,
    successRate: summary.successRate?.value ?? 0,
    activeGateways: Array.isArray(breakdown) ? breakdown.length : 0,
    raw: summary,
  };
}

function normalizeKpis(kpis, summary) {
  if (!kpis) return null;

  return {
    avgTransactionValue: kpis.avgTransactionValue ?? 0,
    avgTransactionValueChange: kpis.avgTransactionValueChange ?? summary?.transactions?.change ?? 0,
    refundRate: kpis.refundRate ?? 0,
    refundRateChange: kpis.refundRateChange ?? 0,
    successRate: kpis.successRate ?? summary?.successRate?.value ?? kpis.authorizationRate ?? 0,
    successRateChange: kpis.successRateChange ?? summary?.successRate?.change ?? 0,
    authorizationRate: kpis.authorizationRate ?? 0,
    authorizationRateChange: kpis.authorizationRateChange ?? summary?.transactions?.change ?? 0,
  };
}

export const fetchAnalyticsData = createAsyncThunk(
  "analytics/fetchAnalyticsData",
  async (_, { getState, rejectWithValue }) => {
    try {
      const days = getState().analytics.days;
      const [rawSummary, chart, breakdown, rawKpis] = await Promise.all([
        analyticsApi.summary(days),
        analyticsApi.revenueChart(days),
        analyticsApi.gatewayBreakdown(days),
        analyticsApi.kpis(days),
      ]);

      return {
        days,
        summary: normalizeSummary(rawSummary, breakdown),
        chart: Array.isArray(chart) ? chart : [],
        breakdown: Array.isArray(breakdown) ? breakdown : [],
        kpis: normalizeKpis(rawKpis, rawSummary),
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to load analytics");
    }
  },
);

const analyticsSlice = createSlice({
  name: "analytics",
  initialState: {
    days: 30,
    summary: null,
    chart: [],
    breakdown: [],
    kpis: null,
    loading: false,
    error: null,
  },
  reducers: {
    setAnalyticsDays(state, action) {
      state.days = action.payload;
    },
    clearAnalyticsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalyticsData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalyticsData.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload.summary;
        state.chart = action.payload.chart;
        state.breakdown = action.payload.breakdown;
        state.kpis = action.payload.kpis;
      })
      .addCase(fetchAnalyticsData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load analytics";
      });
  },
});

export default analyticsSlice.reducer;
export const { setAnalyticsDays, clearAnalyticsError } = analyticsSlice.actions;

export const selectAnalyticsDays = (state) => state.analytics.days;
export const selectAnalyticsSummary = (state) => state.analytics.summary;
export const selectAnalyticsChart = (state) => state.analytics.chart;
export const selectAnalyticsBreakdown = (state) => state.analytics.breakdown;
export const selectAnalyticsKpis = (state) => state.analytics.kpis;
export const selectAnalyticsLoading = (state) => state.analytics.loading;
export const selectAnalyticsError = (state) => state.analytics.error;
