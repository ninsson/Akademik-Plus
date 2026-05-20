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

export async function changeMyPassword(oldPassword, newPassword, confirm) {
    if (newPassword !== confirm) throw new Error('Hasła nie zgadzają się');
    if ((newPassword || '').length < 6) throw new Error('Hasło musi mieć co najmniej 6 znaków');
    const res = await apiFetch('/uzytkownicy/haslo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            stare_haslo: oldPassword,
            nowe_haslo: newPassword,
            potwierdzenie: confirm,
        }),
    });
    const body = await readJsonOrText(res);
    if (!res.ok) {
        throw new Error(typeof body === 'string' ? body : body?.error || `Status ${res.status}`);
    }
    return body;
}

export async function requestPasswordReset(email) {
    if (!email || !email.includes('@')) throw new Error('Podaj poprawny adres e-mail');
    const res = await apiFetch('/uzytkownicy/reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    const body = await readJsonOrText(res);
    if (!res.ok) {
        throw new Error(typeof body === 'string' ? body : body?.error || `Status ${res.status}`);
    }
    return body;
}
