import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { gatewaysApi } from "../../API/apiClient";

export const fetchGateways = createAsyncThunk(
  "gateways/fetchGateways",
  async (_, { rejectWithValue }) => {
    try {
      const data = await gatewaysApi.list();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return rejectWithValue(error.message || "Failed to load gateways");
    }
  },
);

export const createGateway = createAsyncThunk(
  "gateways/createGateway",
  async (payload, { rejectWithValue }) => {
    try {
      return await gatewaysApi.create(payload);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create gateway");
    }
  },
);

export const toggleGateway = createAsyncThunk(
  "gateways/toggleGateway",
  async (id, { rejectWithValue }) => {
    try {
      const updated = await gatewaysApi.toggle(id);
      return { id, updated };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to toggle gateway");
    }
  },
);

export const validateGateway = createAsyncThunk(
  "gateways/validateGateway",
  async (id, { rejectWithValue }) => {
    try {
      const result = await gatewaysApi.validate(id);
      return { id, result };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to validate gateway");
    }
  },
);

export const syncGatewayTransactions = createAsyncThunk(
  "gateways/syncGatewayTransactions",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const result = await gatewaysApi.syncTransactions(id, payload);
      return { id, result };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to sync gateway transactions");
    }
  },
);

export const deleteGateway = createAsyncThunk(
  "gateways/deleteGateway",
  async (id, { rejectWithValue }) => {
    try {
      await gatewaysApi.remove(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete gateway");
    }
  },
);

const gatewaysSlice = createSlice({
  name: "gateways",
  initialState: {
    items: [],
    loading: false,
    error: null,
    saving: false,
    formError: null,
    togglingId: null,
    deletingId: null,
    validatingId: null,
    syncingId: null,
  },
  reducers: {
    clearGatewaysError(state) {
      state.error = null;
    },
    clearGatewayFormError(state) {
      state.formError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGateways.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGateways.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchGateways.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load gateways";
      })
      .addCase(createGateway.pending, (state) => {
        state.saving = true;
        state.formError = null;
      })
      .addCase(createGateway.fulfilled, (state, action) => {
        state.saving = false;
        state.items.unshift(action.payload);
      })
      .addCase(createGateway.rejected, (state, action) => {
        state.saving = false;
        state.formError = action.payload || "Failed to create gateway";
      })
      .addCase(toggleGateway.pending, (state, action) => {
        state.togglingId = action.meta.arg;
        state.error = null;
      })
      .addCase(toggleGateway.fulfilled, (state, action) => {
        state.togglingId = null;
        const gateway = action.payload.updated ?? {};
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? { ...item, ...gateway } : item,
        );
      })
      .addCase(toggleGateway.rejected, (state, action) => {
        state.togglingId = null;
        state.error = action.payload || "Failed to toggle gateway";
      })
      .addCase(validateGateway.pending, (state, action) => {
        state.validatingId = action.meta.arg;
        state.error = null;
      })
      .addCase(validateGateway.fulfilled, (state, action) => {
        state.validatingId = null;
        state.items = state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, validationMessage: action.payload.result?.message ?? "Gateway validated successfully." }
            : item,
        );
      })
      .addCase(validateGateway.rejected, (state, action) => {
        state.validatingId = null;
        state.error = action.payload || "Failed to validate gateway";
      })
      .addCase(syncGatewayTransactions.pending, (state, action) => {
        state.syncingId = action.meta.arg.id;
        state.error = null;
      })
      .addCase(syncGatewayTransactions.fulfilled, (state, action) => {
        state.syncingId = null;
        state.items = state.items.map((item) =>
          item.id === action.payload.id
            ? {
                ...item,
                transactionCount: (item.transactionCount ?? 0) + (action.payload.result?.imported ?? 0),
                lastSyncedAt: new Date().toISOString(),
                lastSyncStatus: "SUCCESS",
                lastSyncMessage: action.payload.result?.message ?? "Sync completed successfully.",
              }
            : item,
        );
      })
      .addCase(syncGatewayTransactions.rejected, (state, action) => {
        state.syncingId = null;
        state.error = action.payload || "Failed to sync gateway transactions";
      })
      .addCase(deleteGateway.pending, (state, action) => {
        state.deletingId = action.meta.arg;
        state.error = null;
      })
      .addCase(deleteGateway.fulfilled, (state, action) => {
        state.deletingId = null;
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteGateway.rejected, (state, action) => {
        state.deletingId = null;
        state.error = action.payload || "Failed to delete gateway";
      });
  },
});

export default gatewaysSlice.reducer;
export const { clearGatewaysError, clearGatewayFormError } = gatewaysSlice.actions;

export const selectGateways = (state) => state.gateways.items;
export const selectGatewaysLoading = (state) => state.gateways.loading;
export const selectGatewaysError = (state) => state.gateways.error;
export const selectGatewaySaving = (state) => state.gateways.saving;
export const selectGatewayFormError = (state) => state.gateways.formError;
export const selectGatewayTogglingId = (state) => state.gateways.togglingId;
export const selectGatewayDeletingId = (state) => state.gateways.deletingId;
export const selectGatewayValidatingId = (state) => state.gateways.validatingId;
export const selectGatewaySyncingId = (state) => state.gateways.syncingId;
