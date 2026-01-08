import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileInfo = ({ userInfo }) => {
    const navigate = useNavigate();

    return (
        <>
            {/* Mes informations */}
            <div className="profile-info-section">
                <h2>Mes informations</h2>
                <div className="profile-info-content">
                    <p><strong>Nom:</strong> {userInfo?.last_name}</p>
                    <p><strong>Prénom:</strong> {userInfo?.first_name}</p>
                    <p><strong>Email:</strong> {userInfo?.email}</p>
                    {userInfo?.phone && <p><strong>Téléphone:</strong> {userInfo.phone}</p>}
                    {userInfo?.address && <p><strong>Adresse:</strong> {userInfo.address}</p>}
                    {userInfo?.birth_date && (
                        <p>
                            <strong>Date de naissance:</strong>{' '}
                            {new Date(userInfo.birth_date).toLocaleDateString('fr-FR')}
                        </p>
                    )}
                    <p>
                        <strong>Notifications :</strong>{' '}
                        {userInfo?.notifications_enabled ? 'Activées' : 'Désactivées'}
                    </p>
                </div>
            </div>

            {/* Mes documents partagés */}
            <div className="documents-section">
                <h2>Mes documents partagés</h2>
                <div className="documents-buttons">
                    <button
                        className="documents-button"
                        onClick={() => navigate(`/documents/${userInfo?.id}`)}
                    >
                        Accéder à mes documents
                    </button>
                    <button
                        className="documents-button add-document-button"
                        onClick={() => navigate('/documents/upload')}
                    >
                        ➕ Ajouter un document
                    </button>
                </div>
            </div>
        </>
    );
};

export default ProfileInfo;
