import React from 'react';
import { useNavigate } from 'react-router-dom';

const DocumentsCard = ({ userId }) => {
    const navigate = useNavigate();

    return (
        <div className="documents-section">
            <h2>Mes documents partagés</h2>
            <div className="documents-buttons" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button
                    className="documents-button"
                    onClick={() => navigate(`/documents/${userId}`)}
                    style={{ flex: 1 }}
                >
                    Accéder à mes documents
                </button>
                <button
                    className="documents-button add-document-button"
                    onClick={() => navigate('/documents/upload')}
                    style={{ flex: 1, backgroundColor: '#28a745' }}
                >
                    ➕ Ajouter un document
                </button>
            </div>
        </div>
    );
};

export default DocumentsCard;
