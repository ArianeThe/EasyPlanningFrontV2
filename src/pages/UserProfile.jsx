import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config";
import AliceLayout from "../components/AliceLayout";
import "../styles/AdminDashboard.css";

const UserProfile = () => {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [loadingDocs, setLoadingDocs] = useState(false);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    const fetchDocuments = () => {
        setLoadingDocs(true);
        axios.get(`${API_URL}/documents/${userId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
            .then(response => {
                setDocuments(response.data.documents || []);
                setLoadingDocs(false);
            })
            .catch(error => {
                console.error("Erreur récupération documents :", error);
                setLoadingDocs(false);
            });
    };

    useEffect(() => {
        // Récupérer les infos de l'utilisateur
        axios.get(`${API_URL}/admin/user/${userId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
            .then(response => setUser(response.data))
            .catch(error => console.error("Erreur récupération utilisateur :", error));

        // Récupérer les rendez-vous liés à cet utilisateur
        axios.get(`${API_URL}/admin/user/${userId}/appointments`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
            .then(response => {
                // Trier par date décroissante
                const sorted = response.data.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
                setAppointments(sorted);
            })
            .catch(error => console.error("Erreur récupération rendez-vous :", error));

        // Récupérer les documents
        fetchDocuments();
    }, [userId]);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        // Append text fields first for better compatibility
        formData.append("user_id", userId);
        formData.append("titre", file.name);
        formData.append("file", file);

        try {
            setUploading(true);
            await axios.post(`${API_URL}/admin/documents/upload`, formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "multipart/form-data"
                }
            });
            // Recharger la liste
            fetchDocuments();
            alert("Document ajouté avec succès !");
        } catch (error) {
            console.error("Erreur lors de l'upload :", error);
            alert(error.response?.data?.message || "Erreur lors de l'upload du document.");
        } finally {
            setUploading(false);
            // Reset the input value to allow selecting the same file again
            event.target.value = '';
        }
    };

    const handleDownload = async (documentId, documentName, mimeType) => {
        try {
            const response = await axios.get(`${API_URL}/documents/${userId}/${documentId}/download`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                responseType: 'blob'
            });

            // Créer un lien pour le téléchargement
            const url = window.URL.createObjectURL(new Blob([response.data], { type: mimeType }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', documentName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Erreur lors du téléchargement :", error);
            alert("Impossible de télécharger le document.");
        }
    };

    const handleDeleteDocument = async (documentId) => {
        if (!window.confirm("Voulez-vous vraiment supprimer ce document pour cet utilisateur ?")) return;

        try {
            await axios.delete(`${API_URL}/documents/${userId}/${documentId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            fetchDocuments();
        } catch (error) {
            console.error("Erreur suppression document :", error);
            alert("Erreur lors de la suppression.");
        }
    };

    return (
        <AliceLayout>
            <div className="admin-dashboard">
                <div className="dashboard-header">
                    <h1>Fiche Patient</h1>
                    <button className="nav-button" onClick={() => navigate("/admin")}>
                        ⬅ Retour au Tableau de Bord
                    </button>
                </div>

                {user ? (
                    <div className="dashboard-content">
                        {/* Colonne Gauche : Informations de l'utilisateur (2/3) */}
                        <div className="left-column">
                            <div className="calendar-section" style={{ padding: '30px' }}>
                                <h2 style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>
                                    {user.first_name} {user.last_name}
                                </h2>
                                <div className="user-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                                    <div className="info-item">
                                        <label style={{ fontWeight: 'bold', color: '#666', display: 'block', fontSize: '0.9rem' }}>NOM</label>
                                        <p style={{ fontSize: '1.1rem', margin: '5px 0' }}>{user.last_name}</p>
                                    </div>
                                    <div className="info-item">
                                        <label style={{ fontWeight: 'bold', color: '#666', display: 'block', fontSize: '0.9rem' }}>PRÉNOM</label>
                                        <p style={{ fontSize: '1.1rem', margin: '5px 0' }}>{user.first_name}</p>
                                    </div>
                                    <div className="info-item">
                                        <label style={{ fontWeight: 'bold', color: '#666', display: 'block', fontSize: '0.9rem' }}>TÉLÉPHONE</label>
                                        <p style={{ fontSize: '1.1rem', margin: '5px 0' }}>{user.phone || 'Non renseigné'}</p>
                                    </div>
                                    <div className="info-item">
                                        <label style={{ fontWeight: 'bold', color: '#666', display: 'block', fontSize: '0.9rem' }}>EMAIL</label>
                                        <p style={{ fontSize: '1.1rem', margin: '5px 0' }}>{user.email}</p>
                                    </div>
                                    <div className="info-item">
                                        <label style={{ fontWeight: 'bold', color: '#666', display: 'block', fontSize: '0.9rem' }}>DATE DE NAISSANCE</label>
                                        <p style={{ fontSize: '1.1rem', margin: '5px 0' }}>
                                            {user.birth_date ? new Date(user.birth_date).toLocaleDateString('fr-FR') : 'Non renseignée'}
                                        </p>
                                    </div>
                                    {user.address && (
                                        <div className="info-item" style={{ gridColumn: 'span 2' }}>
                                            <label style={{ fontWeight: 'bold', color: '#666', display: 'block', fontSize: '0.9rem' }}>ADRESSE</label>
                                            <p style={{ fontSize: '1.1rem', margin: '5px 0' }}>{user.address}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Section Documents Partagés */}
                            <div className="calendar-section" style={{ padding: '30px', marginTop: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>
                                    <h2>Documents partagés</h2>
                                    <div>
                                        <input
                                            type="file"
                                            id="admin-upload-doc"
                                            style={{ display: 'none' }}
                                            onChange={handleFileUpload}
                                        />
                                        <label
                                            htmlFor="admin-upload-doc"
                                            style={{
                                                padding: '8px 16px',
                                                backgroundColor: uploading ? '#ccc' : '#28a745',
                                                color: 'white',
                                                borderRadius: '4px',
                                                cursor: uploading ? 'not-allowed' : 'pointer',
                                                fontSize: '0.9rem',
                                                display: 'inline-block'
                                            }}
                                        >
                                            {uploading ? 'Envoi...' : 'Partager un document'}
                                        </label>
                                    </div>
                                </div>

                                <div className="documents-list" style={{ marginTop: '20px' }}>
                                    {loadingDocs ? (
                                        <p>Chargement des documents...</p>
                                    ) : documents.length === 0 ? (
                                        <p style={{ fontStyle: 'italic', color: '#888' }}>Aucun document partagé pour ce patient.</p>
                                    ) : (
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ background: '#f9f9f9', textAlign: 'left' }}>
                                                    <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Nom</th>
                                                    <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Date</th>
                                                    <th style={{ padding: '10px', borderBottom: '1px solid #ddd', textAlign: 'right' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {documents.map(doc => (
                                                    <tr key={doc.id} style={{ borderBottom: '1px solid #eee' }}>
                                                        <td style={{ padding: '10px' }}>{doc.name}</td>
                                                        <td style={{ padding: '10px', fontSize: '0.9rem', color: '#555' }}>
                                                            {doc.shared_at ? new Date(doc.shared_at).toLocaleDateString('fr-FR') : '-'}
                                                        </td>
                                                        <td style={{ padding: '10px', textAlign: 'right' }}>
                                                            <button
                                                                onClick={() => handleDownload(doc.id, doc.name, doc.type_mime)}
                                                                title="Télécharger"
                                                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', marginRight: '10px' }}
                                                            >
                                                                ⬇️
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteDocument(doc.id)}
                                                                title="Supprimer"
                                                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#e74c3c' }}
                                                            >
                                                                🗑️
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Colonne Droite : Historique des rendez-vous (1/3) */}
                        <div className="right-column">
                            <div className="users-section">
                                <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Historique RDV</h2>
                                <div className="appointments-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {appointments.length === 0 ? (
                                        <p>Aucun rendez-vous enregistré.</p>
                                    ) : (
                                        appointments.map(apt => (
                                            <div key={apt.id} className="user-card" style={{ cursor: 'default', borderLeft: apt.type_color ? `5px solid ${apt.type_color}` : 'none' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div>
                                                        <h3 style={{ fontSize: '1rem', margin: '0' }}>{apt.appointment_type}</h3>
                                                        <p style={{ fontSize: '0.85rem', margin: '5px 0' }}>
                                                            {new Date(apt.start_time).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                                        </p>
                                                        <p style={{ fontSize: '0.85rem', color: '#888' }}>
                                                            {new Date(apt.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - {new Date(apt.end_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        {apt.status === "cancelled" ? (
                                                            <span style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '12px', background: '#ffebeb', color: '#e74c3c', fontWeight: 'bold', border: '1px solid #ffcfcf' }}>
                                                                ANNULÉ
                                                            </span>
                                                        ) : (
                                                            <span style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '12px', background: '#ebffef', color: '#27ae60', fontWeight: 'bold', border: '1px solid #cfffdf' }}>
                                                                CONFIRMÉ
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <p>Chargement des données du patient...</p>
                    </div>
                )}
            </div>
        </AliceLayout>
    );
};

export default UserProfile;
