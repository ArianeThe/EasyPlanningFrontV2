import React from 'react';

const AlertMessage = ({ message, type = 'info', onClose }) => {
    if (!message) return null;

    const styles = {
        success: { backgroundColor: '#d1fae5', borderColor: '#34d399', color: '#065f46' },
        error: { backgroundColor: '#fee2e2', borderColor: '#f87171', color: '#991b1b' },
        info: { backgroundColor: '#dbeafe', borderColor: '#60a5fa', color: '#1e40af' },
        warning: { backgroundColor: '#fef3c7', borderColor: '#fbbf24', color: '#92400e' },
    };

    const currentStyle = styles[type] || styles.info;

    return (
        <div style={{
            padding: '1rem',
            borderLeftWidth: '4px',
            marginBottom: '1rem',
            borderRadius: '0.25rem',
            position: 'relative',
            ...currentStyle
        }} role="alert">
            <p style={{ fontWeight: 'bold' }}>
                {type === 'error' ? 'Erreur' : type === 'success' ? 'Succès' : type === 'warning' ? 'Attention' : 'Information'}
            </p>
            <p>{message}</p>
            {onClose && (
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        right: 0,
                        padding: '0 1rem',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        color: 'inherit'
                    }}
                >
                    &times;
                </button>
            )}
        </div>
    );
};

export default AlertMessage;
