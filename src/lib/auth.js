// Local Authentication Provider for mamaysporto CMS

const TOKEN_KEY = "mamaysporto_admin_token";
const USER_KEY = "mamaysporto_admin_user";

const listeners = new Set();

function notifyListeners(session) {
  for (const listener of listeners) {
    try {
      listener(session);
    } catch (e) {
      console.error("Auth listener error:", e);
    }
  }
}

export function getStoredToken() {
  return typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
}

export async function signIn(email, password) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Gagal login ke panel admin.");
  }

  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));

  const session = { token: data.token, user: data.user };
  notifyListeners(session);
  return session;
}

export async function signOut() {
  const token = getStoredToken();
  if (token) {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Ignore network errors on logout
    }
  }

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  notifyListeners(null);
}

export async function getSession() {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const res = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return null;
    }

    const data = await res.json();
    return { token, user: data.user };
  } catch {
    // If backend cannot be reached, fallback to stored user if any
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedUser) {
      try {
        return { token, user: JSON.parse(storedUser) };
      } catch {
        return null;
      }
    }
    return null;
  }
}

export function onAuthStateChange(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}
