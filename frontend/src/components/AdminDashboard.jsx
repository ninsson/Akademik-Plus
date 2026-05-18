import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell,
    BarChart, Bar
} from 'recharts';
import './AdminDashboard.css';

// ==========================================
// MOCKI DANYCH DLA RECHARTS I RAPORTÓW
// ==========================================
const mockAdminName = "Administratorze";

const mockLineData = [
    { name: 'sty', wolne: 5, oczekujące: 10, zajęte: 85 },
    { name: 'lut', wolne: 2, oczekujące: 8, zajęte: 90 },
    { name: 'mar', wolne: 0, oczekujące: 5, zajęte: 95 },
    { name: 'kwi', wolne: 0, oczekujące: 5, zajęte: 95 },
    { name: 'maj', wolne: 0, oczekujące: 5, zajęte: 95 },
    { name: 'cze', wolne: 0, oczekujące: 5, zajęte: 95 },
    { name: 'lip', wolne: 20, oczekujące: 0, zajęte: 80 },
    { name: 'sie', wolne: 30, oczekujące: 0, zajęte: 70 },
    { name: 'wrz', wolne: 30, oczekujące: 0, zajęte: 70 },
    { name: 'paź', wolne: 0, oczekujące: 20, zajęte: 80 },
    { name: 'lis', wolne: 0, oczekujące: 20, zajęte: 80 },
    { name: 'gru', wolne: 0, oczekujące: 20, zajęte: 80 },
];

const mockPieData = [
    { name: 'Wolne', value: 2, color: '#1b6392' },
    { name: 'Oczekujące', value: 10, color: '#e87823' },
    { name: 'Zajęte', value: 88, color: '#1b6e2d' },
];

const mockBarData = [
    { name: '1-osobowe', usage: 20 },
    { name: '2-osobowe', usage: 70 },
    { name: '3-osobowe', usage: 10 },
];

const mockFaults = [
    { id: 1, desc: "Pokój 204 - popsuty kran" },
    { id: 2, desc: "Pokój 20 - zatkana toaleta" },
    { id: 3, desc: "Pokój 47 - nieszczelne okno" },
    { id: 4, desc: "Pokój 90 - wypalona żarówka" },
    { id: 5, desc: "Pokój 77 - popsuty kran" },
    { id: 6, desc: "Pokój 56 - gniazdko nie działa" },
];

const mockDebtors = [
    { id: 1, name: "Jan Kowalski", room: "101", amount: 700 },
    { id: 2, name: "Anna Nowak", room: "204", amount: 200 },
    { id: 3, name: "Piotr Wiśniewski", room: "30", amount: 100 },
];
// ==========================================

// Funkcja pomocnicza do usuwania polskich znaków z PDF
const removePolishChars = (text) => {
    if (!text) return "";
    const charMap = {
        'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
        'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N', 'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z'
    };
    return text.replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, match => charMap[match]);
};

