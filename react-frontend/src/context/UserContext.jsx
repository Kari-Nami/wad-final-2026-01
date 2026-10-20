// src/context/UserContext.jsx

import { useEffect, useRef, useState } from "react";
import { apiRequest } from "../lib/api";
import { UserContext } from "./userContext";

export function UserProvider({ children }) {
  const isInit = useRef(false);
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (isInit.current) return;
    isInit.current = true;

    const loadSession = async () => {
      try {
        const data = await apiRequest("/api/me");
        setUser(data.user);
      } catch (error) {
        if (error.status !== 401) {
          setAuthError("Unable to connect to the authentication service.");
        }
      } finally {
        setIsInitializing(false);
      }
    };

    loadSession();
  }, []);

  const login = async (identifier, password) => {
    setIsSubmitting(true);
    setAuthError("");

    try {
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier, password }),
      });
      setUser(data.user);
      return true;
    } catch (error) {
      setUser(null);
      setAuthError(error.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = async () => {
    setIsSubmitting(true);
    setAuthError("");

    try {
      await apiRequest("/api/auth/logout", {
        method: "POST",
      });
      setUser(null);
      return true;
    } catch (error) {
      setAuthError(error.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoggedIn: Boolean(user),
        isInitializing,
        isSubmitting,
        authError,
        login,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
