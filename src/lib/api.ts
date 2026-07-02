const API_BASE = "/api";

async function fetchAPI(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

async function uploadFile(file: File): Promise<{ url: string; filename: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/admin/upload`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  get: (path: string) => fetchAPI(path),
  post: (path: string, data?: any) =>
    fetchAPI(path, { method: "POST", body: data ? JSON.stringify(data) : undefined }),
  patch: (path: string, data?: any) =>
    fetchAPI(path, { method: "PATCH", body: data ? JSON.stringify(data) : undefined }),
  delete: (path: string) => fetchAPI(path, { method: "DELETE" }),
  upload: uploadFile,
};
