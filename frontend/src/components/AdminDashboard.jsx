import React, { useEffect, useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import { useNavigate } from 'react-router-dom';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell,
    BarChart, Bar
} from 'recharts';
import './AdminDashboard.css';
import { apiFetch, readJsonOrText, clearAuthToken } from '../api';

const fallbackAdminName = 'Administratorze';

const fallbackLineData = [
    { name: 'sty', free: 5, pending: 10, occupied: 85 },
    { name: 'lut', free: 2, pending: 8, occupied: 90 },
    { name: 'mar', free: 0, pending: 5, occupied: 95 },
    { name: 'kwi', free: 0, pending: 5, occupied: 95 },
    { name: 'maj', free: 0, pending: 5, occupied: 95 },
    { name: 'cze', free: 0, pending: 5, occupied: 95 },
    { name: 'lip', free: 20, pending: 0, occupied: 80 },
    { name: 'sie', free: 30, pending: 0, occupied: 70 },
    { name: 'wrz', free: 30, pending: 0, occupied: 70 },
    { name: 'paź', free: 0, pending: 20, occupied: 80 },
    { name: 'lis', free: 0, pending: 20, occupied: 80 },
    { name: 'gru', free: 0, pending: 20, occupied: 80 },
];

const fallbackPieData = [
    { name: 'Wolne', value: 2, color: '#1b6392' },
    { name: 'Oczekujące', value: 10, color: '#e87823' },
    { name: 'Zajęte', value: 88, color: '#1b6e2d' },
];

const fallbackBarData = [
    { name: '1-osobowe', usage: 20 },
    { name: '2-osobowe', usage: 70 },
    { name: '3-osobowe', usage: 10 },
];

const fallbackFaults = [
    { id: 1, desc: 'Pokój 204 - popsuty kran' },
    { id: 2, desc: 'Pokój 20 - zatkana toaleta' },
    { id: 3, desc: 'Pokój 47 - nieszczelne okno' },
    { id: 4, desc: 'Pokój 90 - wypalona żarówka' },
    { id: 5, desc: 'Pokój 77 - popsuty kran' },
    { id: 6, desc: 'Pokój 56 - gniazdko nie działa' },
];

const fallbackDebtors = [
    { id: 1, name: 'Jan Kowalski', room: '101', amount: 700 },
    { id: 2, name: 'Anna Nowak', room: '204', amount: 200 },
    { id: 3, name: 'Piotr Wiśniewski', room: '30', amount: 100 },
];

// Funkcja pomocnicza do usuwania polskich znaków z PDF
const removePolishChars = (text) => {
    if (!text) return '';
    const charMap = {
        'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
        'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N', 'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z'
    };
    return text.replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, match => charMap[match]);
};

