const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export const setAuthToken = (token) => {
    if (token) {
        sessionStorage.setItem('token', token);
    }
};

export const getAuthToken = () => sessionStorage.getItem('token');

export const clearAuthToken = () => {
    sessionStorage.removeItem('token');
};

export const apiFetch = async (path, options = {}) => {
    const token = getAuthToken();
    return fetch(`${API_BASE}${path.startsWith('/') ? path : `/${path}`}`, {
        ...options,
        headers: {
            ...(options.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
};

export const readJsonOrText = async (response) => {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        return response.json();
    }

    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
};
