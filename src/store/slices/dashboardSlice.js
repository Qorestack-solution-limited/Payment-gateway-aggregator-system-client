import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { dashboardApi } from "../../API/apiClient";

export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchDashboardData",
  async (_, { rejectWithValue }) => {
    try {
      const [overview, chart] = await Promise.all([
        dashboardApi.overview(),
        dashboardApi.revenueChart(),
      ]);
      return { overview, chart: Array.isArray(chart) ? chart : [] };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to load dashboard");
    }
  },
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    overview: null,
    chart: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearDashboardError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.overview = action.payload.overview;
        state.chart = action.payload.chart;
        state.error = null;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load dashboard";
      });
  },
});

export default dashboardSlice.reducer;
export const { clearDashboardError } = dashboardSlice.actions;

export const selectDashboardOverview = (state) => state.dashboard.overview;
export const selectDashboardChart = (state) => state.dashboard.chart;
export const selectDashboardLoading = (state) => state.dashboard.loading;
export const selectDashboardError = (state) => state.dashboard.error;
