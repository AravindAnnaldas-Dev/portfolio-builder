import { Portfolio, PortfolioContent, TemplateId } from "@/types/portfolio";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

let refreshPromise: Promise<boolean> | null = null;

// Calls /api/auth/refresh at most once concurrently — if five requests 401 at
// the same time, they all await the same in-flight refresh instead of racing
// five separate rotations against the single-use refresh token.
function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.ok)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function request<T>(path: string, options: RequestInit = {}, isRetry = false): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (res.status === 401 && !isRetry && path !== "/api/auth/refresh" && path !== "/api/auth/login") {
    const refreshed = await refreshAccessToken();
    if (refreshed) return request<T>(path, options, true);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error?.toString() || `Request failed with ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const authApi = {
  register: (email: string, password: string, name?: string) =>
    request<{ user: any }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),
  login: (email: string, password: string) =>
    request<{ user: any }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () => request<void>("/api/auth/logout", { method: "POST" }),
  me: () => request<{ user: any }>("/api/auth/me"),
};

// Uploads go through FormData, not JSON, so this bypasses `request()`'s
// Content-Type: application/json default — setting Content-Type manually on
// a multipart body would strip the boundary the browser generates and break
// the upload. Retry-on-401 is duplicated here for the same reason.
async function uploadFile(path: string, file: File, isRetry = false): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (res.status === 401 && !isRetry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return uploadFile(path, file, true);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error?.toString() || `Upload failed with ${res.status}`);
  }

  return res.json();
}

export const uploadApi = {
  image: (file: File) => uploadFile("/api/uploads/image", file),
};

export const portfolioApi = {
  list: () => request<Portfolio[]>("/api/portfolios"),
  get: (id: string) => request<Portfolio>(`/api/portfolios/${id}`),
  create: (data: { title: string; template: TemplateId; content: PortfolioContent }) =>
    request<Portfolio>("/api/portfolios", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<{ title: string; template: TemplateId; content: PortfolioContent }>) =>
    request<Portfolio>(`/api/portfolios/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id: string) => request<void>(`/api/portfolios/${id}`, { method: "DELETE" }),
  duplicate: (id: string) => request<Portfolio>(`/api/portfolios/${id}/duplicate`, { method: "POST" }),
  exportZipUrl: (id: string) => `${API_URL}/api/portfolios/${id}/export`,
};

export { API_URL };
