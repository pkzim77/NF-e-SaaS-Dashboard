const BASE = '/api';

async function request(path, options) {
  const res = await fetch(`${BASE}/${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status} on ${path}`);
  return res.json();
}

export const api = {
  get: (path) => request(path),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  post: (path, body) => request(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
};
