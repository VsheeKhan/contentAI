export async function authFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("authToken");
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    // Token is invalid or expired
    localStorage.removeItem("authToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    window.location.href = "/auth";
    throw new Error("Unauthorized");
  }

  return response;
}
