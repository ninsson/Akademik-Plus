import { useState } from 'react';
import './Dashboard.css';
import roomImg from '../assets/room.png';

// ==========================================
// MOCKI DANYCH - to w przyszłości przyjdzie z backendu (np. przez fetch/axios)
// ==========================================
const mockUserData = {
    name: "Jan Kowalski"
};

const mockPayments = [
    { id: 1, date: "10-05-2026", desc: "Opłata za pokój 101, maj 2026", amount: 700, status: "NIEOPŁACONE" },
    { id: 2, date: "10-04-2026", desc: "Opłata za pokój 101, kwiecień 2026", amount: 700, status: "OPŁACONE" },
    { id: 3, date: "10-03-2026", desc: "Opłata za pokój 101, marzec 2026", amount: 700, status: "OPŁACONE" },
    { id: 4, date: "10-02-2026", desc: "Opłata za pokój 101, luty 2026", amount: 700, status: "OPŁACONE" },
    { id: 5, date: "10-01-2026", desc: "Opłata za pokój 101, styczeń 2026", amount: 700, status: "OPŁACONE" },
    { id: 6, date: "10-12-2025", desc: "Opłata za pokój 101, grudzień 2025", amount: 700, status: "OPŁACONE" },
    { id: 7, date: "10-11-2025", desc: "Opłata za pokój 101, listopad 2025", amount: 700, status: "OPŁACONE" },
];

const mockResidenceHistory = [
    { id: 1, dorm: "3 Dom Studencki", room: "Pokój 101", date: "od 01-10-2025", isCurrent: true },
    { id: 2, dorm: "3 Dom Studencki", room: "Pokój 30", date: "01-10-2024 - 30-09-2025", isCurrent: false },
    { id: 3, dorm: "3 Dom Studencki", room: "Pokój 47", date: "01-10-2023 - 30-09-2024", isCurrent: false },
    { id: 4, dorm: "1 Dom Studencki", room: "Pokój 202", date: "01-10-2022 - 30-09-2023", isCurrent: false },
];

const mockRoomDetails = {
    type: "Pokój standardowy",
    number: "101",
    dorm: "3 Dom Studencki",
    // imageUrl: "link_do_obrazka_z_backendu.png" // Odkomentujesz, gdy backend to obsłuży
};
// ==========================================

const Dashboard = () => {
    // Stan formularza zgłoszenia usterki (to wyślesz na backend)
    const [faultForm, setFaultForm] = useState({
        roomNumber: '',
        category: '',
        description: ''
    });

    const handleFaultSubmit = (e) => {
        e.preventDefault();
        console.log("Wysyłam zgłoszenie na backend:", faultForm);
        // Tutaj dodasz logikę wysyłania (np. fetch POST)
    };

    return (
        <div className="dashboard-wrapper">
            {/* NAGŁÓWEK */}
            <header className="dashboard-header">
                <h1 className="logo-text">Akademik+</h1>
                <h2 className="welcome-text">Witaj, {mockUserData.name}!</h2>
            </header>

            {/* GŁÓWNA SIATKA (GRID) */}
            <div className="dashboard-grid">

                {/* KOLUMNA 1: Historia opłat */}
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
                            {mockPayments.map((payment) => (
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
                    <button className="primary-btn mt-auto">Dokonaj płatności</button>
                </div>

                {/* KOLUMNA 2 (GÓRA): Historia zamieszkania */}
                <div className="card panel-history">
                    <h3 className="card-title">Historia zamieszkania</h3>
                    <div className="timeline">
                        {mockResidenceHistory.map((item) => (
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

                {/* KOLUMNA 2 (DÓŁ): Mój pokój */}
                <div className="card panel-room">
                    <h3 className="card-title">Mój pokój</h3>
                    <div className="room-info">
                        <div className="room-image-placeholder">
                            <img src={roomImg} alt="Pokój" className="room-image" />
                        </div>
                        <div className="room-details">
                            {mockRoomDetails.type},<br />
                            numer {mockRoomDetails.number},<br />
                            {mockRoomDetails.dorm}
                        </div>
                    </div>
                </div>

                {/* KOLUMNA 3: Zgłoszenie usterki */}
                <div className="card panel-fault">
                    <h3 className="card-title">Zgłoszenie usterki</h3>
                    <form className="fault-form" onSubmit={handleFaultSubmit}>
                        <input
                            type="text"
                            placeholder="Podaj numer pokoju"
                            value={faultForm.roomNumber}
                            onChange={(e) => setFaultForm({...faultForm, roomNumber: e.target.value})}
                        />

                        <select
                            value={faultForm.category}
                            onChange={(e) => setFaultForm({...faultForm, category: e.target.value})}
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
                            onChange={(e) => setFaultForm({...faultForm, description: e.target.value})}
                        ></textarea>

                        <button type="submit" className="primary-btn mt-auto">Zgłoś usterkę</button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;