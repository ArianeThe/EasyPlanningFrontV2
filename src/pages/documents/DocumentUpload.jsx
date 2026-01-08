import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_URL } from '../../config';
import AliceLayout from '../../components/AliceLayout';
import '../../styles/Documents.css';

const DocumentUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [titre, setTitre] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const { userInfo } = useSelector(state => state.user);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            // Préremplir le titre avec le nom du fichier (sans l'extension)
            if (!titre) {
                const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
                setTitre(fileNameWithoutExt);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedFile) {
            setError('Veuillez sélectionner un fichier');
            return;
        }

        if (!titre.trim()) {
            setError('Veuillez saisir un titre pour le document');
            return;
        }

        // Vérifier la taille du fichier (10 MB max)
        if (selectedFile.size > 10 * 1024 * 1024) {
            setError('Le fichier est trop volumineux. Taille maximale : 10 MB');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess(false);

            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('titre', titre);
            formData.append('user_id', userInfo?.id);

            const response = await axios.post(`${API_URL}/documents/upload`, formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSuccess(true);
            setTimeout(() => {
                navigate(`/documents/${userInfo?.id}`);
            }, 1500);
        } catch (error) {
            console.error('Erreur lors de l\'upload du document:', error);
            setError(error.response?.data?.message || 'Erreur lors de l\'upload du document');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/user');
    };

    return (
        <AliceLayout>
            <div className="document-upload-container">
                <div className="document-upload-header">
                    <h1>Ajouter un document</h1>
                    <button onClick={handleBack} className="back-button">← Retour</button>
                </div>

                <div className="document-upload-content">
                    {success && (
                        <div className="success-message">
                            Document uploadé avec succès ! Redirection...
                        </div>
                    )}

                    {error && (
                        <div className="error-message">{error}</div>
                    )}

                    <form onSubmit={handleSubmit} className="upload-form">
                        <div className="form-group">
                            <label htmlFor="file">Sélectionner un fichier :</label>
                            <input
                                type="file"
                                id="file"
                                name="file"
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
                                className="file-input"
                            />
                            {selectedFile && (
                                <div className="file-info">
                                    <p><strong>Fichier sélectionné :</strong> {selectedFile.name}</p>
                                    <p><strong>Taille :</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="titre">Titre du document :</label>
                            <input
                                type="text"
                                id="titre"
                                name="titre"
                                value={titre}
                                onChange={(e) => setTitre(e.target.value)}
                                placeholder="Entrez un titre pour le document"
                                className="text-input"
                                required
                            />
                        </div>

                        <div className="form-actions">
                            <button 
                                type="submit" 
                                className="submit-button"
                                disabled={loading || !selectedFile || !titre.trim()}
                            >
                                {loading ? 'Upload en cours...' : 'Uploader le document'}
                            </button>
                            <button 
                                type="button" 
                                onClick={handleBack}
                                className="cancel-button"
                            >
                                Annuler
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AliceLayout>
    );
};

export default DocumentUpload;

