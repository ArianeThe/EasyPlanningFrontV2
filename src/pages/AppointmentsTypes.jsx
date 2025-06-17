import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AppointmentTypes = () => {
    const [appointmentTypes, setAppointmentTypes] = useState([]);
    const [newType, setNewType] = useState("");
    const navigate = useNavigate();

    // Charger les types depuis le backend
useEffect(() => {
    axios.get("http://localhost:5000/admin/appointment-types", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
    .then(response => setAppointmentTypes(response.data))
    .catch(error => console.error("Erreur chargement types RDV :", error));
}, []);


const addType = () => {
    if (newType.trim()) {
        axios.post("http://localhost:5000/admin/appointment-types", 
            { name: newType },
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        )
        .then(() => setAppointmentTypes([...appointmentTypes, { name: newType }]))
        .catch(error => console.error("Erreur ajout type RDV :", error));
        setNewType("");
    }
};

const removeType = (typeId) => {
    axios.delete(`http://localhost:5000/admin/appointment-types/${typeId}`, 
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } } 
    )
    .then(() => setAppointmentTypes(appointmentTypes.filter(type => type.id !== typeId)))
    .catch(error => console.error("Erreur suppression type RDV :", error));
};

console.log("🔍 Liste des types de rendez-vous :", appointmentTypes);


    return (
        <div>
            <h1>Gérer les motifs de rendez-vous</h1>
            
            <button onClick={() => navigate("/admin")}> Retour au Tableau de bord</button>

            <ul>
                {appointmentTypes.map((type) => (
                    <li key={type.id}>
                        {type.name}
                        <button onClick={() => removeType(type.id)}> Supprimer</button>
                    </li>
                ))}
            </ul>

            <input type="text" value={newType} onChange={(e) => setNewType(e.target.value)} placeholder="Ajouter un type" />
            <button onClick={addType}>Ajouter</button>
        </div>
    );
};

export default AppointmentTypes;
