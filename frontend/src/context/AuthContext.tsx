import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  user: any;
  token: string | null;
  login: (data: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Helper function to find any active user token across roles
  const getStoredAuth = () => {
    const roles = ['student', 'hostelOwner', 'superadmin'];
    for (const role of roles) {
      const token = localStorage.getItem(`${role}_token`);
      const userStr = localStorage.getItem(`${role}_user`);
      if (token && userStr) {
        return { token, user: JSON.parse(userStr) };
      }
    }
    return { token: null, user: null };
  };

  const cachedAuth = getStoredAuth();
  const [user, setUser] = useState(cachedAuth.user);
  const [token, setToken] = useState(cachedAuth.token);

  const login = (authData: any) => {
    const receivedToken = authData.token || authData.accessToken;
    const receivedUser = authData.user || authData.admin;
    const role = receivedUser?.role; // e.g., 'student', 'superadmin'

    if (role) {
      // Save using a role-specific key so tabs do not overwrite each other
      localStorage.setItem(`${role}_token`, receivedToken);
      localStorage.setItem(`${role}_user`, JSON.stringify(receivedUser));
    }

    setToken(receivedToken);
    setUser(receivedUser);
  };

  const logout = () => {
    const role = user?.role;
    if (role) {
      localStorage.removeItem(`${role}_token`);
      localStorage.removeItem(`${role}_user`);
    } else {
      localStorage.clear();
    }
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};