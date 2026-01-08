import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_URL } from '../../config';
import AliceLayout from '../../components/AliceLayout';
import '../../styles/Documents.css';

const DocumentDetail = () => {
    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const params = useParams();
    const userId = params.userId;
    const documentId = params.documentId;
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

        const userIdToFetch = targetUserId || (role === 'admin' && userId ? parseInt(userId) : null);
        if (userIdToFetch && documentId !== undefined) {
            fetchDocument();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, documentId, canAccess]);

    const fetchDocument = async () => {
        try {
            setLoading(true);
            
            const userIdToFetch = targetUserId || (role === 'admin' && userId ? parseInt(userId) : null);
            
            if (!userIdToFetch) {
                setError('Utilisateur non identifié');
                setLoading(false);
                return;
            }
            
            // Récupérer la liste des documents pour trouver celui avec l'ID correspondant
            const response = await axios.get(`${API_URL}/documents/${userIdToFetch}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            const documents = response.data.documents || [];
            const docId = parseInt(documentId);

            const foundDocument = documents.find(doc => doc.id === docId);

            if (foundDocument) {
                setDocument(foundDocument);
                setError('');
            } else {
                setError('Document non trouvé');
            }
        } catch (error) {
            console.error('Erreur lors de la récupération du document:', error);
            setError(error.response?.data?.message || 'Erreur lors de la récupération du document');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        const userIdToUse = targetUserId || (role === 'admin' && userId ? parseInt(userId) : userInfo?.id);
        if (!userIdToUse) {
            if (role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/user');
            }
            return;
        }
        navigate(`/documents/${userIdToUse}`);
    };

    const getDocumentUrl = () => {
        if (!document) return null;
        const userIdToUse = targetUserId || (role === 'admin' && userId ? parseInt(userId) : userInfo?.id);
        if (!userIdToUse) return null;
        const token = localStorage.getItem('token');
        return `${API_URL}/documents/${userIdToUse}/${document.id}/download?token=${encodeURIComponent(token)}`;
    };

    const handleOpenDocument = () => {
        const url = getDocumentUrl();
        if (url) {
            window.open(url, '_blank');
        }
    };

    const isImage = (mimeType) => {
        if (!mimeType) return false;
        return mimeType.startsWith('image/');
    };

    const isPdf = (mimeType) => {
        if (!mimeType) return false;
        return mimeType === 'application/pdf';
    };

    if (!canAccess) {
        return (
            <AliceLayout>
                <div className="document-detail-container">
                    <div className="error-message">
                        <p>Accès non autorisé. Vous devez être administrateur ou propriétaire du compte.</p>
                        <button onClick={() => navigate('/user')} className="back-button">Retour</button>
                    </div>
                </div>
            </AliceLayout>
        );
    }

    return (
        <AliceLayout>
            <div className="document-detail-container">
                <div className="document-detail-header">
                    <button onClick={handleBack} className="back-button">← Retour</button>
                </div>

                {loading && <p>Chargement...</p>}
                {error && <div className="error-message">{error}</div>}

                {!loading && !error && document && (
                    <div className="document-detail-content">
                        <h1>{document.name}</h1>
                        <div className="document-info">
                            <p>
                                <strong>Date de partage :</strong>{' '}
                                {new Date(document.shared_at).toLocaleDateString('fr-FR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>

                        <div className="document-viewer">
                            {isImage(document.type_mime) ? (
                                <div className="document-image-container">
                                    <img 
                                        src={getDocumentUrl()} 
                                        alt={document.name} 
                                        className="document-image"
                                        crossOrigin="anonymous"
                                    />
                                </div>
                            ) : isPdf(document.type_mime) ? (
                                <div className="document-pdf-container">
                                    <iframe
                                        src={getDocumentUrl()}
                                        title={document.name}
                                        className="document-pdf"
                                    />
                                </div>
                            ) : (
                                <div className="document-link-container">
                                    <button onClick={handleOpenDocument} className="open-document-button">
                                        Ouvrir le document dans une nouvelle fenêtre
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AliceLayout>
    );
};

export default DocumentDetail;

