// src/context/AuthContext.jsx — Firebase removed
import { createContext, useContext, useState } from "react";
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);
export function AuthProvider({ children }) {
  const [user] = useState(null);
  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}