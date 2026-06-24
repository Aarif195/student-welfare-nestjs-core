import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  user: any;
  token: string | null;
  login: (data: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  
  // Helper function to safely find the active user token for the current context
  const getStoredAuth = () => {
    const studentToken = localStorage.getItem('student_token');
    const ownerToken = localStorage.getItem('hostelOwner_token');
    const adminToken = localStorage.getItem('superadmin_token');

    // If you are currently testing/viewing an admin page route, prioritize loading the admin session
    if (window.location.pathname.includes('admin') && adminToken) {
      return { token: adminToken, user: JSON.parse(localStorage.getItem('superadmin_user') || 'null') };
    }
    
    // If you are viewing a hostel/owner page route, prioritize loading the owner session
    if ((window.location.pathname.includes('owner') || window.location.pathname.includes('hostel')) && ownerToken) {
      return { token: ownerToken, user: JSON.parse(localStorage.getItem('hostelOwner_user') || 'null') };
    }

    // Default fallback to student session or whatever active session is present
    if (studentToken) {
      return { token: studentToken, user: JSON.parse(localStorage.getItem('student_user') || 'null') };
    }
    if (ownerToken) {
      return { token: ownerToken, user: JSON.parse(localStorage.getItem('hostelOwner_user') || 'null') };
    }
    if (adminToken) {
      return { token: adminToken, user: JSON.parse(localStorage.getItem('superadmin_user') || 'null') };
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