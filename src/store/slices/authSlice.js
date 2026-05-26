import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authApi, usersApi } from "../../API/apiClient";

function readStoredUser() {
  try {
    const raw = localStorage.getItem("payUser");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function readStoredToken() {
  try {
    return localStorage.getItem("payToken");
  } catch {
    return null;
  }
}

function persistSession(user, accessToken, refreshToken) {
  if (accessToken) localStorage.setItem("payToken", accessToken);
  if (refreshToken) localStorage.setItem("payRefreshToken", refreshToken);
  if (user) localStorage.setItem("payUser", JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem("payToken");
  localStorage.removeItem("payRefreshToken");
  localStorage.removeItem("payUser");
}

function isAuthPayloadValid(payload) {
  return Boolean(payload && payload.user && payload.accessToken);
}

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const result = await authApi.login(credentials);
      if (!isAuthPayloadValid(result)) {
        return rejectWithValue("Invalid login response from server");
      }
      return result;
    } catch (error) {
      return rejectWithValue(error.message || "Login failed");
    }
  },
);

export const hydrateAuth = createAsyncThunk(
  "auth/hydrateAuth",
  async (_, { rejectWithValue }) => {
    const token = readStoredToken();
    try {
      if (!token) return { token: null, user: null };
      const user = await usersApi.me();
      return { token, user };
    } catch (error) {
      return rejectWithValue(error.message || "Unable to restore session");
    }
  },
);

export const refreshCurrentUser = createAsyncThunk(
  "auth/refreshCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      return await usersApi.me();
    } catch (error) {
      return rejectWithValue(error.message || "Unable to load profile");
    }
  },
);

export const saveProfile = createAsyncThunk(
  "auth/saveProfile",
  async (payload, { rejectWithValue }) => {
    try {
      return await usersApi.updateProfile(payload);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update profile");
    }
  },
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      return await usersApi.changePassword(currentPassword, newPassword);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to change password");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: readStoredUser(),
    status: "idle",
    error: null,
    hydrated: false,
    activeLoginRequestId: null,
    profileLoading: false,
    profileMessage: null,
    passwordLoading: false,
    passwordMessage: null,
  },
  reducers: {
    loginSuccess(state, action) {
      if (!isAuthPayloadValid(action.payload)) {
        state.status = "error";
        state.error = "Invalid login response from server";
        state.hydrated = true;
        return;
      }
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.status = "authenticated";
      state.error = null;
      state.hydrated = true;
      persistSession(user, accessToken, refreshToken);
    },
    logoutSuccess(state) {
      state.user = null;
      state.status = "idle";
      state.error = null;
      state.hydrated = true;
      clearSession();
    },
    updateUserSuccess(state, action) {
      state.user = { ...state.user, ...action.payload };
      state.error = null;
      localStorage.setItem("payUser", JSON.stringify(state.user));
    },
    clearAuthError(state) {
      state.error = null;
    },
    clearProfileMessage(state) {
      state.profileMessage = null;
    },
    clearPasswordMessage(state) {
      state.passwordMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.activeLoginRequestId = action.meta.requestId;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        if (!isAuthPayloadValid(action.payload)) {
          state.status = "error";
          state.error = "Invalid login response from server";
          state.hydrated = true;
          return;
        }
        const { user, accessToken, refreshToken } = action.payload;
        state.user = user;
        state.status = "authenticated";
        state.error = null;
        state.hydrated = true;
        state.activeLoginRequestId = action.meta.requestId;
        persistSession(user, accessToken, refreshToken);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload || "Login failed";
        state.hydrated = true;
        state.activeLoginRequestId = null;
      })
      .addCase(hydrateAuth.pending, (state) => {
        state.status = state.user ? "authenticated" : "loading";
      })
      .addCase(hydrateAuth.fulfilled, (state, action) => {
        if (state.activeLoginRequestId) {
          state.hydrated = true;
          return;
        }
        const currentToken = readStoredToken();
        if (currentToken !== action.payload?.token) {
          state.hydrated = true;
          return;
        }
        state.user = action.payload?.user ?? null;
        state.status = action.payload?.user ? "authenticated" : "idle";
        state.error = null;
        state.hydrated = true;
        if (action.payload?.user) {
          localStorage.setItem("payUser", JSON.stringify(action.payload.user));
        }
      })
      .addCase(hydrateAuth.rejected, (state, action) => {
        if (state.activeLoginRequestId) {
          state.hydrated = true;
          return;
        }
        state.user = null;
        state.status = "idle";
        state.error = action.payload || null;
        state.hydrated = true;
        clearSession();
      })
      .addCase(refreshCurrentUser.pending, (state) => {
        state.profileLoading = true;
      })
      .addCase(refreshCurrentUser.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.user = action.payload;
        localStorage.setItem("payUser", JSON.stringify(action.payload));
      })
      .addCase(refreshCurrentUser.rejected, (state) => {
        state.profileLoading = false;
      })
      .addCase(saveProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileMessage = null;
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("payUser", JSON.stringify(state.user));
        state.profileMessage = { text: "Profile updated successfully.", ok: true };
      })
      .addCase(saveProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileMessage = { text: action.payload || "Failed to update profile.", ok: false };
      })
      .addCase(changePassword.pending, (state) => {
        state.passwordLoading = true;
        state.passwordMessage = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.passwordLoading = false;
        state.passwordMessage = { text: "Password changed successfully.", ok: true };
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.passwordLoading = false;
        state.passwordMessage = { text: action.payload || "Failed to change password.", ok: false };
      });
  },
});

export const {
  loginSuccess,
  logoutSuccess,
  updateUserSuccess,
  clearAuthError,
  clearProfileMessage,
  clearPasswordMessage,
} = authSlice.actions;
export default authSlice.reducer;

export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.user !== null;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthHydrated = (state) => state.auth.hydrated;
export const selectProfileLoading = (state) => state.auth.profileLoading;
export const selectProfileMessage = (state) => state.auth.profileMessage;
export const selectPasswordLoading = (state) => state.auth.passwordLoading;
export const selectPasswordMessage = (state) => state.auth.passwordMessage;
