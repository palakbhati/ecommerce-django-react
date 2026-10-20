// src/utils/auth.js
export const saveTokens = (tokens) => {
  localStorage.setItem("access_token", tokens.access);
  if (tokens.refresh) localStorage.setItem("refresh_token", tokens.refresh);
};

export const clearTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

export const getAccessToken = () => localStorage.getItem("access_token");

const BASEURL = import.meta.env.VITE_DJANGO_BASE_URL;

// Get a new access token using the refresh token. Returns true on success.
const refreshAccessToken = async () => {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return false;
  try {
    const res = await fetch(`${BASEURL}/api/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return false;
    saveTokens(await res.json());
    return true;
  } catch {
    return false;
  }
};

const doFetch = (url, options) => {
  const token = getAccessToken();
  const headers = options.headers ? {...options.headers} : {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  return fetch(url, {...options, headers});
};

export const authFetch = async (url, options = {}) => {
  const res = await doFetch(url, options);
  if (res.status !== 401 || !getAccessToken()) return res;

  // Access token expired: refresh it once and retry, otherwise log the user out
  if (await refreshAccessToken()) return doFetch(url, options);
  clearTokens();
  return res;
};
