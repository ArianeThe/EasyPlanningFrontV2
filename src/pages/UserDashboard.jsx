import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess, logout } from '../redux/userReducer';
import '../styles/UserDashboard.css';

const UserDashboard = () => {
    const [slots, setSlots] = useState([]);
    const [currentSlots, setCurrentSlots] = useState([]);  
    const [isLoading, setIsLoading] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [showSlotModal, setShowSlotModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [appointmentTitle, setAppointmentTitle] = useState('');
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [sharedDocuments, setSharedDocuments] = useState([]);
    const [selectedType, setSelectedType] = useState("");
    const [appointmentTypes, setAppointmentTypes] = useState([]);

    const [profileData, setProfileData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        birth_date: ''
    });
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const userInfo = useSelector(state => state.user.userInfo);

    const [currentPage, setCurrentPage] = useState(1);
    const slotsPerPage = 8;

    useEffect(() => {
        
        fetchSlots();
        fetchAppointments();
        if (userInfo) {
            setNotificationsEnabled(userInfo.notifications_enabled);
            setSharedDocuments(JSON.parse(userInfo.shared_documents || '[]'));
            setProfileData({
                first_name: userInfo.first_name || '',
                last_name: userInfo.last_name || '',
                email: userInfo.email || '',
                phone: userInfo.phone || '',
                address: userInfo.address || '',
                birth_date: userInfo.birth_date ? new Date(userInfo.birth_date).toISOString().split('T')[0] : ''
            });
        }
    }, [userInfo]);


// Fonction pour récupérer les créneaux disponibles
const fetchSlots = async () => {
    try {
        const today = new Date().toISOString().split('T')[0]; // Date actuelle
        const nextTwoMonths = new Date();
        nextTwoMonths.setMonth(nextTwoMonths.getMonth() + 3); 
        const endDate = nextTwoMonths.toISOString().split('T')[0]; 

        const response = await axios.get(`http://localhost:5000/slots?start_date=${today}&end_date=${endDate}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        console.log(" Créneaux récupérés sur 2 mois :", response.data.length);

        setSlots(response.data); // Stocke tous les créneaux récupérés
        setCurrentSlots(response.data.slice(0, slotsPerPage)); // Affiche les 8 premiers créneaux

    } catch (error) {
        console.error("🚨 Erreur récupération des créneaux:", error);
    }
};

    // Synchronise `currentSlots` après la récupération initiale
    useEffect(() => {
        if (slots.length > 0 && currentSlots.length === 0) {
            setCurrentSlots(slots.slice(0, slotsPerPage));
        }
    }, [slots]);


    const fetchMoreSlots = () => {
    if (currentSlots.length < slots.length) { 
        const nextSlots = slots.slice(currentSlots.length, currentSlots.length + slotsPerPage);
        setCurrentSlots(prevSlots => [...prevSlots, ...nextSlots]); // Ajoute les créneaux suivants par groupes de 8
    }
};




//Fonction pour récupérer les rendez-vous de l'utilisateur
    const fetchAppointments = async () => {
        try {
            const response = await axios.get('http://localhost:5000/appointments', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            console.log("Rendez-vous récupérés:", response.data);
            setAppointments(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des rendez-vous:', error);
        }
    };



    const handleSlotSelect = (selectInfo) => {

         if (!selectInfo || !selectInfo.start || !selectInfo.end) return; // Vérifie les données avant exécution
    console.log("Sélection de créneau:", selectInfo);


        console.log("Sélection de créneau:", selectInfo);
        const start = selectInfo.start;
        const end = selectInfo.end;
        
        // Trouver le créneau correspondant
        const slot = slots.find(s => {
            const slotStart = new Date(s.start_time);
            const slotEnd = new Date(s.end_time);
            return slotStart.getTime() === start.getTime() && slotEnd.getTime() === end.getTime();
        });

        if (slot && !slot.taken) {
            console.log("Créneau trouvé:", slot);
            setSelectedSlot(slot);
            setShowSlotModal(true);
        } else if (slot && slot.taken) {
            alert("Ce créneau n'est plus disponible");
        }
    };

    const handleEventClick = (info) => {
        console.log("Événement cliqué:", info.event);
        const eventId = info.event.id;

        if (eventId.startsWith('slot-')) {
            const slotId = parseInt(eventId.split('-')[1]);
            const slot = slots.find(s => s.id === slotId);
            if (slot && !slot.taken) {
                console.log("Créneau trouvé:", slot);
                setSelectedSlot(slot);
                setShowSlotModal(true);
            } else if (slot && slot.taken) {
                alert("Ce créneau n'est plus disponible");
            }
        } else if (eventId.startsWith('apt-')) {
            const appointmentId = parseInt(eventId.split('-')[1]);
            const appointment = appointments.find(a => a.id === appointmentId);
            if (appointment) {
                if (window.confirm("Voulez-vous annuler ce rendez-vous ?")) {
                    handleCancelAppointment(appointmentId);
                }
            }
        }
    };

    //fonction pour stocker les motifs de rendez-vous
    const fetchAppointmentTypes = async () => {
    try {
        const response = await axios.get("http://localhost:5000/appointment-types", {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        console.log(" Types de rendez-vous récupérés :", response.data);
        setAppointmentTypes(response.data.map(type => ({ id: type.id, name: type.name })));


    } catch (error) {
        console.error("🚨 Erreur lors de la récupération des types de rendez-vous :", error);
    }
};

useEffect(() => {
    fetchAppointmentTypes();
}, []);

    // Fonction pour soumettre le rendez-vous
 const handleAppointmentSubmit = async () => {
    if (!selectedSlot || !selectedSlot.start_time || !selectedType) {
        alert("Sélectionnez un créneau et un motif de rendez-vous !");
        return;
    }

    // Calculer `end_time` avant d'envoyer les données
    const startTime = new Date(selectedSlot.start_time);
    const endTime = new Date(startTime.getTime() + 45 * 60000); // Ajout de 45 minutes

    // Vérifier si selectedType est bien un ID et non un nom
    const appointmentTypeId = Number(selectedType);

    if (isNaN(appointmentTypeId)) {
        console.error("❌ Erreur : appointment_type_id doit être un nombre !");
        alert("❌ Erreur : appointment_type_id doit être un nombre valide !");
        return;
    }

    try {
        console.log("🚀 Tentative de création du rendez-vous avec :", {
            slot_id: selectedSlot.id,
            start_time: selectedSlot.start_time,
            end_time: endTime.toISOString(),
            appointment_type_id: appointmentTypeId //  Envoie l'ID numérique
        });

        const response = await axios.post('http://localhost:5000/appointments', {
            slot_id: selectedSlot.id,
            start_time: selectedSlot.start_time,
            end_time: endTime.toISOString(),
            appointment_type_id: appointmentTypeId  // Assure que c'est bien un nombre
        }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        console.log(" Réponse du serveur :", response.data);

        if (response.status === 201) {
            alert("Rendez-vous créé avec succès !");
            setShowSlotModal(false);
            setSelectedSlot(null);
            fetchSlots();
            fetchAppointments();
        }
    } catch (error) {
        console.error('🚨 Erreur lors de la prise de rendez-vous:', error);
        alert(error.response?.data?.message || "Erreur lors de la prise de rendez-vous. Veuillez réessayer.");
    }
};

// Fonction pour annuler un rendez-vous

const handleCancelAppointment = async (appointmentId) => {
    try {
        const response = await axios.delete(`http://localhost:5000/appointments/${appointmentId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        console.log(" Rendez-vous annulé :", appointmentId);

        //  Mettre à jour le statut du rendez-vous dans l'interface
        setAppointments(prev => prev.map(app => 
            app.id === appointmentId ? { ...app, status: "cancelled" } : app
        ));

        //  Libérer le créneau dans `slots`
        setSlots(prevSlots => [...prevSlots, { start_time: response.data.start_time, end_time: response.data.end_time }]);

        fetchAppointments(); // Recharge les rendez-vous pour s’assurer que tout est bien mis à jour
        fetchSlots(); // Recharge les créneaux disponibles

    } catch (error) {
        console.error(" Erreur lors de l'annulation du rendez-vous :", error);
        alert("Erreur lors de l'annulation du rendez-vous. Veuillez réessayer.");
    }
};


    // Fonction pour activer/désactiver les notifications
    const toggleNotifications = async () => {
        try {
            await axios.put('http://localhost:5000/users/notifications', {
                enabled: !notificationsEnabled
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setNotificationsEnabled(!notificationsEnabled);
        } catch (error) {
            console.error('Erreur lors de la modification des notifications:', error);
        }
    };


    // Fonction pour mettre à jour le profil de l'utilisateur
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put('http://localhost:5000/users/profile', profileData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            
            dispatch(loginSuccess({
                token: localStorage.getItem('token'),
                role: 'user',
                userInfo: response.data
            }));
            
            setShowProfileModal(false);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du profil:', error);
        }
    };


    // Fonction pour déconnecter l'utilisateur
    const handleLogout = () => {
        dispatch(logout());
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const events = [
        ...appointments.map(apt => ({
            id: `apt-${apt.id}`,
            title: apt.title,
            start: apt.start_time,
            end: apt.end_time,
            backgroundColor: '#4CAF50',
            borderColor: '#4CAF50',
            extendedProps: { type: 'appointment' }
        })),
        ...slots.map(slot => ({
            id: `slot-${slot.id}`,
            title: slot.taken ? 'Créneau occupé' : 'Créneau disponible',
            start: slot.start_time,
            end: slot.end_time,
            backgroundColor: slot.taken ? '#dc3545' : '#2196F3',
            borderColor: slot.taken ? '#dc3545' : '#2196F3',
            extendedProps: { type: 'slot', taken: slot.taken }
        }))
    ];


    return (
        <div className="user-dashboard">
            <div className="dashboard-header">
                <h1>Tableau de bord</h1>
                <div className="user-info">
                    <p>Bienvenue, {userInfo?.first_name} {userInfo?.last_name}</p>
                    <div className="user-actions">
                        <button onClick={() => setShowProfileModal(true)}>Modifier mon profil</button>
                        <label className="notifications-toggle">
                            <input
                                type="checkbox"
                                checked={notificationsEnabled}
                                onChange={toggleNotifications}
                            />
                            Activer les notifications
                        </label>
                        <button onClick={handleLogout} className="logout-button">Déconnexion</button>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="slots-section">
                    <h2>Créneaux disponibles</h2>
                    {currentSlots.length === 0 ? (
                        <p>Aucun créneau disponible pour le moment</p>
                    ) : (
                        <div className="slots-list">
                            {currentSlots.map(slot => (
                                <div key={`${slot.id}-${slot.start_time}`} className="slot-card">
                                    <div className="slot-info">
                                        <h3>Date: {new Intl.DateTimeFormat('fr-FR', { 
                                            day: '2-digit', 
                                            month: '2-digit', 
                                            year: 'numeric' 
                                        }).format(new Date(slot.start_time))}</h3>
                                        <p>Heure: {new Date(slot.start_time).toLocaleTimeString('fr-FR', { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}</p>
                                    </div>
                                    <button 
                                        className="book-button"
                                        onClick={() => {
                                            console.log("Créneau sélectionné:", slot);
                                            setSelectedSlot(slot);
                                            setShowSlotModal(true);
                                        }}
                                    >
                                        Réserver
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                 
                    <button 
                        className="load-more-button" 
                        onClick={fetchMoreSlots} 
                        disabled={currentSlots.length >= slots.length || isLoading}
                    >
                    {currentSlots.length >= slots.length ? "Tous les créneaux sont affichés" : isLoading ? "Chargement..." : "Plus de créneaux libres"}
                    </button>

                </div>

                <div className="appointments-section">
    <h2>Mes rendez-vous</h2>
    {appointments.map(apt => (
        <div key={apt.id} className="appointment-card">
            <h3>{apt.title}</h3>
            <p>Date: {new Date(apt.start_time).toLocaleDateString()}</p>
            <p>Heure: {new Date(apt.start_time).toLocaleTimeString()} - {new Date(apt.end_time).toLocaleTimeString()}</p>

            {apt.status === "cancelled" ? (
                <p className="cancelled-message" style={{ color: "red", fontWeight: "bold" }}> Annulé par le patient</p>
            ) : (
                <button className="cancel-button" onClick={() => handleCancelAppointment(apt.id)}>
                    Annuler
                </button>
            )}
        </div>
    ))}
</div>


                <div className="documents-section">
                    <h2>Documents partagés</h2>
                    {sharedDocuments && sharedDocuments.length > 0 ? (
                        <div className="documents-list">
                            {sharedDocuments.map((doc, index) => (
                                <div key={index} className="document-card">
                                    <h3>{doc.name}</h3>
                                    <p>Partagé le: {new Date(doc.shared_at).toLocaleDateString()}</p>
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="download-button">
                                        Télécharger
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>Aucun document partagé</p>
                    )}
                </div>
            </div>

            {showSlotModal && selectedSlot && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Prendre un rendez-vous</h2>
                        <p>Date: {new Date(selectedSlot.start_time).toLocaleDateString('fr-FR')}</p>
                        <p>Heure: {new Date(selectedSlot.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>

                        <select onChange={(e) => setSelectedType(Number(e.target.value))}>
    <option value="" disabled>Choisissez un motif</option> {/* Option par défaut */}
    {appointmentTypes.map((type) => (
        <option key={type.id} value={type.id}> {/* Envoie l'ID et affiche le nom */}
            {type.name}
        </option>
    ))}
</select>


                        <div className="modal-buttons">
                            <button onClick={handleAppointmentSubmit}>Confirmer</button>
                            <button onClick={() => {
                                setShowSlotModal(false);
                                setSelectedSlot(null);
                                setAppointmentTitle('');
                            }}>Annuler</button>
                        </div>
                    </div>
                </div>
            )}

            {showProfileModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Modifier mon profil</h2>
                        <form onSubmit={handleProfileUpdate}>
                            <div className="form-group">
                                <label>Prénom:</label>
                                <input
                                    type="text"
                                    value={profileData.first_name}
                                    onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Nom:</label>
                                <input
                                    type="text"
                                    value={profileData.last_name}
                                    onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email:</label>
                                <input
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Téléphone:</label>
                                <input
                                    type="tel"
                                    value={profileData.phone}
                                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Adresse:</label>
                                <input
                                    type="text"
                                    value={profileData.address}
                                    onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Date de naissance:</label>
                                <input
                                    type="date"
                                    value={profileData.birth_date}
                                    onChange={(e) => setProfileData({...profileData, birth_date: e.target.value})}
                                />
                            </div>
                            <div className="modal-buttons">
                                <button type="submit">Enregistrer</button>
                                <button type="button" onClick={() => setShowProfileModal(false)}>Annuler</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard; 