import React from 'react';

const SlotsList = ({ slots, selectedSlot, onSlotSelect, currentPage, setCurrentPage }) => {
    const slotsPerPage = 8;
    const startIndex = currentPage * slotsPerPage;
    const endIndex = startIndex + slotsPerPage;
    const visibleSlots = slots.slice(startIndex, endIndex);
    const totalPages = Math.ceil(slots.length / slotsPerPage);

    const getSlotEndTime = (slot) => {
        if (!slot?.start_time) return null;
        if (slot?.end_time) return new Date(slot.end_time);
        const startDate = new Date(slot.start_time);
        return new Date(startDate.getTime() + 45 * 60000); // 45 minutes
    };

    return (
        <div className="slots-section">
            <h2 className="slots-title">Créneaux disponibles</h2>
            <div className="slot-navigation">
                {currentPage > 0 && (
                    <button className="nav-button" onClick={() => setCurrentPage(currentPage - 1)}>
                        ← Retour
                    </button>
                )}
                {currentPage < totalPages - 1 && (
                    <button className="nav-button" onClick={() => setCurrentPage(currentPage + 1)}>
                        Plus de rdv →
                    </button>
                )}
            </div>
            {visibleSlots.length === 0 ? (
                <p>Aucun créneau disponible pour le moment</p>
            ) : (
                <ul className="slot-list">
                    {visibleSlots.map((slot) => (
                        <li key={slot.id} className="slot-item">
                            <div className="slot-details">
                                <span className="slot-date">
                                    {new Intl.DateTimeFormat('fr-FR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                    }).format(new Date(slot.start_time))}
                                </span>
                                <span className="slot-time">
                                    {new Date(slot.start_time).toLocaleTimeString('fr-FR', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })} - {getSlotEndTime(slot)?.toLocaleTimeString('fr-FR', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                            <input
                                type="checkbox"
                                checked={selectedSlot?.id === slot.id}
                                onChange={() => onSlotSelect(slot)}
                                className="slot-checkbox"
                            />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SlotsList;
