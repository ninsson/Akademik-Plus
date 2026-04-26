import React, { useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell,
    BarChart, Bar
} from 'recharts';
import './AdminDashboard.css';

// ==========================================
// MOCKI DANYCH DLA RECHARTS
// ==========================================
const mockAdminName = "Administratorze";

// Dane do wykresu liniowego
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

// Dane do wykresu kołowego
const mockPieData = [
    { name: 'Wolne', value: 2, color: '#1b6392' },
    { name: 'Oczekujące', value: 10, color: '#e87823' },
    { name: 'Zajęte', value: 88, color: '#1b6e2d' },
];

// Dane do wykresu słupkowego
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
// ==========================================

const AdminDashboard = () => {
    const [selectedFault, setSelectedFault] = useState(null);

    const handleAction = (actionName) => {
        console.log(`Wywołano akcję: ${actionName}`);
    };

    return (
        <div className="admin-wrapper">
            <header className="admin-header">
                <h1 className="logo-text">Akademik+</h1>
                <h2 className="welcome-text">Witaj, {mockAdminName}!</h2>
            </header>

            <div className="admin-grid">

                {/* KOLUMNA 1: Raport obłożenia (Wykres Liniowy Recharts) */}
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

                {/* KOLUMNA 2: Obłożenie bieżące (Wykres Kołowy Recharts) */}
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
                    <button className="primary-btn mt-auto" onClick={() => handleAction('Rozwiąż usterkę')}>
                        Rozwiąż usterkę
                    </button>
                </div>

                {/* KOLUMNA 1 (DÓŁ): Statystyki pokoi (Wykres Słupkowy Recharts) */}
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
                        <button className="primary-btn" onClick={() => handleAction('Dodaj studenta')}>Dodaj studenta</button>
                        <button className="primary-btn" onClick={() => handleAction('Przypisz pokój')}>Przypisz pokój</button>
                        <button className="primary-btn" onClick={() => handleAction('Zmień ceny')}>Zmień ceny</button>
                    </div>
                </div>

                {/* KOLUMNA 3 (DÓŁ): Podsumowanie finansowe */}
                <div className="admin-card finance-card">
                    <h3 className="card-title">Podsumowanie finansowe</h3>
                    <div className="finance-debt">
                        <span className="debt-label">zaległe opłaty:</span>
                        <span className="debt-amount">1000zł</span>
                    </div>
                    <div className="date-pickers">
                        <input type="date" className="date-input" title="Okres od" />
                        <input type="date" className="date-input" title="Okres do" />
                    </div>
                    <button className="primary-btn mt-auto" onClick={() => handleAction('Wygeneruj raport PDF')}>
                        Wygeneruj raport PDF
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;