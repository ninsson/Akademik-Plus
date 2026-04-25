import { useState } from 'react';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Weź URL API z env (Vite)
    const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                // spróbuj odczytać odpowiedź z serwera
                let text;
                try {
                    text = await res.text();
                } catch {
                    text = 'Błąd logowania';
                }
                throw new Error(text || `Status ${res.status}`);
            }

            const data = await res.json(); // oczekujemy { token: "..." }
            if (!data.token) throw new Error('Brak tokena w odpowiedzi');

            // Zapis tokena
            localStorage.setItem('token', data.token);

            // opcjonalnie: możesz przekierować użytkownika dalej
            // window.location.href = '/dashboard';
            console.log('Zalogowano, token zapisany.');

            // wyczyść pola / odznacz loading
            setEmail('');
            setPassword('');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Błąd logowania');
        } finally {
            setLoading(false);
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

                    <div className="input-group">
                        <label htmlFor="password">Hasło</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Podaj hasło"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className="error-message" role="alert">{error}</div>}

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Logowanie...' : 'Zaloguj się'}
                    </button>
                </form>

                <button type="button" className="reset-btn">
                    Zresetuj hasło
                </button>
            </div>
        </div>
    );
};

export default Login;