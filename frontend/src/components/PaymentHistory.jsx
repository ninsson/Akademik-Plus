import React from 'react';
import './PaymentHistory.css';

const mockPayments = [
    { id: 1, date: "10-04-2026", desc: "Opłata za pokój 101, kwiecień 2026", amount: 700, status: "NIEOPŁACONE" },
    { id: 2, date: "10-03-2026", desc: "Opłata za pokój 101, marzec 2026", amount: 700, status: "OPŁACONE" },
    { id: 3, date: "10-02-2026", desc: "Opłata za pokój 101, luty 2026", amount: 700, status: "OPŁACONE" },
    { id: 4, date: "10-01-2026", desc: "Opłata za pokój 101, styczeń 2026", amount: 700, status: "OPŁACONE" },
    { id: 5, date: "10-12-2025", desc: "Opłata za pokój 101, grudzień 2025", amount: 700, status: "OPŁACONE" },
    { id: 6, date: "10-11-2025", desc: "Opłata za pokój 101, listopad 2025", amount: 700, status: "OPŁACONE" },
    { id: 7, date: "10-10-2025", desc: "Opłata za pokój 101, październik 2025", amount: 700, status: "OPŁACONE" },
    { id: 8, date: "10-09-2025", desc: "Opłata za pokój 30, wrzesień 2025", amount: 700, status: "OPŁACONE" },
    { id: 9, date: "10-08-2025", desc: "Opłata za pokój 30, sierpień 2025", amount: 700, status: "OPŁACONE" },
];

const PaymentHistory = () => {

    const handleGeneratePdf = (id) => {
        console.log(`Generowanie rachunku PDF dla płatności o ID: ${id}`);
        // Logika generowania PDF
    };

    const handlePayment = () => {
        console.log("Przekierowanie do bramki płatności...");
    };

    return (
        <div className="payment-page-wrapper">
            {/* Nagłówek (tylko logo, bez powitania) */}
            <header className="payment-header">
                <h1 className="payment-logo-text">Akademik+</h1>
            </header>

            {/* Wyśrodkowana, szeroka karta */}
            <div className="payment-expanded-card">
                <h2 className="payment-card-title">Historia opłat</h2>

                <div className="payment-table-wrapper">
                    <table className="payment-full-table">
                        <thead>
                        <tr>
                            <th>Data</th>
                            <th>Opis płatności</th>
                            <th>Kwota</th>
                            <th>Status</th>
                            <th>Rachunek</th>
                        </tr>
                        </thead>
                        <tbody>
                        {mockPayments.map((payment) => (
                            <tr key={payment.id}>
                                <td className="col-date">{payment.date}</td>
                                <td className="col-desc">{payment.desc}</td>
                                <td className="col-amount">{payment.amount} zł</td>
                                <td className="col-status">
                                        <span className={`status-badge ${payment.status === 'OPŁACONE' ? 'paid' : 'unpaid'}`}>
                                            {payment.status}
                                        </span>
                                </td>
                                <td className="col-action">
                                    <button
                                        className="pdf-btn"
                                        onClick={() => handleGeneratePdf(payment.id)}
                                    >
                                        Wygeneruj rachunek PDF
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <button className="payment-main-btn" onClick={handlePayment}>
                    Dokonaj płatności
                </button>
            </div>
        </div>
    );
};

export default PaymentHistory;