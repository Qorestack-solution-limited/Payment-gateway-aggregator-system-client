/**
 * Compatibility shim — keeps the useAuth() API intact for all existing pages.
 * Auth state now lives in Redux (src/store/slices/authSlice.js).
 * AuthProvider is a no-op wrapper kept so existing imports don't break.
 */
import { useDispatch, useSelector } from "react-redux";
import { createContext } from "react";
import {
  loginSuccess,
  logoutSuccess,
  updateUserSuccess,
  selectUser,
} from "../store/slices/authSlice";

const AuthContext = createContext(null);

// Keep AuthProvider as a no-op so main.jsx import doesn't break
export function AuthProvider({ children }) {
  return <AuthContext.Provider value={null}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  return {
    user,
    login: (userData, accessToken, refreshToken) =>
      dispatch(loginSuccess({ user: userData, accessToken, refreshToken })),
    logout: () => dispatch(logoutSuccess()),
    updateUser: (patch) => dispatch(updateUserSuccess(patch)),
  };
}
