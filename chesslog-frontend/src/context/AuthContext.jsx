import { createContext, useContext, useState } from "react";
import { apiClient } from "../api/clients.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

    const [token, setToken] = useState(localStorage.getItem("accessToken") || null);
    const [user, setUser] = useState(() => {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    });

    const logout = () => {
        setToken(null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        setUser(null)
    };

    const login = async ({ email, password }) => {
        const data = await apiClient('/login', {
        method: 'POST',
        body: { email, password }
        });
        const userData = data.user || { email };

        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('user', JSON.stringify(userData));

        setToken(data.accessToken);
        setUser(data.user || { email });

        return data;
    };

    const register = async ({email, password}) => {
        const data = await apiClient('/register', {
            method : 'POST',
            body : {email, password}
        });

        setToken(data.accessToken)

        const userData = data.user || { email };

        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('user', JSON.stringify(userData));

        setUser(userData);
        return data;
    }

  // Everything placed inside this object will be accessible to your entire app
  const value = {
    token,
    user,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Custom hook so components can easily grab the context: const { token, user } = useAuth();
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};