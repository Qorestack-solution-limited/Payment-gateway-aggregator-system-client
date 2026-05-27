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

export const fetchGatewayDetail = createAsyncThunk(
  "gateways/fetchGatewayDetail",
  async (id, { rejectWithValue }) => {
    try {
      return await gatewaysApi.get(id);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to load gateway details");
    }
  },
);

export const updateGateway = createAsyncThunk(
  "gateways/updateGateway",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const updated = await gatewaysApi.update(id, payload);
      return { id, updated };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update gateway");
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

export const fetchGatewayWebhookEvents = createAsyncThunk(
  "gateways/fetchGatewayWebhookEvents",
  async (id, { rejectWithValue }) => {
    try {
      const events = await gatewaysApi.webhookEvents(id);
      return { id, events: Array.isArray(events) ? events : [] };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to load gateway webhook events");
    }
  },
);

export const fetchGatewaySyncRuns = createAsyncThunk(
  "gateways/fetchGatewaySyncRuns",
  async (id, { rejectWithValue }) => {
    try {
      const syncRuns = await gatewaysApi.syncRuns(id);
      return { id, syncRuns: Array.isArray(syncRuns) ? syncRuns : [] };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to load gateway sync runs");
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
    currentGateway: null,
    currentGatewayLoading: false,
    currentGatewayError: null,
    updating: false,
    updateError: null,
    togglingId: null,
    deletingId: null,
    validatingId: null,
    syncingId: null,
    webhookEventsGatewayId: null,
    webhookEvents: [],
    webhookEventsLoading: false,
    webhookEventsError: null,
    syncRunsGatewayId: null,
    syncRuns: [],
    syncRunsLoading: false,
    syncRunsError: null,
  },
  reducers: {
    clearGatewaysError(state) {
      state.error = null;
    },
    clearGatewayFormError(state) {
      state.formError = null;
    },
    clearCurrentGateway(state) {
      state.currentGateway = null;
      state.currentGatewayLoading = false;
      state.currentGatewayError = null;
      state.updateError = null;
    },
    clearGatewayWebhookEvents(state) {
      state.webhookEventsGatewayId = null;
      state.webhookEvents = [];
      state.webhookEventsLoading = false;
      state.webhookEventsError = null;
    },
    clearGatewaySyncRuns(state) {
      state.syncRunsGatewayId = null;
      state.syncRuns = [];
      state.syncRunsLoading = false;
      state.syncRunsError = null;
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
      .addCase(fetchGatewayDetail.pending, (state) => {
        state.currentGatewayLoading = true;
        state.currentGatewayError = null;
      })
      .addCase(fetchGatewayDetail.fulfilled, (state, action) => {
        state.currentGatewayLoading = false;
        state.currentGateway = action.payload;
      })
      .addCase(fetchGatewayDetail.rejected, (state, action) => {
        state.currentGatewayLoading = false;
        state.currentGatewayError = action.payload || "Failed to load gateway details";
      })
      .addCase(updateGateway.pending, (state) => {
        state.updating = true;
        state.updateError = null;
      })
      .addCase(updateGateway.fulfilled, (state, action) => {
        state.updating = false;
        state.currentGateway = action.payload.updated;
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? { ...item, ...action.payload.updated } : item,
        );
      })
      .addCase(updateGateway.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload || "Failed to update gateway";
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
      })
      .addCase(fetchGatewayWebhookEvents.pending, (state, action) => {
        state.webhookEventsGatewayId = action.meta.arg;
        state.webhookEventsLoading = true;
        state.webhookEventsError = null;
      })
      .addCase(fetchGatewayWebhookEvents.fulfilled, (state, action) => {
        state.webhookEventsGatewayId = action.payload.id;
        state.webhookEventsLoading = false;
        state.webhookEvents = action.payload.events;
      })
      .addCase(fetchGatewayWebhookEvents.rejected, (state, action) => {
        state.webhookEventsLoading = false;
        state.webhookEventsError = action.payload || "Failed to load gateway webhook events";
      })
      .addCase(fetchGatewaySyncRuns.pending, (state, action) => {
        state.syncRunsGatewayId = action.meta.arg;
        state.syncRunsLoading = true;
        state.syncRunsError = null;
      })
      .addCase(fetchGatewaySyncRuns.fulfilled, (state, action) => {
        state.syncRunsGatewayId = action.payload.id;
        state.syncRunsLoading = false;
        state.syncRuns = action.payload.syncRuns;
      })
      .addCase(fetchGatewaySyncRuns.rejected, (state, action) => {
        state.syncRunsLoading = false;
        state.syncRunsError = action.payload || "Failed to load gateway sync runs";
      });
  },
});

export default gatewaysSlice.reducer;
export const {
  clearGatewaysError,
  clearGatewayFormError,
  clearCurrentGateway,
  clearGatewayWebhookEvents,
  clearGatewaySyncRuns,
} = gatewaysSlice.actions;

export const selectGateways = (state) => state.gateways.items;
export const selectGatewaysLoading = (state) => state.gateways.loading;
export const selectGatewaysError = (state) => state.gateways.error;
export const selectGatewaySaving = (state) => state.gateways.saving;
export const selectGatewayFormError = (state) => state.gateways.formError;
export const selectCurrentGateway = (state) => state.gateways.currentGateway;
export const selectCurrentGatewayLoading = (state) => state.gateways.currentGatewayLoading;
export const selectCurrentGatewayError = (state) => state.gateways.currentGatewayError;
export const selectGatewayUpdating = (state) => state.gateways.updating;
export const selectGatewayUpdateError = (state) => state.gateways.updateError;
export const selectGatewayTogglingId = (state) => state.gateways.togglingId;
export const selectGatewayDeletingId = (state) => state.gateways.deletingId;
export const selectGatewayValidatingId = (state) => state.gateways.validatingId;
export const selectGatewaySyncingId = (state) => state.gateways.syncingId;
export const selectGatewayWebhookEventsGatewayId = (state) => state.gateways.webhookEventsGatewayId;
export const selectGatewayWebhookEvents = (state) => state.gateways.webhookEvents;
export const selectGatewayWebhookEventsLoading = (state) => state.gateways.webhookEventsLoading;
export const selectGatewayWebhookEventsError = (state) => state.gateways.webhookEventsError;
export const selectGatewaySyncRunsGatewayId = (state) => state.gateways.syncRunsGatewayId;
export const selectGatewaySyncRuns = (state) => state.gateways.syncRuns;
export const selectGatewaySyncRunsLoading = (state) => state.gateways.syncRunsLoading;
export const selectGatewaySyncRunsError = (state) => state.gateways.syncRunsError;
