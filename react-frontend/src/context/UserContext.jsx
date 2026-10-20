// src/context/UserContext.jsx

import { useEffect, useRef, useState } from "react";
import { UserContext } from "./userContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "The request could not be completed");
  }

  return data;
}

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
        const response = await fetch(`${API_URL}/api/me`, {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch {
        setAuthError("Unable to connect to the authentication service.");
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
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await readResponse(response);
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
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      await readResponse(response);
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
