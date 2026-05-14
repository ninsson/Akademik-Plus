import React, { useState } from 'react';
import './PaymentHistory.css';

const initialMockPayments = [
    { id: 1, date: "10-05-2026", desc: "Opłata za pokój 101, maj 2026", amount: 700, status: "NIEOPŁACONE" },
    { id: 2, date: "10-04-2026", desc: "Opłata za pokój 101, kwiecień 2026", amount: 700, status: "OPŁACONE" },
    { id: 3, date: "10-03-2026", desc: "Opłata za pokój 101, marzec 2026", amount: 700, status: "OPŁACONE" },
    { id: 4, date: "10-02-2026", desc: "Opłata za pokój 101, luty 2026", amount: 700, status: "OPŁACONE" },
    { id: 5, date: "10-01-2026", desc: "Opłata za pokój 101, styczeń 2026", amount: 700, status: "OPŁACONE" },
    { id: 6, date: "10-12-2025", desc: "Opłata za pokój 101, grudzień 2025", amount: 700, status: "OPŁACONE" },
    { id: 7, date: "10-11-2025", desc: "Opłata za pokój 101, listopad 2025", amount: 700, status: "OPŁACONE" },
    { id: 8, date: "10-10-2025", desc: "Opłata za pokój 101, październik 2025", amount: 700, status: "OPŁACONE" },
    { id: 9, date: "10-09-2025", desc: "Opłata za pokój 30, wrzesień 2025", amount: 700, status: "OPŁACONE" },
    { id: 10, date: "10-08-2025", desc: "Opłata za pokój 30, sierpień 2025", amount: 700, status: "OPŁACONE" },
];

const PaymentHistory = () => {
    // Stan dla listy płatności
    const [payments, setPayments] = useState(initialMockPayments);
    // Stan kontrolujący widoczność pop-upa
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Stan symulujący czas przetwarzania płatności
    const [isProcessing, setIsProcessing] = useState(false);

    const handleGeneratePdf = (id) => {
        console.log(`Generowanie rachunku PDF dla płatności o ID: ${id}`);
        // Logika generowania PDF
    };

    const handleOpenPaymentModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleConfirmPayment = () => {
        setIsProcessing(true); // Pokazujemy loader/napis "Przetwarzanie..."

        // Symulacja opóźnienia sieci (1.5 sekundy)
        setTimeout(() => {
            // Zmieniamy status wszystkich nieopłaconych rachunków na OPŁACONE
            setPayments(prevPayments =>
                prevPayments.map(payment =>
                    payment.status === "NIEOPŁACONE"
                        ? { ...payment, status: "OPŁACONE" }
                        : payment
                )
            );

            setIsProcessing(false);
            setIsModalOpen(false); // Zamykamy pop-up
            alert("Płatność zakończona sukcesem!");
        }, 1500);
    };

    return (
        <div className="payment-page-wrapper">
            <header className="payment-header">
                <h1 className="payment-logo-text">Akademik+</h1>
            </header>

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
                        {payments.map((payment) => (
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

                {/* Przycisk otwierający udawaną bramkę */}
                <button className="payment-main-btn" onClick={handleOpenPaymentModal}>
                    Dokonaj płatności
                </button>
            </div>

            {/* Udawany Pop-up (Modal) */}
            {isModalOpen && (
                <div className="payment-modal-overlay">
                    <div className="payment-modal-content">
                        <h2>Udawana bramka płatności</h2>
                        <p>Wybierz metodę płatności i zatwierdź.</p>

                        <div className="fake-payment-methods">
                            <label><input type="radio" name="method" defaultChecked /> BLIK</label>
                            <label><input type="radio" name="method" /> Karta płatnicza</label>
                            <label><input type="radio" name="method" /> Przelew online</label>
                        </div>

                        <div className="modal-buttons">
                            <button
                                className="cancel-btn"
                                onClick={handleCloseModal}
                                disabled={isProcessing}
                            >
                                Anuluj
                            </button>
                            <button
                                className="confirm-btn"
                                onClick={handleConfirmPayment}
                                disabled={isProcessing}
                            >
                                {isProcessing ? "Przetwarzanie..." : "Zapłać 700 zł"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentHistory;