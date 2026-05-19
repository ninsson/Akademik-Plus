import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import roomImg from '../assets/room.png';
import { apiFetch, readJsonOrText, clearAuthToken } from '../api';

const fallbackUserData = { name: 'Jan Kowalski' };

const fallbackPayments = [
    { id: 1, date: '10-05-2026', desc: 'Opłata za pokój 101, maj 2026', amount: 700, status: 'NIEOPŁACONE' },
    { id: 2, date: '10-04-2026', desc: 'Opłata za pokój 101, kwiecień 2026', amount: 700, status: 'OPŁACONE' },
    { id: 3, date: '10-03-2026', desc: 'Opłata za pokój 101, marzec 2026', amount: 700, status: 'OPŁACONE' },
    { id: 4, date: '10-02-2026', desc: 'Opłata za pokój 101, luty 2026', amount: 700, status: 'OPŁACONE' },
    { id: 5, date: '10-01-2026', desc: 'Opłata za pokój 101, styczeń 2026', amount: 700, status: 'OPŁACONE' },
    { id: 6, date: '10-12-2025', desc: 'Opłata za pokój 101, grudzień 2025', amount: 700, status: 'OPŁACONE' },
    { id: 7, date: '10-11-2025', desc: 'Opłata za pokój 101, listopad 2025', amount: 700, status: 'OPŁACONE' },
];

const fallbackResidenceHistory = [
    { id: 1, dorm: '3 Dom Studencki', room: 'Pokój 101', date: 'od 01-10-2025', isCurrent: true },
    { id: 2, dorm: '3 Dom Studencki', room: 'Pokój 30', date: '01-10-2024 - 30-09-2025', isCurrent: false },
    { id: 3, dorm: '3 Dom Studencki', room: 'Pokój 47', date: '01-10-2023 - 30-09-2024', isCurrent: false },
    { id: 4, dorm: '1 Dom Studencki', room: 'Pokój 202', date: '01-10-2022 - 30-09-2023', isCurrent: false },
];

const fallbackRoomDetails = { type: 'Pokój standardowy', number: '101', dorm: '3 Dom Studencki' };

const mapPayment = (payment) => ({
    id: payment.id ?? payment.numer_rachunku ?? `${payment.data || payment.date}-${payment.opis || payment.desc}`,
    date: payment.data_wystawienia || payment.data || payment.date || '',
    desc: payment.dodatkowe_uwagi || payment.okres_rozliczeniowy || payment.opis || payment.desc || '',
    amount: Number(payment.kwota ?? payment.amount ?? 0),
    status: payment.czy_oplacone === true || payment.oplacone === true || payment.status === 'OPŁACONE' ? 'OPŁACONE' : 'NIEOPŁACONE',
});

