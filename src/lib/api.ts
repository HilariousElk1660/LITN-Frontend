const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export interface AuthResponse {
  user_id: string;
  email: string;
  fullname: string;
  role: string;
  access_token: string;
  token_type: string;
}

export const api = {
  async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail ?? "Request failed");
    return data as T;
  },

  saveSession(auth: AuthResponse) {
    localStorage.setItem("access_token", auth.access_token);
    localStorage.setItem("user", JSON.stringify({
      user_id: auth.user_id,
      email: auth.email,
      fullname: auth.fullname,
      role: auth.role,
    }));
  },

  clearSession() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
  },

  getToken(): string | null {
    return localStorage.getItem("access_token");
  },

  getUser() {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  },
};