import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AliceLayout from "../components/AliceLayout";
import "../styles/AppointmentsTypes.css";

const AppointmentTypes = () => {
    const [appointmentTypes, setAppointmentTypes] = useState([]);
    const [newType, setNewType] = useState("");
    const navigate = useNavigate();
    const [newColor, setNewColor] = useState("#000000");


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
      { name: newType, color: newColor },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    )
    .then((response) => {
      setAppointmentTypes([...appointmentTypes, 
        //{ name: newType, color: newColor }
        response.data]);
      setNewType("");
      setNewColor("#000000");
    })
    .catch(error => {
  if (error.response?.status === 500) {
    alert("Impossible de supprimer ce type car il est encore utilisé dans des rendez-vous.");
  } else {
    console.error("Erreur suppression type RDV :", error);
  }
});
    //.catch(error => console.error("Erreur ajout type RDV :", error));
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
console.log("Token utilisé :", localStorage.getItem("token"));


    return (
        <AliceLayout>
            <div>
                <h1>Gérer les motifs de rendez-vous</h1>

                <p>Vous pouvez ajouter, modifier ou supprimer des motifs de rendez-vous.</p>
                <p>Chaque motif peut avoir une couleur associée pour faciliter la visualisation dans le calendrier.</p>

                <ul className="type-list">
                  {appointmentTypes.map((type) => (
                    <li key={type.id} className="type-item">
                      <div className="type-left">
                        <span className="type-name">{type.name}</span>
                        <div className="color-box" style={{ backgroundColor: type.color }}></div>
                      </div>
                     <button className="bouton delete-btn" onClick={() => removeType(type.id)}>
                       Supprimer
                     </button>
                   </li>
                 ))}
                </ul>





                <input type="text" value={newType} onChange={(e) => setNewType(e.target.value)} placeholder="Ajouter un type" />

                <div className="color-wrapper">
                <input className="color-input" type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)}/>
                </div>

                <div className="button-stack">
                    <button className="bouton" onClick={addType}>Ajouter</button>
                    <button className="bouton" onClick={() => navigate("/admin")}>Retour au Tableau de bord</button>
                </div>

            </div>
        </AliceLayout>
    );
};

export default AppointmentTypes;
