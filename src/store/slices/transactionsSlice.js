import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { transactionsApi } from "../../API/apiClient";

const initialFilters = {
  search: "",
  status: "",
  gatewayId: "",
  provider: "",
  startDate: "",
  endDate: "",
};

export const fetchTransactions = createAsyncThunk(
  "transactions/fetchTransactions",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { filters, page, limit } = getState().transactions;
      return await transactionsApi.list({
        page,
        limit,
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.gatewayId ? { gatewayId: filters.gatewayId } : {}),
        ...(filters.provider ? { provider: filters.provider } : {}),
        ...(filters.startDate ? { from: filters.startDate } : {}),
        ...(filters.endDate ? { to: filters.endDate } : {}),
      });
    } catch (error) {
      return rejectWithValue(error.message || "Failed to load transactions");
    }
  },
);

export const createTransaction = createAsyncThunk(
  "transactions/createTransaction",
  async (payload, { rejectWithValue }) => {
    try {
      return await transactionsApi.create(payload);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create transaction");
    }
  },
);

export const verifyTransaction = createAsyncThunk(
  "transactions/verifyTransaction",
  async (id, { rejectWithValue }) => {
    try {
      const updated = await transactionsApi.verify(id);
      return { id, updated };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to verify transaction");
    }
  },
);

export const fetchPendingTransactionsCount = createAsyncThunk(
  "transactions/fetchPendingTransactionsCount",
  async (_, { rejectWithValue }) => {
    try {
      const result = await transactionsApi.list({ status: "PENDING", limit: 1, page: 1 });
      return result?.meta?.total ?? 0;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to load pending transaction count");
    }
  },
);

export const fetchTransactionDetail = createAsyncThunk(
  "transactions/fetchTransactionDetail",
  async (id, { rejectWithValue }) => {
    try {
      return await transactionsApi.get(id);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to load transaction");
    }
  },
);

export const updateTransactionStatus = createAsyncThunk(
  "transactions/updateTransactionStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const updated = await transactionsApi.updateStatus(id, status);
      return { id, status, updated };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update transaction");
    }
  },
);

const transactionsSlice = createSlice({
  name: "transactions",
  initialState: {
    items: [],
    meta: { total: 0, page: 1, limit: 20, totalPages: 1 },
    page: 1,
    limit: 20,
    filters: initialFilters,
    loading: false,
    error: null,
    pendingCount: null,
    selectedTxId: null,
    selectedTx: null,
    selectedTxLoading: false,
    selectedTxError: null,
    creating: false,
    createError: null,
    verifyingId: null,
    updatingStatus: false,
  },
  reducers: {
    setTransactionsPage(state, action) {
      state.page = action.payload;
    },
    setTransactionsFilter(state, action) {
      const { key, value } = action.payload;
      state.filters[key] = value;
      state.page = 1;
    },
    clearTransactionsFilters(state) {
      state.filters = initialFilters;
      state.page = 1;
    },
    openTransactionDrawer(state, action) {
      state.selectedTxId = action.payload;
      state.selectedTxError = null;
    },
    closeTransactionDrawer(state) {
      state.selectedTxId = null;
      state.selectedTx = null;
      state.selectedTxError = null;
      state.selectedTxLoading = false;
    },
    clearTransactionsError(state) {
      state.error = null;
    },
    clearCreateTransactionError(state) {
      state.createError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload?.data ?? [];
        state.meta = action.payload?.meta ?? { total: 0, page: state.page, limit: state.limit, totalPages: 1 };
        state.error = null;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load transactions";
      })
      .addCase(createTransaction.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.creating = false;
        state.items.unshift(action.payload);
        state.meta.total += 1;
        state.meta.totalPages = Math.max(1, Math.ceil(state.meta.total / state.meta.limit));
        if (state.selectedTxId === action.payload?.id) {
          state.selectedTx = action.payload;
        }
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload || "Failed to create transaction";
      })
      .addCase(fetchPendingTransactionsCount.fulfilled, (state, action) => {
        state.pendingCount = action.payload > 0 ? action.payload : null;
      })
      .addCase(fetchTransactionDetail.pending, (state) => {
        state.selectedTxLoading = true;
        state.selectedTxError = null;
      })
      .addCase(fetchTransactionDetail.fulfilled, (state, action) => {
        state.selectedTxLoading = false;
        state.selectedTx = action.payload;
      })
      .addCase(fetchTransactionDetail.rejected, (state, action) => {
        state.selectedTxLoading = false;
        state.selectedTxError = action.payload || "Failed to load transaction";
      })
      .addCase(verifyTransaction.pending, (state, action) => {
        state.verifyingId = action.meta.arg;
        state.selectedTxError = null;
      })
      .addCase(verifyTransaction.fulfilled, (state, action) => {
        state.verifyingId = null;
        const updated = action.payload.updated ?? {};
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? { ...item, ...updated } : item,
        );
        if (state.selectedTx?.id === action.payload.id) {
          state.selectedTx = { ...state.selectedTx, ...updated };
        }
      })
      .addCase(verifyTransaction.rejected, (state, action) => {
        state.verifyingId = null;
        state.selectedTxError = action.payload || "Failed to verify transaction";
      })
      .addCase(updateTransactionStatus.pending, (state) => {
        state.updatingStatus = true;
        state.selectedTxError = null;
      })
      .addCase(updateTransactionStatus.fulfilled, (state, action) => {
        state.updatingStatus = false;
        const { id, status, updated } = action.payload;
        const previousSelectedStatus = state.selectedTx?.id === id ? state.selectedTx.status : null;
        const item = state.items.find((tx) => tx.id === id);
        const previousItemStatus = item?.status ?? null;
        if (item) item.status = status;
        if (state.selectedTx?.id === id) {
          state.selectedTx = { ...state.selectedTx, ...updated, status };
        }
        const previousStatus = previousItemStatus ?? previousSelectedStatus;
        if (previousStatus === "PENDING" && status !== "PENDING" && state.pendingCount != null) {
          state.pendingCount = Math.max(0, state.pendingCount - 1) || null;
        }
      })
      .addCase(updateTransactionStatus.rejected, (state, action) => {
        state.updatingStatus = false;
        state.selectedTxError = action.payload || "Failed to update transaction";
      });
  },
});

export default transactionsSlice.reducer;
export const {
  setTransactionsPage,
  setTransactionsFilter,
  clearTransactionsFilters,
  openTransactionDrawer,
  closeTransactionDrawer,
  clearTransactionsError,
  clearCreateTransactionError,
} = transactionsSlice.actions;

export const selectTransactions = (state) => state.transactions.items;
export const selectTransactionsMeta = (state) => state.transactions.meta;
export const selectTransactionsLoading = (state) => state.transactions.loading;
export const selectTransactionsError = (state) => state.transactions.error;
export const selectTransactionsFilters = (state) => state.transactions.filters;
export const selectTransactionsPage = (state) => state.transactions.page;
export const selectPendingTransactionsCount = (state) => state.transactions.pendingCount;
export const selectSelectedTransactionId = (state) => state.transactions.selectedTxId;
export const selectSelectedTransaction = (state) => state.transactions.selectedTx;
export const selectSelectedTransactionLoading = (state) => state.transactions.selectedTxLoading;
export const selectSelectedTransactionError = (state) => state.transactions.selectedTxError;
export const selectTransactionStatusUpdating = (state) => state.transactions.updatingStatus;
export const selectTransactionCreating = (state) => state.transactions.creating;
export const selectCreateTransactionError = (state) => state.transactions.createError;
export const selectTransactionVerifyingId = (state) => state.transactions.verifyingId;
