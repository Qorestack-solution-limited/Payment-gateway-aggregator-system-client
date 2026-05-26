import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiKeysApi, gatewaysApi, webhooksApi } from "../../API/apiClient";

function normalizeKey(key) {
  return {
    ...key,
    prefix: key.prefix ?? key.key ?? "",
    isRevoked: key.isRevoked ?? !key.isActive,
  };
}

export const fetchDeveloperData = createAsyncThunk(
  "developer/fetchDeveloperData",
  async (_, { rejectWithValue }) => {
    try {
      const [keys, gateways, webhooks] = await Promise.all([
        apiKeysApi.list(),
        gatewaysApi.list(),
        webhooksApi.list(),
      ]);
      return {
        keys: Array.isArray(keys) ? keys.map(normalizeKey) : [],
        gateways: Array.isArray(gateways) ? gateways : [],
        webhooks: Array.isArray(webhooks) ? webhooks : [],
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to load developer data");
    }
  },
);

export const generateApiKey = createAsyncThunk(
  "developer/generateApiKey",
  async ({ name, type }, { rejectWithValue }) => {
    try {
      return await apiKeysApi.generate(name, type);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to generate API key");
    }
  },
);

export const revokeApiKey = createAsyncThunk(
  "developer/revokeApiKey",
  async (id, { rejectWithValue }) => {
    try {
      const updated = await apiKeysApi.revoke(id);
      return { id, updated };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to revoke API key");
    }
  },
);

export const deleteApiKey = createAsyncThunk(
  "developer/deleteApiKey",
  async (id, { rejectWithValue }) => {
    try {
      await apiKeysApi.remove(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete API key");
    }
  },
);

export const createWebhook = createAsyncThunk(
  "developer/createWebhook",
  async (payload, { rejectWithValue }) => {
    try {
      return await webhooksApi.create(payload);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create webhook");
    }
  },
);

export const deleteWebhook = createAsyncThunk(
  "developer/deleteWebhook",
  async (id, { rejectWithValue }) => {
    try {
      await webhooksApi.remove(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete webhook");
    }
  },
);

const developerSlice = createSlice({
  name: "developer",
  initialState: {
    keys: [],
    gateways: [],
    webhooks: [],
    loading: false,
    error: null,
    savingKey: false,
    keyError: null,
    newKeyValue: null,
    revokingId: null,
    deletingKeyId: null,
    savingWebhook: false,
    webhookError: null,
    deletingWebhookId: null,
  },
  reducers: {
    clearDeveloperError(state) {
      state.error = null;
    },
    clearDeveloperKeyError(state) {
      state.keyError = null;
    },
    clearDeveloperWebhookError(state) {
      state.webhookError = null;
    },
    clearGeneratedKey(state) {
      state.newKeyValue = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeveloperData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeveloperData.fulfilled, (state, action) => {
        state.loading = false;
        state.keys = action.payload.keys;
        state.gateways = action.payload.gateways;
        state.webhooks = action.payload.webhooks;
      })
      .addCase(fetchDeveloperData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load developer data";
      })
      .addCase(generateApiKey.pending, (state) => {
        state.savingKey = true;
        state.keyError = null;
        state.newKeyValue = null;
      })
      .addCase(generateApiKey.fulfilled, (state, action) => {
        state.savingKey = false;
        state.newKeyValue = action.payload.key ?? action.payload.value ?? null;
        state.keys.unshift(normalizeKey(action.payload));
      })
      .addCase(generateApiKey.rejected, (state, action) => {
        state.savingKey = false;
        state.keyError = action.payload || "Failed to generate API key";
      })
      .addCase(revokeApiKey.pending, (state, action) => {
        state.revokingId = action.meta.arg;
      })
      .addCase(revokeApiKey.fulfilled, (state, action) => {
        state.revokingId = null;
        state.keys = state.keys.map((key) =>
          key.id === action.payload.id ? { ...key, ...normalizeKey(action.payload.updated), isRevoked: true } : key,
        );
      })
      .addCase(revokeApiKey.rejected, (state, action) => {
        state.revokingId = null;
        state.error = action.payload || "Failed to revoke API key";
      })
      .addCase(deleteApiKey.pending, (state, action) => {
        state.deletingKeyId = action.meta.arg;
      })
      .addCase(deleteApiKey.fulfilled, (state, action) => {
        state.deletingKeyId = null;
        state.keys = state.keys.filter((key) => key.id !== action.payload);
      })
      .addCase(deleteApiKey.rejected, (state, action) => {
        state.deletingKeyId = null;
        state.error = action.payload || "Failed to delete API key";
      })
      .addCase(createWebhook.pending, (state) => {
        state.savingWebhook = true;
        state.webhookError = null;
      })
      .addCase(createWebhook.fulfilled, (state, action) => {
        state.savingWebhook = false;
        state.webhooks.unshift(action.payload);
      })
      .addCase(createWebhook.rejected, (state, action) => {
        state.savingWebhook = false;
        state.webhookError = action.payload || "Failed to create webhook";
      })
      .addCase(deleteWebhook.pending, (state, action) => {
        state.deletingWebhookId = action.meta.arg;
      })
      .addCase(deleteWebhook.fulfilled, (state, action) => {
        state.deletingWebhookId = null;
        state.webhooks = state.webhooks.filter((webhook) => webhook.id !== action.payload);
      })
      .addCase(deleteWebhook.rejected, (state, action) => {
        state.deletingWebhookId = null;
        state.error = action.payload || "Failed to delete webhook";
      });
  },
});

export default developerSlice.reducer;
export const {
  clearDeveloperError,
  clearDeveloperKeyError,
  clearDeveloperWebhookError,
  clearGeneratedKey,
} = developerSlice.actions;

export const selectDeveloperKeys = (state) => state.developer.keys;
export const selectDeveloperGateways = (state) => state.developer.gateways;
export const selectDeveloperWebhooks = (state) => state.developer.webhooks;
export const selectDeveloperLoading = (state) => state.developer.loading;
export const selectDeveloperError = (state) => state.developer.error;
export const selectDeveloperSavingKey = (state) => state.developer.savingKey;
export const selectDeveloperKeyError = (state) => state.developer.keyError;
export const selectGeneratedKeyValue = (state) => state.developer.newKeyValue;
export const selectDeveloperRevokingId = (state) => state.developer.revokingId;
export const selectDeveloperDeletingKeyId = (state) => state.developer.deletingKeyId;
export const selectDeveloperSavingWebhook = (state) => state.developer.savingWebhook;
export const selectDeveloperWebhookError = (state) => state.developer.webhookError;
export const selectDeveloperDeletingWebhookId = (state) => state.developer.deletingWebhookId;
