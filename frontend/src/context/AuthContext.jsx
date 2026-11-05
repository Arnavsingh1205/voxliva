import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { API_BASE_URL } from "../services/api.js";
import {
  clearStoredAuth,
  getStoredAuth,
  storeAuth,
} from "../services/authStorage.js";

const AuthContext = createContext(null);
export const UNAUTHORIZED_EVENT = "voxliva:unauthorized";

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | Restore Login
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const stored = getStoredAuth();
      if (!stored.token || !stored.user) {
        if (!cancelled) setLoading(false);
        return;
      }

      setUser(stored.user);
      setToken(stored.token);

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${stored.token}`,
          },
        });
        const data = await response.json().catch(() => null);

        if (response.status === 401) {
          clearStoredAuth();
          if (!cancelled) {
            setUser(null);
            setToken("");
          }
        } else if (response.ok && data?.success && data.user) {
          if (!cancelled) {
            storeAuth(data.user, stored.token);
            setUser(data.user);
            setToken(stored.token);
          }
        }
      } catch {
        // Keep the session usable offline; protected API requests still validate it.
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    restoreSession();

    const handleUnauthorized = () => logout();
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);

    return () => {
      cancelled = true;
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Login
  |--------------------------------------------------------------------------
  */

  const login = (userData, token) => {
    if (!userData || !token) return false;
    clearStoredAuth();
    storeAuth(userData, token);
    setUser(userData);
    setToken(token);
    return true;
  };

  /*
  |--------------------------------------------------------------------------
  | Signup
  |--------------------------------------------------------------------------
  */

  const signup = (userData, token) => {
    if (!userData || !token) return false;
    clearStoredAuth();
    storeAuth(userData, token);
    setUser(userData);
    setToken(token);
    return true;
  };

  /*
  |--------------------------------------------------------------------------
  | Update User
  |--------------------------------------------------------------------------
  */

  const updateUser = (userData) => {
    setUser(userData);
    const saved = getStoredAuth();
    if (saved.token) storeAuth(userData, saved.token);
  };

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  const logout = () => {
    setUser(null);
    setToken("");
    clearStoredAuth();
  };

  /*
  |--------------------------------------------------------------------------
  | Context Value
  |--------------------------------------------------------------------------
  */

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated:
        Boolean(user && token),

      login,
      signup,
      updateUser,
      logout,
    }),
    [user, token, loading]
  );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

/*
|--------------------------------------------------------------------------
| useAuth Hook
|--------------------------------------------------------------------------
*/

function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}

export {
  AuthProvider,
  useAuth,
};

export default AuthContext;