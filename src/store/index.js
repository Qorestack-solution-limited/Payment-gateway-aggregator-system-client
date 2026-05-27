import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import dashboardReducer from "./slices/dashboardSlice";
import transactionsReducer from "./slices/transactionsSlice";
import gatewaysReducer from "./slices/gatewaysSlice";
import analyticsReducer from "./slices/analyticsSlice";
import developerReducer from "./slices/developerSlice";
import notificationsReducer from "./slices/notificationsSlice";
import { logoutSuccess } from "./slices/authSlice";

const appReducer = {
  auth: authReducer,
  dashboard: dashboardReducer,
  transactions: transactionsReducer,
  gateways: gatewaysReducer,
  analytics: analyticsReducer,
  developer: developerReducer,
  notifications: notificationsReducer,
};

function rootReducer(state = {}, action) {
  if (action.type === logoutSuccess.type) {
    state = {
      auth: authReducer(undefined, action),
    };
  }

  return {
    auth: appReducer.auth(state.auth, action),
    dashboard: appReducer.dashboard(state.dashboard, action),
    transactions: appReducer.transactions(state.transactions, action),
    gateways: appReducer.gateways(state.gateways, action),
    analytics: appReducer.analytics(state.analytics, action),
    developer: appReducer.developer(state.developer, action),
    notifications: appReducer.notifications(state.notifications, action),
  };
}

export const store = configureStore({
  reducer: rootReducer,
});
