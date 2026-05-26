import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import dashboardReducer from "./slices/dashboardSlice";
import transactionsReducer from "./slices/transactionsSlice";
import gatewaysReducer from "./slices/gatewaysSlice";
import analyticsReducer from "./slices/analyticsSlice";
import developerReducer from "./slices/developerSlice";
import notificationsReducer from "./slices/notificationsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    transactions: transactionsReducer,
    gateways: gatewaysReducer,
    analytics: analyticsReducer,
    developer: developerReducer,
    notifications: notificationsReducer,
  },
});
