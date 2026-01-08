import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';

export const BookingModal = ({
    slot,
    appointmentTypes,
    onClose,
    onSuccess
}) => {
    const [selectedType, setSelectedType] = useState("");

    const handleSubmit = async () => {
        if (!slot || !slot.start_time || !selectedType) {
            alert("Sélectionnez un créneau et un motif de rendez-vous !");
            return;
        }

        const startTime = new Date(slot.start_time);
        const endTime = new Date(startTime.getTime() + 45 * 60000);
        const appointmentTypeId = Number(selectedType);

        if (isNaN(appointmentTypeId)) {
            alert("❌ Erreur : type de rendez-vous invalide !");
            return;
        }

        try {
            console.log("🚀 Création du rendez-vous :", {
                slot_id: slot.id,
                start_time: slot.start_time,
                end_time: endTime.toISOString(),
                appointment_type_id: appointmentTypeId
            });

            const response = await axios.post(`${API_URL}/appointments`, {
                slot_id: slot.id,
                start_time: slot.start_time,
                end_time: endTime.toISOString(),
                appointment_type_id: appointmentTypeId
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.status === 201) {
                alert("✅ Rendez-vous créé avec succès !");
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error('🚨 Erreur lors de la prise de rendez-vous:', error);
            alert(error.response?.data?.message || "Erreur lors de la prise de rendez-vous.");
        }
    };

    if (!slot) return null;

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>Prendre un rendez-vous</h2>
                <p>Date: {new Date(slot.start_time).toLocaleDateString('fr-FR')}</p>
                <p>
                    Heure: {new Date(slot.start_time).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </p>

                <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                >
                    <option value="" disabled>Choisissez un motif</option>
                    {appointmentTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                            {type.name}
                        </option>
                    ))}
                </select>

                <div className="modal-buttons">
                    <button onClick={handleSubmit}>Confirmer</button>
                    <button onClick={onClose}>Annuler</button>
                </div>
            </div>
        </div>
    );
};

export const ProfileModal = ({ profileData, setProfileData, onSave, onClose }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave();
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>Modifier mon profil</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Prénom:</label>
                        <input
                            type="text"
                            value={profileData.first_name}
                            onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Nom:</label>
                        <input
                            type="text"
                            value={profileData.last_name}
                            onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Téléphone:</label>
                        <input
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Adresse:</label>
                        <input
                            type="text"
                            value={profileData.address}
                            onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Date de naissance:</label>
                        <input
                            type="date"
                            value={profileData.birth_date}
                            onChange={(e) => setProfileData({ ...profileData, birth_date: e.target.value })}
                        />
                    </div>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            id="notifications_enabled"
                            type="checkbox"
                            checked={!!profileData.notifications_enabled}
                            onChange={(e) => setProfileData({ ...profileData, notifications_enabled: e.target.checked })}
                        />
                        <label htmlFor="notifications_enabled" style={{ margin: 0 }}>
                            Recevoir des notifications (email + SMS)
                        </label>
                    </div>
                    <div className="modal-buttons">
                        <button type="submit">Enregistrer</button>
                        <button type="button" onClick={onClose}>Annuler</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
