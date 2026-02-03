import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/userReducer';
import { fetchAppointments } from '../redux/calendarReducer';
import '../styles/AdminDashboard.css';
import '../styles/UserDashboard.css';
import CalendarComponent from '../components/Calendar';


const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [showUserModal, setShowUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(""); // Contrôle du select
    const [showSlotModal, setShowSlotModal] = useState(false);
    const [slotForm, setSlotForm] = useState({
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 jours par défaut
        start_hour: 9,
        end_hour: 20
    });
    const [slotLoading, setSlotLoading] = useState(false);
    const [slotMessage, setSlotMessage] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const reduxEvents = useSelector((state) => state.calendar.events);
    console.log("📅 Événements dans AdminDashboard:", reduxEvents);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log("Utilisateurs reçus:", response.data);
            setUsers(response.data.users || []);
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchUsers();

        // Polling pour la coordination en temps réel
        const interval = setInterval(() => {
            console.log("🔄 Synchronisation admin automatique...");
            dispatch(fetchAppointments());
        }, 30000); // Toutes les 30 secondes

        return () => clearInterval(interval);
    }, [navigate, dispatch]);

    const handleLogout = () => {
        dispatch(logout());
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const handleEventClick = async (info) => {
        const userId = info.event.extendedProps.userId;
        if (userId) {
            navigate(`/admin/user/${userId}`);
        } else {
            console.error("🚨 Erreur : Impossible de trouver l'utilisateur pour cet événement.");
        }
    };

    const handleUserSelect = (event) => {
        console.log("🔍 Valeur sélectionnée :", event.target.value);
        const userId = parseInt(event.target.value);
        console.log("🔍 ID après conversion :", userId);

        if (userId) {
            const user = users.find(u => u.id === userId);
            if (user) {
                setSelectedUser(user);
                setShowUserModal(true);
                navigate(`/admin/user/${userId}`);
                // Réinitialiser le select après navigation
                setSelectedUserId("");
            }
        }
    };

    const handleGenerateSlots = async (e) => {
        e.preventDefault();
        setSlotLoading(true);
        setSlotMessage("");

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/admin/slots`, {
                start_date: slotForm.start_date,
                end_date: slotForm.end_date,
                start_hour: parseInt(slotForm.start_hour),
                end_hour: parseInt(slotForm.end_hour)
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setSlotMessage(`✅ ${response.data.count} créneaux générés avec succès !`);
            setTimeout(() => {
                setShowSlotModal(false);
                setSlotMessage("");
            }, 3000);
        } catch (error) {
            console.error('Erreur lors de la génération des créneaux:', error);
            setSlotMessage(`❌ Erreur : ${error.response?.data?.message || 'Erreur serveur'}`);
        } finally {
            setSlotLoading(false);
        }
    };

    console.log("🚀 AdminDashboard monté !");
    console.log("🚀 `AdminDashboard.jsx` tente de rendre `Calendar.jsx`");

    return (
        <div className="user-dashboard admin-dashboard-full">
            <div className="dashboard-header">
                <h1>Tableau de bord administrateur</h1>
                <button onClick={handleLogout} className="logout-button">Déconnexion</button>
            </div>

            <div className="dashboard-content">
                <div className="calendar-section">
                    <h2>Calendrier des rendez-vous</h2>
                    <div className="calendar-container">
                        <CalendarComponent
                            events={reduxEvents}
                            onEventClick={handleEventClick}
                        />
                    </div>
                </div>

                <div className="users-section">
                    <h2>Liste des utilisateurs</h2>
                    <select
                        className="user-select"
                        onChange={handleUserSelect}
                        value={selectedUserId}
                    >
                        <option value="" disabled>Sélectionner un utilisateur</option>
                        {Array.isArray(users) && users.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.first_name} {user.last_name}
                            </option>
                        ))}
                    </select>

                    <div style={{ marginTop: '20px' }}>
                        <h2>Motifs de consultation</h2>
                        <button onClick={() => navigate("/admin/appointment-types")}>
                            Mettre à jour les motifs
                        </button>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <h2>Génération de créneaux</h2>
                        <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '10px' }}>
                            Génère des créneaux de 45 minutes de 9h30 à 20h00
                        </p>
                        <button
                            onClick={() => setShowSlotModal(true)}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Générer des créneaux
                        </button>
                    </div>
                </div>
            </div>

            {showUserModal && selectedUser && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Profil utilisateur</h2>
                        <div className="user-profile">
                            <p><strong>Nom:</strong> {selectedUser.last_name}</p>
                            <p><strong>Prénom:</strong> {selectedUser.first_name}</p>
                            <p><strong>Email:</strong> {selectedUser.email}</p>
                            <p><strong>Téléphone:</strong> {selectedUser.phone || 'Non renseigné'}</p>
                            <p><strong>Adresse:</strong> {selectedUser.address || 'Non renseignée'}</p>
                            <p><strong>Date de naissance:</strong> {selectedUser.birth_date ? new Date(selectedUser.birth_date).toLocaleDateString('fr-FR') : 'Non renseignée'}</p>
                            <p><strong>Notifications:</strong> {selectedUser.notifications_enabled ? 'Activées' : 'Désactivées'}</p>
                        </div>
                        <div className="modal-buttons">
                            <button onClick={() => setShowUserModal(false)}>Fermer</button>
                        </div>
                    </div>
                </div>
            )}

            {showSlotModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Générer des créneaux</h2>
                        <form onSubmit={handleGenerateSlots}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Date de début :
                                </label>
                                <input
                                    type="date"
                                    value={slotForm.start_date}
                                    onChange={(e) => setSlotForm({ ...slotForm, start_date: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Date de fin :
                                </label>
                                <input
                                    type="date"
                                    value={slotForm.end_date}
                                    onChange={(e) => setSlotForm({ ...slotForm, end_date: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Heure de début :
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="23"
                                    value={slotForm.start_hour}
                                    onChange={(e) => setSlotForm({ ...slotForm, start_hour: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                                <small style={{ color: '#666' }}>Les créneaux commenceront à HH:30 (ex: 9 = 9h30)</small>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Heure de fin :
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="23"
                                    value={slotForm.end_hour}
                                    onChange={(e) => setSlotForm({ ...slotForm, end_hour: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </div>
                            {slotMessage && (
                                <div style={{
                                    padding: '10px',
                                    marginBottom: '15px',
                                    borderRadius: '4px',
                                    backgroundColor: slotMessage.includes('✅') ? '#d4edda' : '#f8d7da',
                                    color: slotMessage.includes('✅') ? '#155724' : '#721c24'
                                }}>
                                    {slotMessage}
                                </div>
                            )}
                            <div className="modal-buttons">
                                <button
                                    type="submit"
                                    disabled={slotLoading}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: slotLoading ? 'not-allowed' : 'pointer',
                                        marginRight: '10px'
                                    }}
                                >
                                    {slotLoading ? 'Génération...' : 'Générer'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowSlotModal(false);
                                        setSlotMessage("");
                                    }}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#6c757d',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard; 