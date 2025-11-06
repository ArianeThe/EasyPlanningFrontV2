import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/userReducer';
import '../styles/AdminDashboard.css';
import '../styles/UserDashboard.css';
import AliceLayout from '../components/AliceLayout';
import CalendarComponent from '../components/Calendar';


const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [showUserModal, setShowUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const reduxEvents = useSelector((state) => state.calendar.events);
    console.log("📅 Événements dans AdminDashboard:", reduxEvents);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/admin/users', {
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
    }, [navigate]);

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
            }
        }
    };

    console.log("🚀 AdminDashboard monté !");
    console.log("🚀 `AdminDashboard.jsx` tente de rendre `Calendar.jsx`");

    return (
        <AliceLayout>
        <div className="user-dashboard">
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
                        defaultValue=""
                    >
                        <option value="" disabled>Sélectionner un utilisateur</option>
                        {Array.isArray(users) && users.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.first_name} {user.last_name}
                            </option>
                        ))}
                    </select>

                    <div>
                        <h2>Motifs de consultation</h2>
                        <button onClick={() => navigate("/admin/appointment-types")}>
                            Mettre à jour les motifs
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
        </div>
        </AliceLayout>
    );
};

export default AdminDashboard; 