const AdminDashboard = () => {
    // Stany UI
    const [selectedFault, setSelectedFault] = useState(null);
    const [activeModal, setActiveModal] = useState(null);

    // Stany dat do raportu PDF
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Dynamiczne obliczanie sumy długów
    const totalDebt = mockDebtors.reduce((sum, debtor) => sum + debtor.amount, 0);

    const handleAction = (actionName) => {
        console.log(`Wywołano akcję: ${actionName}`);
    };

    const closeModal = () => setActiveModal(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Akcja zakończona sukcesem!");
        closeModal();
    };

    const handleGenerateReportPdf = () => {
        if (!startDate || !endDate) {
            alert("Proszę wybrać zakres dat od - do!");
            return;
        }

        const doc = new jsPDF();

        // Nagłówek raportu
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.text("RAPORT FINANSOWO-ADMINISTRACYJNY", 20, 20);

        doc.setFontSize(14);
        doc.setTextColor(100, 100, 100);
        doc.text("System Akademik+", 20, 30);

        doc.setDrawColor(200, 200, 200);
        doc.line(20, 35, 190, 35);

        // Szczegóły okresu
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text(`Okres raportu: ${startDate} do ${endDate}`, 20, 45);
        doc.text(`Wygenerowano przez: ${removePolishChars(mockAdminName)}`, 20, 52);

        // Podsumowanie statystyk
        doc.setFont("helvetica", "bold");
        doc.text("Podsumowanie ogolne:", 20, 65);
        doc.setFont("helvetica", "normal");
        doc.text(`- Suma zaleglych oplat: ${totalDebt.toFixed(2)} PLN`, 20, 72);
        doc.text("- Srednie oblozenie: 88%", 20, 79);
        doc.text(`- Nierozwiazane usterki: ${mockFaults.length}`, 20, 86);

        // Lista dłużników mapowana z mockDebtors
        doc.setFont("helvetica", "bold");
        doc.text("Lista dluznikow:", 20, 100);

        doc.setFont("helvetica", "normal");
        doc.line(20, 103, 190, 103);

        let startY = 110;
        mockDebtors.forEach((debtor, index) => {
            const cleanName = removePolishChars(debtor.name);
            doc.text(`${index + 1}. ${cleanName} (Pokoj ${debtor.room}) - ${debtor.amount} PLN`, 20, startY);
            startY += 7; // Zwiększenie odstępu dla kolejnego wiersza
        });

        doc.line(20, startY + 3, 190, startY + 3);

        // Stopka
        doc.setTextColor(150, 150, 150);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.text("Poufny dokument wewnetrzny. Nie udostepniac osobom trzecim.", 20, 280);

        // Zapis pliku
        doc.save(`Raport_${startDate}_${endDate}.pdf`);
    };

    return (
        <div className="admin-wrapper">
            <header className="admin-header">
                <h1 className="logo-text">Akademik+</h1>
                <h2 className="welcome-text">Witaj, {mockAdminName}!</h2>
            </header>

            <div className="admin-grid">
                {/* KOLUMNA 1: Raport obłożenia */}
                <div className="admin-card line-card">
                    <h3 className="card-title">Raport obłożenia</h3>
                    <div className="recharts-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={mockLineData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} tickMargin={10} />
                                <YAxis tick={{fontSize: 12, fill: '#64748b'}} tickFormatter={(tick) => `${tick}%`} />
                                <Tooltip />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                                <Line type="linear" dataKey="wolne" stroke="#1b6392" strokeWidth={3} dot={false} />
                                <Line type="linear" dataKey="oczekujące" stroke="#e87823" strokeWidth={3} dot={false} />
                                <Line type="linear" dataKey="zajęte" stroke="#1b6e2d" strokeWidth={3} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* KOLUMNA 2: Obłożenie bieżące */}
                <div className="admin-card pie-card">
                    <h3 className="card-title">Obłożenie bieżące</h3>
                    <div className="recharts-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={mockPieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={0}
                                    outerRadius={80}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {mockPieData.map((entry, index) => (
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
                        {mockFaults.map((fault) => (
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
                        <div className="recharts-container" style={{ flexGrow: 1 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={mockBarData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" tick={{fontSize: 11, fill: '#64748b'}} />
                                    <YAxis tick={{fontSize: 11, fill: '#64748b'}} tickFormatter={(tick) => `${tick}%`} />
                                    <Tooltip cursor={{fill: '#f8fafc'}} formatter={(value) => `${value}%`} />
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
                        <input
                            type="date"
                            className="date-input"
                            title="Okres od"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <input
                            type="date"
                            className="date-input"
                            title="Okres do"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
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
                                        <input type="date" name="koniec_zakwaterowania" required />
                                    </div>
                                </div>

                                <div className="modal-buttons">
                                    <button type="button" className="cancel-btn" onClick={closeModal}>Anuluj</button>
                                    <button type="submit" className="confirm-btn">Zapisz</button>
                                </div>
                            </form>
                        )}

                        {/* Wariant: Zmień ceny (Tabela: Cennik) */}
                        {activeModal === 'changePrices' && (
                            <form onSubmit={handleSubmit}>
                                <h2>Zarządzanie Cennikiem</h2>
                                <p className="modal-subtitle">Ustal kwoty (decimal) na podstawie standardu pokoju</p>

                                <div className="form-group">
                                    <label>Standard: Podstawowy (PLN):</label>
                                    <input type="number" step="0.01" name="kwota_podstawowy" defaultValue={700.00} required />
                                </div>
                                <div className="form-group">
                                    <label>Standard: Podwyższony (PLN):</label>
                                    <input type="number" step="0.01" name="kwota_podwyzszony" defaultValue={900.00} required />
                                </div>

                                <div className="modal-buttons">
                                    <button type="button" className="cancel-btn" onClick={closeModal}>Anuluj</button>
                                    <button type="submit" className="confirm-btn">Aktualizuj cennik</button>
                                </div>
                            </form>
                        )}

                        {/* Wariant: Rozwiąż usterkę (Tabela: Usterki) */}
                        {activeModal === 'resolveFault' && (
                            <form onSubmit={handleSubmit}>
                                <h2>Rozwiąż usterkę</h2>

                                <div className="form-group">
                                    <label>Wybierz usterkę do rozwiązania:</label>
                                    <select name="usterka_id" defaultValue={selectedFault || ""} required>
                                        <option value="" disabled>-- Wybierz usterkę z listy --</option>
                                        {mockFaults.map(fault => (
                                            <option key={fault.id} value={fault.id}>
                                                {fault.desc}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Przypisz administratora / konserwatora:</label>
                                    <select name="przypisany_administrator_id" required>
                                        <option value="">-- Wybierz pracownika --</option>
                                        <option value="1">Adam Kowal (Złota rączka)</option>
                                        <option value="2">Tomasz Nowak (Elektryk)</option>
                                    </select>
                                </div>

                                <div className="form-group-row">
                                    <div className="form-group">
                                        <label>Data rozwiązania:</label>
                                        <input type="date" name="data_rozwiazania_date" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Godzina:</label>
                                        <input type="time" name="data_rozwiazania_time" required />
                                    </div>
                                </div>

                                <div className="modal-buttons">
                                    <button type="button" className="cancel-btn" onClick={closeModal}>Anuluj</button>
                                    <button type="submit" className="confirm-btn">Zapisz i przypisz</button>
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