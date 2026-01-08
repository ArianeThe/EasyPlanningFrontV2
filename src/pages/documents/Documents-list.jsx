import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_URL } from '../../config';
import AliceLayout from '../../components/AliceLayout';
import '../../styles/Documents.css';

const DocumentsList = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const params = useParams();
    const userId = params.userId;
    const { userInfo, role } = useSelector(state => state.user);

    // Vérifier l'accès : admin ou propriétaire du compte
    const targetUserId = userId ? parseInt(userId) : userInfo?.id;
    const canAccess = role === 'admin' || (targetUserId && targetUserId === userInfo?.id);

    useEffect(() => {
        if (!canAccess) {
            setError('Accès non autorisé');
            setLoading(false);
            return;
        }

        if (targetUserId || (role === 'admin' && userId)) {
            fetchDocuments();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, canAccess]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            
            const userIdToFetch = targetUserId || (role === 'admin' && userId ? parseInt(userId) : null);
            
            if (!userIdToFetch) {
                setError('Utilisateur non identifié');
                setLoading(false);
                return;
            }
            
            const response = await axios.get(`${API_URL}/documents/${userIdToFetch}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            setDocuments(response.data.documents || []);
            setError('');
        } catch (error) {
            console.error('Erreur lors de la récupération des documents:', error);
            setError(error.response?.data?.message || 'Erreur lors de la récupération des documents');
        } finally {
            setLoading(false);
        }
    };

    const handleView = (document) => {
        const userIdToUse = targetUserId || (role === 'admin' && userId ? parseInt(userId) : userInfo?.id);
        if (!userIdToUse) return;
        navigate(`/documents/${userIdToUse}/${document.id}`);
    };

    const handleDelete = async (documentId, documentName) => {
        if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le document "${documentName}" ?`)) {
            return;
        }

        try {
            const userIdToUse = targetUserId || (role === 'admin' && userId ? parseInt(userId) : userInfo?.id);
            
            if (!userIdToUse) {
                alert('Utilisateur non identifié');
                return;
            }
            
            await axios.delete(`${API_URL}/documents/${userIdToUse}/${documentId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            // Recharger la liste après suppression
            fetchDocuments();
        } catch (error) {
            console.error('Erreur lors de la suppression du document:', error);
            alert(error.response?.data?.message || 'Erreur lors de la suppression du document');
        }
    };

    const handleBack = () => {
        if (role === 'admin') {
            navigate('/admin');
        } else {
            navigate('/user');
        }
    };

    if (!canAccess) {
        return (
            <AliceLayout>
                <div className="documents-container">
                    <div className="error-message">
                        <p>Accès non autorisé. Vous devez être administrateur ou propriétaire du compte.</p>
                        <button onClick={handleBack} className="back-button">Retour</button>
                    </div>
                </div>
            </AliceLayout>
        );
    }

    return (
        <AliceLayout>
            <div className="documents-container">
                <div className="documents-header">
                    <h1>Mes documents</h1>
                    <button onClick={handleBack} className="back-button">← Retour</button>
                </div>

                {loading && <p>Chargement...</p>}
                {error && <div className="error-message">{error}</div>}

                {!loading && !error && (
                    <>
                        {documents.length === 0 ? (
                            <p className="no-documents">Aucun document disponible</p>
                        ) : (
                            <div className="documents-table-container">
                                <table className="documents-table">
                                    <thead>
                                        <tr>
                                            <th>Nom du document</th>
                                            <th>Date de partage</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {documents.map((doc) => (
                                            <tr key={doc.id}>
                                                <td>{doc.name}</td>
                                                <td>
                                                    {doc.shared_at ? new Date(doc.shared_at).toLocaleDateString('fr-FR', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    }) : 'Date non disponible'}
                                                </td>
                                                <td className="actions-cell">
                                                    <button
                                                        className="action-button view-button"
                                                        onClick={() => handleView(doc)}
                                                        title="Consulter"
                                                    >
                                                        👁️
                                                    </button>
                                                    <button
                                                        className="action-button delete-button"
                                                        onClick={() => handleDelete(doc.id, doc.name)}
                                                        title="Supprimer"
                                                    >
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AliceLayout>
    );
};

export default DocumentsList;

