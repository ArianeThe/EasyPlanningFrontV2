import { useState } from 'react';

const useNotification = () => {
    const [notification, setNotification] = useState({ message: '', type: '' });

    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });

        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                setNotification(prev => prev.message === message ? { message: '', type: '' } : prev);
            }, 5000);
        }
    };

    const clearNotification = () => {
        setNotification({ message: '', type: '' });
    };

    return {
        notification,
        showNotification,
        clearNotification
    };
};

export default useNotification;
