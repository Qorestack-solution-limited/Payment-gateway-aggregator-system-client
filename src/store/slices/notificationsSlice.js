import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { notificationsApi } from "../../API/apiClient";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async (_, { rejectWithValue }) => {
    try {
      return await notificationsApi.list();
    } catch (error) {
      return rejectWithValue(error.message || "Failed to load notifications");
    }
  },
);

export const markNotificationRead = createAsyncThunk(
  "notifications/markRead",
  async (id, { rejectWithValue }) => {
    try {
      await notificationsApi.markRead(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to mark notification as read");
    }
  },
);

export const markAllNotificationsRead = createAsyncThunk(
  "notifications/markAllRead",
  async (_, { rejectWithValue }) => {
    try {
      await notificationsApi.markAllRead();
    } catch (error) {
      return rejectWithValue(error.message || "Failed to mark all notifications as read");
    }
  },
);

export const removeNotification = createAsyncThunk(
  "notifications/remove",
  async (id, { rejectWithValue }) => {
    try {
      await notificationsApi.remove(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete notification");
    }
  },
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    unreadCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearNotificationsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload?.notifications ?? [];
        state.unreadCount = action.payload?.unreadCount ?? 0;
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load notifications";
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const notification = state.items.find((item) => item.id === action.payload);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markNotificationRead.rejected, (state, action) => {
        state.error = action.payload || "Failed to mark notification as read";
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items.forEach((item) => {
          item.isRead = true;
        });
        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsRead.rejected, (state, action) => {
        state.error = action.payload || "Failed to mark all notifications as read";
      })
      .addCase(removeNotification.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload);
        if (index !== -1) {
          if (!state.items[index].isRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          state.items.splice(index, 1);
        }
      })
      .addCase(removeNotification.rejected, (state, action) => {
        state.error = action.payload || "Failed to delete notification";
      });
  },
});

export default notificationsSlice.reducer;
export const { clearNotificationsError } = notificationsSlice.actions;

export const selectNotifications = (state) => state.notifications.items;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectNotifsLoading = (state) => state.notifications.loading;
export const selectNotificationsError = (state) => state.notifications.error;
