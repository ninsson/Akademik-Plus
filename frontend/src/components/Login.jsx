import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { apiFetch, readJsonOrText, setAuthToken, requestPasswordReset } from '../api';

const PasswordEyeIcon = ({ show }) => (
    show ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
            <line x1="2" y1="2" x2="22" y2="22"></line>
        </svg>
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        </svg>
    )
);

const decodeJwt = (token) => {
    try {
        const parts = token.split('.');
        if (parts.length < 2) return null;
        const payload = parts[1];
        const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        return json;
    } catch {
        return null;
    }
};

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Stany dla modala resetowania hasła
    const [isResetOpen, setIsResetOpen] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [resetMessage, setResetMessage] = useState('');
    const [resetError, setResetError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await apiFetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const body = await readJsonOrText(res);
            if (!res.ok) {
                setError(typeof body === 'string' ? body : body?.error || `Status ${res.status}`);
                return;
            }

            if (!body?.token) {
                setError('Brak tokena w odpowiedzi');
                return;
            }

            setAuthToken(body.token);

            let role = body.rola || body.role || '';
            if (!role) {
                const claims = decodeJwt(body.token);
                role = claims?.rola || claims?.role || '';
            }

            if (role) {
                sessionStorage.setItem('userRole', role);
            }

            console.log('Zalogowano, token zapisany w sessionStorage.');

            const roleLower = role.toString().toLowerCase();
            if (roleLower.includes('admin')) {
                navigate('/admin', { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Błąd logowania');
        } finally {
            setLoading(false);
        }
    };

    const openReset = () => {
        setResetEmail('');
        setResetMessage('');
        setResetError('');
        setIsResetOpen(true);
    };

    const closeReset = () => {
        if (resetLoading) return;
        setIsResetOpen(false);
    };

    const handleRequestReset = async (e) => {
        e?.preventDefault?.();
        setResetError('');
        setResetMessage('');
        if (!resetEmail || !resetEmail.includes('@')) {
            setResetError('Podaj poprawny adres e-mail');
            return;
        }
        setResetLoading(true);
        try {
            const body = await requestPasswordReset(resetEmail);
            if (body?.token) {
                setResetMessage('Token resetujący (tryb developerski): ' + body.token);
            } else {
                setResetMessage(body?.message || 'Jeśli adres istnieje, otrzymasz instrukcję na e-mail.');
            }
        } catch (err) {
            setResetError(err.message || 'Błąd wysyłania prośby');
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="title">Akademik+</h1>
                <p className="subtitle">Zaloguj się do systemu</p>

                <form className="form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Adres e-mail</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Podaj adres e-mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group password-group">
                        <label htmlFor="password">Hasło</label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                placeholder="Podaj hasło"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword((s) => !s)}
                                aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                            >
                                <PasswordEyeIcon show={showPassword} />
                            </button>
                        </div>
                    </div>

                    {error && <div className="error-message" role="alert">{error}</div>}

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Logowanie...' : 'Zaloguj się'}
                    </button>
                </form>

                <button type="button" className="reset-btn" onClick={openReset}>
                    Zresetuj hasło
                </button>
            </div>

            {isResetOpen && (
                <div className="modal-overlay" onClick={closeReset}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Resetuj hasło</h3>
                        <form onSubmit={handleRequestReset}>
                            <label>
                                Podaj adres e-mail powiązany z kontem
                                <input
                                    type="email"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    autoFocus
                                    required
                                />
                            </label>
                            {resetError && <div className="form-error">{resetError}</div>}
                            {resetMessage && <div className="form-message">{resetMessage}</div>}
                            <div className="modal-actions">
                                <button type="button" className="secondary-btn" onClick={closeReset} disabled={resetLoading}>Anuluj</button>
                                <button type="submit" className="primary-btn" disabled={resetLoading}>
                                    {resetLoading ? 'Wysyłanie...' : 'Wyślij prośbę'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;