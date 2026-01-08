import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess, logout } from '../redux/userReducer';
import '../styles/UserDashboard.css';
import AliceLayout from '../components/AliceLayout';

// Import des composants modulaires
import SlotsList from './User/SlotsList';
import AppointmentsList from './User/AppointmentsList';
import ProfileInfo from './User/ProfileInfo';
import { BookingModal, ProfileModal } from './User/Modals';
import { useSlots, useAppointments, useAppointmentTypes } from './User/hooks';

const UserDashboard = () => {
    // Hooks personnalisés
    const { slots, fetchSlots } = useSlots();
    const { appointments, fetchAppointments, cancelAppointment } = useAppointments();
    const { appointmentTypes } = useAppointmentTypes();

    // États locaux
    const [showSlotModal, setShowSlotModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [profileData, setProfileData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        birth_date: '',
        notifications_enabled: false,
    });

    // Redux
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const userInfo = useSelector(state => state.user.userInfo);

    // Initialisation du profil
    useEffect(() => {
        if (userInfo) {
            setProfileData({
                first_name: userInfo.first_name || '',
                last_name: userInfo.last_name || '',
                email: userInfo.email || '',
                phone: userInfo.phone || '',
                address: userInfo.address || '',
                birth_date: userInfo.birth_date ?
                    new Date(userInfo.birth_date).toISOString().split('T')[0] : ''
            });
        }
    }, [userInfo]);

    // Réinitialiser la page quand les créneaux changent
    useEffect(() => {
        if (slots.length > 0 && currentPage * 8 >= slots.length) {
            setCurrentPage(0);
        }
    }, [slots, currentPage]);

    // Handlers
    // Pré-remplir les données de profil quand l'utilisateur est disponible
    useEffect(() => {
        if (userInfo) {
            setProfileData({
                first_name: userInfo.first_name || '',
                last_name: userInfo.last_name || '',
                email: userInfo.email || '',
                phone: userInfo.phone || '',
                address: userInfo.address || '',
                birth_date: userInfo.birth_date ? userInfo.birth_date.split('T')[0] : '',
                notifications_enabled: Boolean(userInfo.notifications_enabled),
            });
        }
    }, [userInfo]);

    const handleSlotSelect = (slot) => {
        setSelectedSlot(slot);
        setShowSlotModal(true);
    };

    const handleBookingSuccess = () => {
        fetchSlots();
        fetchAppointments();
    };

    const handleCancelAppointment = async (appointmentId) => {
        if (window.confirm("Voulez-vous vraiment annuler ce rendez-vous ?")) {
            try {
                await cancelAppointment(appointmentId);
                alert("✅ Rendez-vous annulé avec succès");
                fetchSlots(); // Rafraîchir les créneaux disponibles
            } catch (error) {
                alert("❌ Erreur lors de l'annulation du rendez-vous");
            }
        }
    };

    const handleProfileUpdate = async () => {
        try {
            const token = localStorage.getItem('token');

            // Mettre à jour la préférence notifications
            const notifRes = await axios.patch(
                `${API_URL}/users/me/notifications`,
                { notificationsEnabled: profileData.notifications_enabled },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Mettre à jour les autres champs de profil
            const profileRes = await axios.put(
                `${API_URL}/users/profile`,
                profileData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // On privilégie la réponse du profil, qui contient tous les champs, y compris notifications
            const updatedUser = profileRes.data || notifRes.data?.user;

            dispatch(loginSuccess({
                token,
                role: 'user',
                userInfo: updatedUser
            }));

            setShowProfileModal(false);
            alert("✅ Profil mis à jour avec succès");
        } catch (error) {
            console.error('Erreur lors de la mise à jour du profil:', error);
            alert("❌ Erreur lors de la mise à jour du profil");
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    return (
        <AliceLayout>
            <div className="user-dashboard">
                {/* Header */}
                <div className="dashboard-header">
                    <div className="welcome-section">
                        <p className="welcome-text">
                            Bienvenue {userInfo?.first_name} {userInfo?.last_name}
                        </p>
                        <div className="user-actions">
                            <button onClick={() => setShowProfileModal(true)}>
                                Modifier mon profil
                            </button>
                            <button onClick={handleLogout} className="logout-button">
                                Déconnexion
                            </button>
                        </div>
                    </div>
                </div>

                {/* Contenu principal */}
                <div className="dashboard-content">
                    {/* Colonne gauche : Créneaux disponibles */}
                    <div className="left-column">
                        <SlotsList
                            slots={slots}
                            selectedSlot={selectedSlot}
                            onSlotSelect={handleSlotSelect}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                        />
                    </div>

                    {/* Colonne droite : Profil et rendez-vous */}
                    <div className="right-column">
                        <ProfileInfo userInfo={userInfo} />
                        <AppointmentsList
                            appointments={appointments}
                            onCancel={handleCancelAppointment}
                        />
                    </div>
                </div>

                {/* Modales */}
                {showSlotModal && (
                    <BookingModal
                        slot={selectedSlot}
                        appointmentTypes={appointmentTypes}
                        onClose={() => {
                            setShowSlotModal(false);
                            setSelectedSlot(null);
                        }}
                        onSuccess={handleBookingSuccess}
                    />
                )}

                {showProfileModal && (
                    <ProfileModal
                        profileData={profileData}
                        setProfileData={setProfileData}
                        onSave={handleProfileUpdate}
                        onClose={() => setShowProfileModal(false)}
                    />
                )}
            </div>
        </AliceLayout>
    );
};

export default UserDashboard;