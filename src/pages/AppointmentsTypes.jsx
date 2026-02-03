import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { useNavigate } from "react-router-dom";
import AliceLayout from "../components/AliceLayout";
import "../styles/AppointmentsTypes.css";

const AppointmentTypes = () => {
  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [newType, setNewType] = useState("");
  const navigate = useNavigate();
  const [newColor, setNewColor] = useState("#000000");
  const [editingId, setEditingId] = useState(null);


  // Charger les types depuis le backend
  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = () => {
    axios.get(`${API_URL}/admin/appointment-types`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(response => setAppointmentTypes(response.data))
      .catch(error => console.error("Erreur chargement types RDV :", error));
  };


  const saveType = () => {
    if (newType.trim()) {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const data = { name: newType, color: newColor };

      if (editingId) {
        // Mode ÉDITION
        const url = `${API_URL}/admin/appointment-types/update/${editingId}`;
        console.log("📡 Appel PUT sur :", url);
        axios.put(url, data, config)
          .then(() => {
            alert("✅ Motif mis à jour avec succès !");
            setEditingId(null);
            setNewType("");
            setNewColor("#000000");
            fetchTypes();
          })
          .catch(error => {
            console.error("Erreur mise à jour type RDV :", error);
            alert("❌ Erreur lors de la mise à jour.");
          });
      } else {
        // Mode AJOUT
        axios.post(`${API_URL}/admin/appointment-types`, data, config)
          .then((response) => {
            setAppointmentTypes([...appointmentTypes, response.data]);
            setNewType("");
            setNewColor("#000000");
          })
          .catch(error => {
            console.error("Erreur ajout type RDV :", error);
            alert("Impossible d'ajouter ce motif.");
          });
      }
    }
  };


  const removeType = (typeId) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce motif ?")) return;

    axios.delete(`${API_URL}/admin/appointment-types/${typeId}`,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    )
      .then(() => {
        alert("✅ Motif supprimé avec succès !");
        setAppointmentTypes(appointmentTypes.filter(type => type.id !== typeId));
      })
      .catch(error => {
        console.error("Erreur suppression type RDV :", error);
        if (error.response?.status === 500 || error.response?.status === 400) {
          alert("❌ Impossible de supprimer ce motif car il est utilisé par des rendez-vous existants.");
        } else {
          alert("❌ Erreur lors de la suppression du motif.");
        }
      });
  };

  const startEdit = (type) => {
    setEditingId(type.id);
    setNewType(type.name);
    setNewColor(type.color || "#3788d8");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewType("");
    setNewColor("#000000");
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
              <div className="type-actions">
                <button className="bouton edit-btn" onClick={() => startEdit(type)}>
                  Modifier
                </button>
                <button className="bouton delete-btn" onClick={() => removeType(type.id)}>
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>





        <div className="form-section" style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
          <h3>{editingId ? "Modifier le motif" : "Ajouter un motif"}</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
            <input
              type="text"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              placeholder="Nom du motif"
              style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <div className="color-wrapper" style={{ margin: 0 }}>
              <input className="color-input" type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} />
            </div>
          </div>

          <div className="button-stack" style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
            <button className="bouton" onClick={saveType} style={{ width: 'auto', backgroundColor: editingId ? '#3498db' : '#2ecc71', color: 'white' }}>
              {editingId ? "Mettre à jour" : "Ajouter"}
            </button>
            {editingId && (
              <button className="bouton" onClick={cancelEdit} style={{ width: 'auto' }}>Annuler</button>
            )}
            <button className="bouton" onClick={() => navigate("/admin")} style={{ width: 'auto' }}>Retour au Tableau de bord</button>
          </div>
        </div>

      </div>
    </AliceLayout>
  );
};

export default AppointmentTypes;
