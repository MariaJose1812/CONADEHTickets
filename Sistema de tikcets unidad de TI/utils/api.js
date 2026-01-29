const API_URL = "http://localhost:3000";

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const res = await fetch(API_URL + endpoint, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json();
    throw err;
  }

  return res.json();
}
