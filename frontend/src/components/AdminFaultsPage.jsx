import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, readJsonOrText } from '../api';
import AppHeader from './AppHeader';
import './AdminDashboard.css';
import './AdminFaultsPage.css';

const formatDateTime = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString('pl-PL');
};

const statusOptions = ['Przyjeto', 'Weryfikacja', 'W_trakcie_naprawy', 'Naprawiono', 'Zakonczono_bez_naprawy'];

const AdminFaultsPage = () => {
    const navigate = useNavigate();
    const [faults, setFaults] = useState([]);
    const [faultFilter, setFaultFilter] = useState('');
    const [loading, setLoading] = useState(true);

    const [selectedFault, setSelectedFault] = useState(null);
    const [faultComments, setFaultComments] = useState([]);
    const [commentDraft, setCommentDraft] = useState('');
    const [faultStatus, setFaultStatus] = useState('Przyjeto');

    useEffect(() => {
        let mounted = true;
        const loadFaults = async () => {
            setLoading(true);
            try {
                const [faultsRes, roomsRes] = await Promise.all([
                    apiFetch('/usterki'),
                    apiFetch('/pokoje')
                ]);

                if (faultsRes.ok) {
                    const faultsData = await readJsonOrText(faultsRes);
                    const rawFaults = Array.isArray(faultsData) ? faultsData : faultsData?.items || [];

                    let roomMap = {};
                    if (roomsRes.ok) {
                        const roomsData = await readJsonOrText(roomsRes);
                        const roomsList = Array.isArray(roomsData) ? roomsData : roomsData?.items || [];
                        roomsList.forEach((r) => {
                            const num = String(r?.numer_pokoju ?? '').trim();
                            if (r?.id != null) roomMap[r.id] = num || String(r.id);
                        });
                    }

                    const enriched = rawFaults.map((f) => ({
                        ...f,
                        pokoj_numer: roomMap[f.pokoj_id] !== undefined ? roomMap[f.pokoj_id] : (f.pokoj_numer ?? String(f.pokoj_id ?? '')),
                    }));
                    if (mounted) setFaults(enriched);
                } else if (faultsRes.status === 404) {
                    if (mounted) setFaults([]);
                }
            } catch (err) {
                console.error('Błąd ładowania usterek:', err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        loadFaults();
        return () => { mounted = false; };
    }, []);

    const filteredFaults = useMemo(() => {
        const q = faultFilter.trim().toLowerCase();
        if (!q) return faults;
        return faults.filter((f) => (
            `${f.opis_usterki || ''} ${f.pokoj_numer || f.pokoj_id || ''} ${f.status || ''}`.toLowerCase().includes(q)
        ));
    }, [faults, faultFilter]);

    const loadFaultComments = async (faultId) => {
        const response = await apiFetch(`/komentarze/usterka/${faultId}`);
        if (!response.ok) {
            setFaultComments([]);
            return;
        }
        const data = await readJsonOrText(response);
        setFaultComments(Array.isArray(data) ? data : data?.items || []);
    };

    const openFaultDetails = async (fault) => {
        setSelectedFault(fault);
        setFaultStatus(fault.status || 'Przyjeto');
        setCommentDraft('');
        await loadFaultComments(fault.id);
    };

    const handleFaultStatusUpdate = async () => {
        if (!selectedFault) return;
        const response = await apiFetch(`/usterki/${selectedFault.id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: faultStatus }),
        });
        if (response.ok) {
            setFaults((prev) => prev.map((fault) => (fault.id === selectedFault.id ? { ...fault, status: faultStatus } : fault)));
            setSelectedFault((prev) => (prev ? { ...prev, status: faultStatus } : prev));
        } else {
            alert('Nie udało się zaktualizować statusu.');
        }
    };

    const handleFaultCommentSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFault || !commentDraft.trim()) return;

        const response = await apiFetch(`/komentarze/usterka/${selectedFault.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tresc: commentDraft.trim() }),
        });
        if (response.ok) {
            setCommentDraft('');
            await loadFaultComments(selectedFault.id);
        }
    };

    return (
        <div className="admin-wrapper faults-page-wrapper">
            <AppHeader role="Administrator" greeting="Zarządzanie usterkami" />

            <div className="admin-card faults-page-card">
                <div className="faults-page-header">
                    <h2>Wszystkie zgłoszenia</h2>
                    <button className="back-btn" onClick={() => navigate('/admin')}>
                        &larr; Wróć do Dashboardu
                    </button>
                </div>

                <input
                    className="faults-search-input"
                    placeholder="Wyszukaj usterkę po pokoju, opisie lub statusie..."
                    value={faultFilter}
                    onChange={(e) => setFaultFilter(e.target.value)}
                    autoFocus
                />

                {loading ? (
                    <div className="loading-message">Ładowanie usterek...</div>
                ) : (
                    <div className="faults-list-container">
                        {filteredFaults.length ? filteredFaults.map((fault) => (
                            <div className="fault-list-row" key={fault.id}>
                                <div className="fault-list-main">
                                    <div className="fault-list-title">
                                        <strong>{fault.pokoj_numer ? `Pokój ${fault.pokoj_numer}` : `Pokój ${fault.pokoj_id}`}</strong>
                                        <span className="fault-status-badge">{fault.status || 'Brak statusu'}</span>
                                    </div>
                                    <div className="fault-list-desc">
                                        {fault.opis_usterki || 'Brak opisu'}
                                    </div>
                                    <div className="fault-list-meta">
                                        Data zgłoszenia: {formatDateTime(fault.data_zgloszenia)} • Priorytet: <strong>{fault.priorytet || 'Brak'}</strong>
                                    </div>
                                </div>
                                <div className="fault-list-actions">
                                    <button className="primary-btn" onClick={() => openFaultDetails(fault)}>
                                        Szczegóły / Czat
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="empty-state">Brak usterek spełniających kryteria wyszukiwania.</div>
                        )}
                    </div>
                )}
            </div>

            {selectedFault && (
                <div className="admin-modal-overlay" onClick={() => setSelectedFault(null)}>
                    <div className="admin-modal-content fault-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Usterka #{selectedFault.id}</h2>
                        <p><strong>Pokój:</strong> {selectedFault.pokoj_numer ?? selectedFault.pokoj_id}</p>
                        <p><strong>Opis:</strong> {selectedFault.opis_usterki}</p>
                        <p><strong>Priorytet:</strong> {selectedFault.priorytet || '-'}</p>
                        <p><strong>Data zgłoszenia:</strong> {formatDateTime(selectedFault.data_zgloszenia)}</p>

                        <div className="form-group">
                            <label>Status:</label>
                            <select value={faultStatus} onChange={(e) => setFaultStatus(e.target.value)}>
                                {statusOptions.map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                        <button className="primary-btn" onClick={handleFaultStatusUpdate}>Zapisz status</button>

                        <h3 className="chat-title">Czat usterki</h3>
                        <div className="fault-chat-timeline">
                            {!faultComments.length ? <div>Brak komentarzy.</div> : null}
                            {faultComments.map((comment) => {
                                const isAdmin = (comment.autor_rola || '').toLowerCase().includes('admin');
                                return (
                                    <div key={comment.id} className={`chat-message ${isAdmin ? 'admin' : 'resident'}`}>
                                        <div className="chat-meta">
                                            <strong>{comment.autor_nazwa || `Użytkownik ${comment.autor_id}`}</strong>
                                            <span>{formatDateTime(comment.data_dodania)}</span>
                                        </div>
                                        <div>{comment.tresc}</div>
                                    </div>
                                );
                            })}
                        </div>

                        <form className="chat-form" onSubmit={handleFaultCommentSubmit}>
                            <textarea
                                rows="3"
                                value={commentDraft}
                                onChange={(e) => setCommentDraft(e.target.value)}
                                placeholder="Napisz wiadomość..."
                            />
                            <div className="modal-buttons">
                                <button type="button" className="cancel-btn" onClick={() => setSelectedFault(null)}>Zamknij</button>
                                <button type="submit" className="confirm-btn">Wyślij</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminFaultsPage;