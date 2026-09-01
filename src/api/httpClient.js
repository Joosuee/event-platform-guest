const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

class HttpError extends Error {
  constructor(message, statusCode, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

async function request(path, { method = 'GET', body, params } = {}) {
  let url = `${API_URL}${path}`;

  if (params) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
    ).toString();
    if (query) url += `?${query}`;
  }

  const response = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new HttpError(
      payload?.message || `Error de red (${response.status})`,
      response.status,
      payload?.details
    );
  }

  return payload?.data;
}

async function requestForm(path, formData) {
  const response = await fetch(`${API_URL}${path}`, { method: 'POST', body: formData });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new HttpError(
      payload?.message || `Error de red (${response.status})`,
      response.status,
      payload?.details
    );
  }

  return payload?.data;
}

export const http = {
  get: (path, params) => request(path, { method: 'GET', params }),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  postForm: (path, formData) => requestForm(path, formData),
};

export { HttpError };
