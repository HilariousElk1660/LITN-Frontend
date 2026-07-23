const BASE_URL = import.meta.env.VITE_API_URL ;
import supportedLanguages from '../assets/supported_languages.json'


export interface AuthResponse {
  user_id: string;
  email: string;
  fullname: string;
  role: string;
  access_token: string;
  token_type: string;
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // no/invalid JSON body (e.g. 204 No Content)
  }

  if (!res.ok) throw new Error(data?.detail ?? `Request failed (${res.status})`);
  return data as T;
}

export const api = {
  get<T>(path: string) {
    return request<T>("GET", path);
  },
  post<T>(path: string, body: unknown) {
    return request<T>("POST", path, body);
  },
  patch<T>(path: string, body: unknown) {
    return request<T>("PATCH", path, body);
  },
  delete<T>(path: string) {
    return request<T>("DELETE", path);
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
    const detectedLang = navigator.language.slice(0, 2) || 'en';
    const lang = supportedLanguages[detectedLang]
    return raw ? { ...JSON.parse(raw),"prefferedLanguage":lang } : null;
  },
};