const AdminDashboard = () => {
    const navigate = useNavigate();

    // Stany UI
    const [selectedFault, setSelectedFault] = useState(null);
    const [activeModal, setActiveModal] = useState(null);

    // Stany dat do raportu PDF
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Dane administracyjne z backendu
    const [adminName, setAdminName] = useState(fallbackAdminName);
    const [lineData, setLineData] = useState(fallbackLineData);
    const [pieData, setPieData] = useState(fallbackPieData);
    const [barData, setBarData] = useState(fallbackBarData);
    const [faults, setFaults] = useState(fallbackFaults);
    const [debtors, setDebtors] = useState(fallbackDebtors);

    // Dynamiczne obliczanie sumy długów
    const totalDebt = useMemo(() => debtors.reduce((sum, debtor) => sum + debtor.amount, 0), [debtors]);

    useEffect(() => {
        let mounted = true;

        const loadStats = async () => {
            try {
                const response = await apiFetch('/statystyki');
                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                        if (mounted) setAdminName(fallbackAdminName);
                    }
                    return;
                }

                const data = await readJsonOrText(response);
                if (!mounted || !data) return;

                setAdminName(data.adminName || data.nazwa_uzytkownika || fallbackAdminName);
                setLineData(data.lineData || data.oblozenie || data.raportOblozenia || fallbackLineData);
                setPieData(data.pieData || data.currentOccupation || data.oblozenieBiezace || fallbackPieData);
                setBarData(data.barData || data.roomStats || data.statystykiPokoi || fallbackBarData);
                setFaults(data.faults || data.usterki || fallbackFaults);
                setDebtors(data.debtors || data.debtorsList || data.zadluzenie || fallbackDebtors);
            } catch (err) {
                console.error('Admin stats load error:', err);
            }
        };

        loadStats();
        return () => {
            mounted = false;
        };
    }, []);

    const closeModal = () => setActiveModal(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Akcja zakończona sukcesem!');
        closeModal();
    };

    const handleGenerateReportPdf = () => {
        if (!startDate || !endDate) {
            alert('Proszę wybrać zakres dat od - do!');
            return;
        }

        const pdf = new jsPDF();
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(20);
        pdf.text('RAPORT FINANSOWO-ADMINISTRACYJNY', 20, 20);
        pdf.setFontSize(14);
        pdf.setTextColor(100, 100, 100);
        pdf.text('System Akademik+', 20, 30);
        pdf.setDrawColor(200, 200, 200);
        pdf.line(20, 35, 190, 35);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(12);
        pdf.text(`Okres raportu: ${startDate} do ${endDate}`, 20, 45);
        pdf.text(`Wygenerowano przez: ${removePolishChars(adminName)}`, 20, 52);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Podsumowanie ogolne:', 20, 65);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`- Suma zaleglych oplat: ${totalDebt.toFixed(2)} PLN`, 20, 72);
        pdf.text('- Srednie oblozenie: 88%', 20, 79);
        pdf.text(`- Nierozwiazane usterki: ${faults.length}`, 20, 86);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Lista dluznikow:', 20, 100);
        pdf.setFont('helvetica', 'normal');
        pdf.line(20, 103, 190, 103);

        let startY = 110;
        debtors.forEach((debtor, index) => {
            const cleanName = removePolishChars(debtor.name);
            pdf.text(`${index + 1}. ${cleanName} (Pokoj ${debtor.room}) - ${debtor.amount} PLN`, 20, startY);
            startY += 7;
        });

        pdf.line(20, startY + 3, 190, startY + 3);
        pdf.setTextColor(150, 150, 150);
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(10);
        pdf.text('Poufny dokument wewnetrzny. Nie udostepniac osobom trzecim.', 20, 280);
        pdf.save(`Raport_${startDate}_${endDate}.pdf`);
    };

    const handleLogout = () => {
        clearAuthToken();
        sessionStorage.removeItem('userRole');
        navigate('/');
    };

    return (
        <div className="admin-wrapper">
            <header className="admin-header">
                <h1 className="logo-text">Akademik+</h1>
                <h2 className="welcome-text">Witaj, {adminName}!</h2>
                <div className="header-actions">
                    <button className="secondary-btn" onClick={() => navigate('/history')}>Historia płatności</button>
                    <button className="secondary-btn" onClick={handleLogout}>Wyloguj</button>
                </div>
            </header>

            <div className="admin-grid">
                {/* KOLUMNA 1: Raport obłożenia */}
                <div className="admin-card line-card">
                    <h3 className="card-title">Raport obłożenia</h3>
                    <div className="recharts-container" style={{ width: '100%', height: 280, minHeight: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={lineData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} tickMargin={10} />
                                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(tick) => `${tick}%`} />
                                <Tooltip />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                                <Line type="linear" dataKey="free" stroke="#1b6392" strokeWidth={3} dot={false} />
                                <Line type="linear" dataKey="pending" stroke="#e87823" strokeWidth={3} dot={false} />
                                <Line type="linear" dataKey="occupied" stroke="#1b6e2d" strokeWidth={3} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* KOLUMNA 2: Obłożenie bieżące */}
                <div className="admin-card pie-card">
                    <h3 className="card-title">Obłożenie bieżące</h3>
                    <div className="recharts-container" style={{ width: '100%', height: 220, minHeight: 160 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={0} outerRadius={80} dataKey="value" stroke="none">
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value}%`} />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* KOLUMNA 3: Lista usterek */}
                <div className="admin-card faults-card">
                    <h3 className="card-title">Lista usterek</h3>
                    <div className="faults-list">
                        {faults.map((fault) => (
                            <div
                                key={fault.id}
                                className={`fault-item ${selectedFault === fault.id ? 'selected' : ''}`}
                                onClick={() => setSelectedFault(fault.id)}
                            >
                                {fault.desc}
                            </div>
                        ))}
                    </div>
                    <button className="primary-btn mt-auto" onClick={() => setActiveModal('resolveFault')}>
                        Rozwiąż usterkę
                    </button>
                </div>

                {/* KOLUMNA 1 (DÓŁ): Statystyki pokoi */}
                <div className="admin-card bar-chart-card">
                    <div className="bar-layout-wrapper">
                        <h3 className="card-title left-title">Statystyki<br/>wykorzystania<br/>pokoi</h3>
                        <div className="recharts-container" style={{ flexGrow: 1, width: '100%', height: 220, minHeight: 160 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(tick) => `${tick}%`} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(value) => `${value}%`} />
                                    <Bar dataKey="usage" fill="#1b6392" radius={[4, 4, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* KOLUMNA 2 (DÓŁ): Szybkie akcje */}
                <div className="admin-card actions-card">
                    <h3 className="card-title">Szybkie akcje</h3>
                    <div className="action-buttons">
                        <button className="primary-btn" onClick={() => setActiveModal('addStudent')}>Dodaj studenta</button>
                        <button className="primary-btn" onClick={() => setActiveModal('assignRoom')}>Przypisz pokój</button>
                        <button className="primary-btn" onClick={() => setActiveModal('changePrices')}>Zmień ceny</button>
                    </div>
                </div>

                {/* KOLUMNA 3 (DÓŁ): Podsumowanie finansowe */}
                <div className="admin-card finance-card">
                    <h3 className="card-title">Podsumowanie finansowe</h3>
                    <div className="finance-debt">
                        <span className="debt-label">zaległe opłaty:</span>
                        <span className="debt-amount">{totalDebt} zł</span>
                    </div>
                    <div className="date-pickers">
                        <input type="date" className="date-input" title="Okres od" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        <input type="date" className="date-input" title="Okres do" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                    <button className="primary-btn mt-auto" onClick={handleGenerateReportPdf}>
                        Wygeneruj raport PDF
                    </button>
                </div>
            </div>

            {/* OVLERALY I MODALE (POPUPY) */}
            {activeModal && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-content">

                        {/* Wariant: Dodaj studenta (Tabela: Uzytkownicy) */}
                        {activeModal === 'addStudent' && (
                            <form onSubmit={handleSubmit}>
                                <h2>Dodaj nowego użytkownika</h2>

                                <div className="form-group-row">
                                    <div className="form-group">
                                        <label>Imię:</label>
                                        <input type="text" name="imie" required placeholder="Wpisz imię" />
                                    </div>
                                    <div className="form-group">
                                        <label>Nazwisko:</label>
                                        <input type="text" name="nazwisko" required placeholder="Wpisz nazwisko" />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Email:</label>
                                    <input type="email" name="email" required placeholder="np. jan@domena.pl" />
                                </div>

                                <div className="form-group">
                                    <label>Numer telefonu:</label>
                                    <input type="tel" name="numer_telefonu" required placeholder="np. 123456789" />
                                </div>

                                <div className="form-group-row">
                                    <div className="form-group">
                                        <label>Username (Login):</label>
                                        <input type="text" name="username" required placeholder="np. jankowalski" />
                                    </div>
                                    <div className="form-group">
                                        <label>Hasło:</label>
                                        <input type="password" name="password_hash" required placeholder="Wpisz hasło" />
                                    </div>
                                </div>

                                {/* Pole boolean z bazy danych */}
                                <div className="form-group checkbox-group">
                                    <input type="checkbox" id="czy_wymaga_dostosowan" name="czy_wymaga_dostosowan" />
                                    <label htmlFor="czy_wymaga_dostosowan">Wymaga dostosowań (niepełnosprawność)</label>
                                </div>

                                <div className="modal-buttons">
                                    <button type="button" className="cancel-btn" onClick={closeModal}>Anuluj</button>
                                    <button type="submit" className="confirm-btn">Dodaj studenta</button>
                                </div>
                            </form>
                        )}

                        {/* Wariant: Przypisz pokój (Tabela: Zakwaterowania) */}
                        {activeModal === 'assignRoom' && (
                            <form onSubmit={handleSubmit}>
                                <h2>Zakwaterowanie</h2>
                                <div className="form-group">
                                    <label>Mieszkaniec (mieszkaniec_id):</label>
                                    <select name="mieszkaniec_id" required>
                                        <option value="">-- Wybierz użytkownika --</option>
                                        <option value="1">Jan Kowalski</option>
                                        <option value="2">Anna Nowak</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Pokój (pokoj_id):</label>
                                    <select name="pokoj_id" required>
                                        <option value="">-- Wybierz dostępny pokój --</option>
                                        <option value="101">Pokój 101</option>
                                        <option value="105">Pokój 105</option>
                                    </select>
                                </div>

                                <div className="form-group-row">
                                    <div className="form-group">
                                        <label>Początek zakwaterowania:</label>
                                        <input type="date" name="poczatek_zakwaterowania" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Koniec zakwaterowania:</label>
                                        <input type="date" name="koniec_zakwaterowania" />
                                    </div>
                                </div>

                                <div className="modal-buttons">
                                    <button type="button" className="cancel-btn" onClick={closeModal}>Anuluj</button>
                                    <button type="submit" className="confirm-btn">Przypisz pokój</button>
                                </div>
                            </form>
                        )}

                        {/* Wariant: Zmień ceny (Tabela: Cennik) */}
                        {activeModal === 'changePrices' && (
                            <form onSubmit={handleSubmit}>
                                <h2>Zmiana cen</h2>
                                <div className="form-group-row">
                                    <div className="form-group">
                                        <label>Cena 1-osobowy:</label>
                                        <input type="number" name="cena_1os" required placeholder="np. 800" />
                                    </div>
                                    <div className="form-group">
                                        <label>Cena 2-osobowy:</label>
                                        <input type="number" name="cena_2os" required placeholder="np. 700" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Cena 3-osobowy:</label>
                                    <input type="number" name="cena_3os" required placeholder="np. 600" />
                                </div>
                                <div className="modal-buttons">
                                    <button type="button" className="cancel-btn" onClick={closeModal}>Anuluj</button>
                                    <button type="submit" className="confirm-btn">Zapisz zmiany</button>
                                </div>
                            </form>
                        )}

                        {/* Wariant: Rozwiąż usterkę (Tabela: Usterki) */}
                        {activeModal === 'resolveFault' && (
                            <form onSubmit={handleSubmit}>
                                <h2>Rozwiązanie usterki</h2>
                                <p><strong>Wybrana usterka:</strong> {selectedFault ? faults.find(f => f.id === selectedFault)?.desc : 'Brak wyboru'}</p>
                                <div className="form-group">
                                    <label>Opis działania naprawczego:</label>
                                    <textarea rows="5" required placeholder="Opisz rozwiązanie"></textarea>
                                </div>
                                <div className="modal-buttons">
                                    <button type="button" className="cancel-btn" onClick={closeModal}>Anuluj</button>
                                    <button type="submit" className="confirm-btn">Zamknij usterkę</button>
                                </div>
                            </form>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
