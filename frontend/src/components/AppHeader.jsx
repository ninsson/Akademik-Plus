import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { clearAuthToken } from '../api';
import { changeMyPassword } from '../api'; // import funkcji zmiany hasła
import './AppHeader.css';

const roleLinks = {
    mieszkaniec: [
        { to: '/dashboard', label: 'Panel mieszkańca' },
        { to: '/history', label: 'Historia płatności' },
    ],
    administrator: [
        { to: '/admin', label: 'Panel administratora' },
        { to: '/history', label: 'Rozliczenia' },
    ],
};

const AppHeader = ({ role, greeting }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const links = useMemo(() => {
        const key = (role || '').toString().toLowerCase();
        return roleLinks[key] || roleLinks.mieszkaniec;
    }, [role]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogout = () => {
        clearAuthToken();
        sessionStorage.removeItem('userRole');
        navigate('/login', { replace: true });
    };

    const openChangePassword = () => {
        setError('');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setError('');
    };

    const handleChangePasswordSubmit = async (e) => {
        e?.preventDefault?.();
        setError('');
        if (!oldPassword || !newPassword || !confirmPassword) {
            setError('Wypełnij wszystkie pola');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Hasła nie są zgodne');
            return;
        }
        if (newPassword.length < 6) {
            setError('Hasło musi mieć co najmniej 6 znaków');
            return;
        }
        setLoading(true);
        try {
            await changeMyPassword(oldPassword, newPassword, confirmPassword);
            // po zmianie hasła wyloguj i poproś o ponowne logowanie
            alert('Hasło zmienione pomyślnie. Zostaniesz wylogowany, zaloguj się ponownie.');
            clearAuthToken();
            sessionStorage.removeItem('userRole');
            navigate('/login', { replace: true });
        } catch (err) {
            setError(err.message || 'Błąd podczas zmiany hasła');
        } finally {
            setLoading(false);
        }
    };

    return (
        <header className="app-header">
            <div className="app-header-brand">
                <h1 className="app-logo-text">Akademik+</h1>
                {greeting ? <h2 className="app-welcome-text">{greeting}</h2> : null}
            </div>
            <div className="app-header-actions">
                {links.map((link) => (
                    <button
                        key={link.to}
                        className={`secondary-btn ${location.pathname === link.to ? 'active' : ''}`}
                        onClick={() => navigate(link.to)}
                    >
                        {link.label}
                    </button>
                ))}
                <button className="secondary-btn" onClick={openChangePassword}>Zmień hasło</button>
                <button className="secondary-btn" onClick={handleLogout}>Wyloguj</button>
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Zmień hasło</h3>
                        <form onSubmit={handleChangePasswordSubmit}>
                            <label>
                                Stare hasło
                                <input
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    autoFocus
                                />
                            </label>
                            <label>
                                Nowe hasło
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </label>
                            <label>
                                Potwierdź nowe hasło
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </label>
                            {error && <div className="form-error">{error}</div>}
                            <div className="modal-actions">
                                <button type="button" className="secondary-btn" onClick={closeModal} disabled={loading}>Anuluj</button>
                                <button type="submit" className="primary-btn" disabled={loading}>
                                    {loading ? 'Trwa zmiana...' : 'Zmień hasło'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </header>
    );
};

export default AppHeader;