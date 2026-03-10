import { createContext, useState, useContext } from "react";
const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const login = () => {
    localStorage.setItem("payToken", true);
  };
  const logout = () => {
    localStorage.removeItem("payToken", false);
  };
  const [user, setUser] = useState(true);
  return (
    <AuthContext.Provider value={{ user, login, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
