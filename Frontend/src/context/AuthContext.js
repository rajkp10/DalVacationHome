import React, { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    userId: localStorage.getItem("userId") || null,
    role: localStorage.getItem("role") || null,
    idToken: localStorage.getItem("idToken") || null,
    accessToken: localStorage.getItem("accessToken") || null,
    refreshToken: localStorage.getItem("refreshToken") || null,
  });

  useEffect(() => {
    if (
      authState.idToken &&
      authState.accessToken &&
      authState.refreshToken &&
      authState.userId &&
      authState.role
    ) {
      localStorage.setItem("userId", authState.userId);
      localStorage.setItem("role", authState.role);
      localStorage.setItem("idToken", authState.idToken);
      localStorage.setItem("accessToken", authState.accessToken);
      localStorage.setItem("refreshToken", authState.refreshToken);
    }
  }, [authState]);

  const setTokens = ({ userDetails, idToken, accessToken, refreshToken }) => {
    console.log(userDetails.role);
    setAuthState({
      userId: userDetails.userId,
      role: userDetails.role,
      idToken,
      accessToken,
      refreshToken,
    });
  };

  const logout = () => {
    setAuthState({
      userId: localStorage.removeItem("userId"),
      role: localStorage.removeItem("role"),
      idToken: localStorage.removeItem("idToken"),
      accessToken: localStorage.removeItem("accessToken"),
      refreshToken: localStorage.removeItem("refreshToken"),
    });
  };

  return (
    <AuthContext.Provider value={{ authState, setTokens, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