const Dashboard = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(fallbackUserData);
    const [payments, setPayments] = useState(fallbackPayments);
    const [residenceHistory, setResidenceHistory] = useState(fallbackResidenceHistory);
    const [roomDetails, setRoomDetails] = useState(fallbackRoomDetails);
    const [faultForm, setFaultForm] = useState({ roomNumber: '', category: '', description: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;

        const loadDashboard = async () => {
            setLoading(true);
            setError('');

            try {
                const [paymentsRes, residenceRes] = await Promise.all([
                    apiFetch('/rachunki/moje'),
                    apiFetch('/zakwaterowania/moje'),
                ]);

                if (paymentsRes.ok) {
                    const data = await readJsonOrText(paymentsRes);
                    const items = Array.isArray(data) ? data : data?.rachunki || data?.items || [];
                    if (mounted && items.length) setPayments(items.map(mapPayment));
                } else if (paymentsRes.status === 401 || paymentsRes.status === 403) {
                    if (mounted) setError('Brak dostępu do rachunków. Zaloguj się ponownie.');
                }

                if (residenceRes.ok) {
                    const data = await readJsonOrText(residenceRes);
                    const item = Array.isArray(data) ? data[0] : data;
                    if (mounted && item) {
                        setResidenceHistory([
                            {
                                id: item.id || 1,
                                dorm: item.akademik_nazwa || item.akademik || fallbackResidenceHistory[0].dorm,
                                room: item.numer_pokoju ? `Pokój ${item.numer_pokoju}` : item.numer_pokoju === '' ? fallbackResidenceHistory[0].room : `Pokój ${item.numer_pokoju || item.pokoj_numer || fallbackRoomDetails.number}`,
                                date: item.poczatek_zakwaterowania ? `od ${item.poczatek_zakwaterowania}` : fallbackResidenceHistory[0].date,
                                isCurrent: true,
                            },
                        ]);

                        setRoomDetails({
                            type: item.standard || fallbackRoomDetails.type,
                            number: String(item.numer_pokoju || item.pokoj_numer || fallbackRoomDetails.number),
                            dorm: item.akademik_nazwa || item.akademik || fallbackRoomDetails.dorm,
                        });
                        setUserData({ name: item.mieszkaniec_imie_nazwisko || fallbackUserData.name });
                        if (!faultForm.roomNumber && (item.numer_pokoju || item.pokoj_numer)) {
                            setFaultForm((prev) => ({ ...prev, roomNumber: String(item.numer_pokoju || item.pokoj_numer) }));
                        }
                    }
                } else if (residenceRes.status === 401 || residenceRes.status === 403) {
                    if (mounted) setError((prev) => prev || 'Brak dostępu do historii zakwaterowań.');
                } else if (residenceRes.status >= 500) {
                    if (mounted) setError((prev) => prev || 'Błąd serwera przy pobieraniu zakwaterowania. Pokazuję dane zapasowe.');
                }
            } catch (err) {
                console.error('Dashboard load error:', err);
                if (mounted) setError('Nie udało się pobrać danych z API. Wyświetlam dane zapasowe.');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        loadDashboard();
        return () => { mounted = false; };
    }, []);

    const handleFaultSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await apiFetch('/usterki', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(faultForm),
            });

            if (!response.ok) {
                const body = await readJsonOrText(response);
                alert(typeof body === 'string' ? body : body?.error || 'Nie udało się zgłosić usterki');
                return;
            }

            setFaultForm((prev) => ({ ...prev, category: '', description: '' }));
            alert('Usterka została zgłoszona.');
        } catch (err) {
            console.error('Fault submit error:', err);
            alert(err.message || 'Nie udało się zgłosić usterki');
        }
    };

    const handleLogout = () => {
        clearAuthToken();
        sessionStorage.removeItem('userRole');
        navigate('/');
    };

    return (
        <div className="dashboard-wrapper">
            <header className="dashboard-header">
                <h1 className="logo-text">Akademik+</h1>
                <h2 className="welcome-text">Witaj, {userData.name}!</h2>
                <div className="header-actions">
                    <button className="secondary-btn" onClick={() => navigate('/history')}>Historia płatności</button>
                    <button className="secondary-btn" onClick={handleLogout}>Wyloguj</button>
                </div>
            </header>

            {error && <div className="error-message" role="alert">{error}</div>}
            {loading && <div className="loading-message">Ładowanie danych z API...</div>}

            <div className="dashboard-grid">
                <div className="card panel-payments">
                    <h3 className="card-title">Historia opłat</h3>
                    <div className="table-container">
                        <table className="payments-table">
                            <thead>
                            <tr>
                                <th>Data</th>
                                <th>Opis płatności</th>
                                <th>Kwota</th>
                                <th>Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {payments.map((payment) => (
                                <tr key={payment.id}>
                                    <td>{payment.date}</td>
                                    <td>{payment.desc}</td>
                                    <td>{payment.amount} zł</td>
                                    <td>
                                        <span className={`status-badge ${payment.status === 'OPŁACONE' ? 'paid' : 'unpaid'}`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    <button className="primary-btn mt-auto" onClick={() => navigate('/history')} disabled={!payments.some((payment) => payment.status !== 'OPŁACONE')}>
                        Dokonaj płatności
                    </button>
                </div>

                <div className="card panel-history">
                    <h3 className="card-title">Historia zamieszkania</h3>
                    <div className="timeline">
                        {residenceHistory.map((item) => (
                            <div key={item.id} className="timeline-item">
                                <div className={`timeline-dot ${item.isCurrent ? 'current' : ''}`}></div>
                                <div className="timeline-content">
                                    <strong>{item.dorm}</strong><br />
                                    {item.room}<br />
                                    <span className="timeline-date">{item.date}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card panel-room">
                    <h3 className="card-title">Mój pokój</h3>
                    <div className="room-info">
                        <div className="room-image-placeholder">
                            <img src={roomImg} alt="Pokój" className="room-image" />
                        </div>
                        <div className="room-details">
                            {roomDetails.type},<br />
                            numer {roomDetails.number},<br />
                            {roomDetails.dorm}
                        </div>
                    </div>
                </div>

                <div className="card panel-fault">
                    <h3 className="card-title">Zgłoszenie usterki</h3>
                    <form className="fault-form" onSubmit={handleFaultSubmit}>
                        <input
                            type="text"
                            placeholder="Podaj numer pokoju"
                            value={faultForm.roomNumber}
                            onChange={(e) => setFaultForm({ ...faultForm, roomNumber: e.target.value })}
                        />

                        <select
                            value={faultForm.category}
                            onChange={(e) => setFaultForm({ ...faultForm, category: e.target.value })}
                        >
                            <option value="" disabled>Wybierz kategorię usterki</option>
                            <option value="hydraulika">Hydraulika</option>
                            <option value="elektryka">Elektryka</option>
                            <option value="meble">Meble/Wyposażenie</option>
                            <option value="inne">Inne</option>
                        </select>

                        <textarea
                            placeholder="Opisz usterkę"
                            rows="8"
                            value={faultForm.description}
                            onChange={(e) => setFaultForm({ ...faultForm, description: e.target.value })}
                        ></textarea>

                        <button type="submit" className="primary-btn mt-auto">Zgłoś usterkę</button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
