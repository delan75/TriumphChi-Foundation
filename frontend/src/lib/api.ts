const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1';

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`API request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

