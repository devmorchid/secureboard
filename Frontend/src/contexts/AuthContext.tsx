import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'admin' | 'manager' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, passwordConfirmation?: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On app load, try to fetch current authenticated user from backend
    const checkAuth = async () => {
      try {
  // Try to fetch authenticated user from backend (try /api/user then /user)
  const res = await requestWithFallback(['/user'], { method: 'GET' });
    if (res && (res.ok || (res.status >= 300 && res.status < 400))) {
          const data = await res.json();
          if (data && data.id) {
            setUser({
              id: String(data.id),
              email: data.email,
              name: data.name || data.email.split('@')[0],
              role: (data.role as UserRole) || 'user',
              avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`,
              createdAt: data.created_at || new Date().toISOString(),
            });
            return;
          }
        }
        // If backend didn't return a user, keep unauthenticated
      } catch (error) {
        // If backend isn't available or call fails, fall back silently to demo behavior
        console.warn('checkAuth: could not fetch authenticated user (backend may be down):', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Try API login then fallback to web login if needed
  const res = await requestWithFallback(['/login'], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res) throw new Error('Login request failed');

      // consider 2xx and 3xx as acceptable here; backend may redirect after successful auth
      if (res.ok || (res.status >= 300 && res.status < 400)) {
        // Fetch user (try /api/user then /user)
  const userRes = await requestWithFallback(['/user'], { method: 'GET' });
        if (userRes && (userRes.ok || (userRes.status >= 300 && userRes.status < 400))) {
          const data = await userRes.json();
          setUser({
            id: String(data.id),
            email: data.email,
            name: data.name || data.email.split('@')[0],
            role: (data.role as UserRole) || 'user',
            avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`,
            createdAt: data.created_at || new Date().toISOString(),
          });
          return;
        }
      }

      // If login failed, throw to let caller handle
      const text = await res.text().catch(() => '');
      throw new Error(text || 'Invalid credentials');
    } catch (error) {
      // Rethrow so UI can show an error
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, passwordConfirmation?: string): Promise<void> => {
    setIsLoading(true);
    try {
  const res = await requestWithFallback(['/register'], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, password_confirmation: passwordConfirmation }),
      });
      if (res && (res.ok || (res.status >= 300 && res.status < 400))) {
        // After register, fetch user
  const userRes = await requestWithFallback(['/user'], { method: 'GET' });
        if (userRes && (userRes.ok || (userRes.status >= 300 && userRes.status < 400))) {
          const data = await userRes.json();
          setUser({
            id: String(data.id),
            email: data.email,
            name: data.name || name,
            role: (data.role as UserRole) || 'user',
            avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`,
            createdAt: data.created_at || new Date().toISOString(),
          });
          return;
        }
      }
      const text = await res?.text().catch(() => '');
      throw new Error(text || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Call backend logout, then clear local state
    (async () => {
      try {
  await requestWithFallback(['/logout'], { method: 'POST' });
      } catch (e) {
        // ignore
      } finally {
        setUser(null);
      }
    })();
  };

  const resetPassword = async (email: string): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Helper: fetch wrapper that includes credentials and sensible defaults
export async function safeFetch(input: RequestInfo, init?: RequestInit): Promise<Response | null> {
  try {
  // If running in browser, read XSRF-TOKEN cookie and set header for non-GET requests
  const headers = new Headers(init && init.headers ? init.headers as HeadersInit : undefined);
  // default to JSON responses so Laravel returns JSON errors (401) instead of redirecting to HTML login
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');
  if (!headers.has('X-Requested-With')) headers.set('X-Requested-With', 'XMLHttpRequest');
    try {
      if (typeof document !== 'undefined') {
        const cookieString = document.cookie || '';
        const match = cookieString.split(';').map(c => c.trim()).find(c => c.startsWith('XSRF-TOKEN='));
        if (match) {
          const token = decodeURIComponent(match.split('=')[1]);
          // For non-GET/HEAD requests include X-XSRF-TOKEN header so Laravel can validate
          const method = (init && init.method) ? (init.method as string).toUpperCase() : 'GET';
          if (method !== 'GET' && method !== 'HEAD') {
            headers.set('X-XSRF-TOKEN', token);
          }
        }
      }
    } catch (e) {
      // ignore cookie read errors
    }

    // By default do not follow redirects - backend may return 3xx responses
    // (e.g. redirect to /dashboard) which we want to inspect instead of letting
    // the browser follow across origins. Callers can override via init.
    const defaultInit: RequestInit = {
      credentials: 'include', // important for Laravel session cookies
      mode: 'cors',
      redirect: 'manual',
    };
    const res = await fetch(input, {
      ...defaultInit,
      ...init,
      headers,
    } as RequestInit);

    // Dev-only debug: log response details to help diagnose redirects/CSRF/CORS
    try {
      const isDev = typeof import.meta !== 'undefined' ? (import.meta as any).env?.DEV : (process && process.env && process.env.NODE_ENV !== 'production');
      if (isDev) {
        // Log minimal info without exposing sensitive data
        console.debug('[safeFetch] request', { input, method: init?.method || 'GET' });
        console.debug('[safeFetch] response status:', res.status, 'redirected:', (res as any).redirected);
        try {
          const loc = res.headers.get('Location');
          if (loc) console.debug('[safeFetch] response Location header:', loc);
        } catch (e) {
          // ignore
        }
        // If JSON, peek at body (non-destructive) for debugging
        try {
          const ct = res.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const clone = res.clone();
            clone.json().then(body => console.debug('[safeFetch] response json body:', body)).catch(() => {});
          }
        } catch (e) {
          // ignore
        }
      }
    } catch (e) {
      // ignore debug errors
    }

    return res;
  } catch (error) {
    console.warn('safeFetch error:', error);
    return null;
  }
}

// Helper: request Laravel Sanctum CSRF cookie endpoint
let _csrfPromise: Promise<void> | null = null;
export async function getCsrfCookie(): Promise<void> {
  if (_csrfPromise) return _csrfPromise;
  _csrfPromise = (async () => {
    try {
      // Vite proxy will forward this to http://localhost:8000/sanctum/csrf-cookie
      const res = await fetch('/sanctum/csrf-cookie', {
        credentials: 'include',
        method: 'GET',
      });
      if (!res.ok) throw new Error('Could not get CSRF cookie');
    } catch (error) {
      console.warn('getCsrfCookie failed:', error);
      throw error;
    }
  })();
  try {
    await _csrfPromise;
  } finally {
    _csrfPromise = null;
  }
}

// Try multiple paths in order until one succeeds. For non-API fallbacks, ensure CSRF cookie is requested.
async function requestWithFallback(paths: string[], init?: RequestInit): Promise<Response | null> {
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    try {
      // If path is not an /api/* path, ensure CSRF cookie for cookie-based endpoints
      if (!path.startsWith('/api')) {
        try {
          await getCsrfCookie();
        } catch (e) {
          // ignore CSRF fetch failures and try anyway
        }
      }

      const res = await safeFetch(path, init);

      // If backend returned 419 (page expired), try getting CSRF cookie and retry once
      if (res && res.status === 419) {
        try { await getCsrfCookie(); } catch (e) { /* ignore */ }
        const retry = await safeFetch(path, init);
        if (retry) return retry;
        continue;
      }

      if (res) return res;
    } catch (err) {
      // try next
      continue;
    }
  }
  return null;
}