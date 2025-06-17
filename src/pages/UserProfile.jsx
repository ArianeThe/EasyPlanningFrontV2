import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const navigate = useNavigate();



    useEffect(() => {

        console.log("🔍 userId mis à jour :", userId);
        
        // Récupérer les infos de l'utilisateur
        axios.get(`http://localhost:5000/admin/user/${userId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
        .then(response => setUser(response.data))
        .catch(error => console.error("Erreur récupération utilisateur :", error));

        // Récupérer les rendez-vous liés à cet utilisateur
        axios.get(`http://localhost:5000/admin/user/${userId}/appointments`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
        .then(response => setAppointments(response.data))
        .catch(error => console.error("Erreur récupération rendez-vous :", error));
    }, [userId]);

    return (
        <div>
            {user ? (
                <>
                    <h1>Profil de {user.first_name} {user.last_name}</h1>
                    <p>Téléphone : {user.phone}</p>
                    <h2>Historique des rendez-vous</h2>
<ul>
    {appointments.map(apt => (
        <div key={apt.id} className="appointment-card">
            <h3>{apt.title}</h3>
            <p>Date: {new Date(apt.start_time).toLocaleDateString()}</p>
            <p>Heure: {new Date(apt.start_time).toLocaleTimeString()} - {new Date(apt.end_time).toLocaleTimeString()}</p>

            {apt.status === "cancelled" ? (
                <p className="cancelled-message" style={{ color: "red", fontWeight: "bold" }}>🛑 Annulé par le patient</p>
            ) : (
                <p className="active-message" style={{ color: "green", fontWeight: "bold" }}>✅ Confirmé</p>
            )}
        </div>
    ))}
</ul>

                </>
            ) : (
                <p>Chargement des données...</p>
            )}
            <button onClick={() => navigate("/admin")} style={{ marginBottom: "20px" }}>
                ⬅ Retour au Tableau de Bord
            </button>
        </div>
    );
};

export default UserProfile;
