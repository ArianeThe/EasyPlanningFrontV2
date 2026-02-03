import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import '../styles/Modals.css';

const AdminBookingModal = ({
    info,
    onClose,
    onSuccess
}) => {
    const [patients, setPatients] = useState([]);
    const [appointmentTypes, setAppointmentTypes] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

                const [patientsRes, typesRes] = await Promise.all([
                    axios.get(`${API_URL}/admin/users`, { headers }),
                    axios.get(`${API_URL}/admin/appointment-types`, { headers })
                ]);

                setPatients(patientsRes.data.users || []);
                setAppointmentTypes(typesRes.data || []);
            } catch (err) {
                console.error("Erreur lors du chargement des données de la modale:", err);
                setLoadError("Impossible de charger les patients ou les motifs.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPatient || !selectedType || !info) {
            alert("Veuillez remplir tous les champs.");
            return;
        }

        try {
            setLoading(true);
            const payload = {
                user_id: selectedPatient,
                appointment_type_id: selectedType,
                start_time: info.startStr,
                end_time: info.endStr
            };

            await axios.post(`${API_URL}/admin/appointments`, payload, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            alert("✅ Rendez-vous créé avec succès !");
            onSuccess();
            onClose();
        } catch (error) {
            console.error('🚨 Erreur lors de la création du rendez-vous:', error);
            alert(error.response?.data?.message || "Erreur lors de la création du rendez-vous.");
        } finally {
            setLoading(false);
        }
    };

    if (!info) return null;

    const startDate = new Date(info.start);

    return (
        <div className="modal">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Créer un rendez-vous (Admin)</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                {loadError && <div className="error-message">{loadError}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="appointment-info-summary">
                        <p><strong>Date :</strong> {startDate.toLocaleDateString('fr-FR')}</p>
                        <p><strong>Heure :</strong> {startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>

                    <div className="form-group">
                        <label htmlFor="patient-select">Patient :</label>
                        <select
                            id="patient-select"
                            value={selectedPatient}
                            onChange={(e) => setSelectedPatient(e.target.value)}
                            required
                            disabled={loading}
                        >
                            <option value="">-- Sélectionner un patient --</option>
                            {patients.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.last_name?.toUpperCase()} {p.first_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="type-select">Motif :</label>
                        <select
                            id="type-select"
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            required
                            disabled={loading}
                        >
                            <option value="">-- Sélectionner un motif --</option>
                            {appointmentTypes.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="modal-buttons">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? "Création..." : "Créer le rendez-vous"}
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                            Annuler
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminBookingModal;
