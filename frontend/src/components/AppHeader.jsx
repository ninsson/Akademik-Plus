import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { clearAuthToken } from '../api';
import { changeMyPassword } from '../api';
import './AppHeader.css';

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

    // Stany dla haseł
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        setShowOldPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
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
                                <div className="password-wrapper">
                                    <input
                                        type={showOldPassword ? 'text' : 'password'}
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowOldPassword((s) => !s)}
                                        aria-label={showOldPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                                    >
                                        <PasswordEyeIcon show={showOldPassword} />
                                    </button>
                                </div>
                            </label>

                            <label>
                                Nowe hasło
                                <div className="password-wrapper">
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowNewPassword((s) => !s)}
                                        aria-label={showNewPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                                    >
                                        <PasswordEyeIcon show={showNewPassword} />
                                    </button>
                                </div>
                            </label>

                            <label>
                                Potwierdź nowe hasło
                                <div className="password-wrapper">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowConfirmPassword((s) => !s)}
                                        aria-label={showConfirmPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                                    >
                                        <PasswordEyeIcon show={showConfirmPassword} />
                                    </button>
                                </div>
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