import React, { useState } from 'react';

const AppointmentCard = ({ apt, isPast = false, onCancel }) => (
    <div
        className={`appointment-card ${isPast ? 'past-card' : ''}`}
        style={apt.type_color ? { borderLeft: `5px solid ${apt.type_color}` } : {}}
    >
        <h3>{apt.appointment_type || apt.title || 'Rendez-vous'}</h3>
        <p>Date: {new Date(apt.start_time).toLocaleDateString('fr-FR')}</p>
        <p>
            Heure: {new Date(apt.start_time).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            })} - {new Date(apt.end_time).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            })}
        </p>
        {!isPast && (
            <button className="cancel-button" onClick={() => onCancel(apt.id)}>
                Annuler
            </button>
        )}
        {apt.status === "cancelled" && (
            <p className="cancelled-message">Annulé</p>
        )}
    </div>
);

export const UpcomingAppointments = ({ appointments, onCancel }) => {
    const now = new Date();
    const upcoming = appointments.filter(apt => {
        const appointmentDate = new Date(apt.start_time);
        return appointmentDate >= now && apt.status !== 'cancelled';
    });

    return (
        <div className="appointments-section">
            <h2>Mes rendez-vous à venir</h2>
            {upcoming.length === 0 ? (
                <p>Aucun rendez-vous à venir</p>
            ) : (
                <div className="appointments-list">
                    {upcoming.map(apt => (
                        <AppointmentCard key={apt.id} apt={apt} onCancel={onCancel} />
                    ))}
                </div>
            )}
        </div>
    );
};

export const PastAppointments = ({ appointments }) => {
    const [pastPage, setPastPage] = useState(0);
    const itemsPerPage = 5;
    const now = new Date();

    const past = appointments
        .filter(apt => {
            const appointmentDate = new Date(apt.start_time);
            return appointmentDate < now || apt.status === 'cancelled';
        })
        .sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

    const totalPastPages = Math.ceil(past.length / itemsPerPage);
    const visiblePast = past.slice(pastPage * itemsPerPage, (pastPage + 1) * itemsPerPage);

    return (
        <div className="appointments-section past-appointments">
            <h2>Mes rendez-vous passés</h2>
            {past.length === 0 ? (
                <p>Aucun rendez-vous passé</p>
            ) : (
                <>
                    <div className="appointments-list">
                        {visiblePast.map(apt => (
                            <AppointmentCard key={apt.id} apt={apt} isPast={true} />
                        ))}
                    </div>

                    <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                        {pastPage > 0 && (
                            <button
                                className="load-more-button"
                                onClick={() => setPastPage(prev => prev - 1)}
                                style={{ margin: '0' }}
                            >
                                Plus récents
                            </button>
                        )}
                        {pastPage < totalPastPages - 1 && (
                            <button
                                className="load-more-button"
                                onClick={() => setPastPage(prev => prev + 1)}
                                style={{ margin: '0' }}
                            >
                                Suivants
                            </button>
                        )}
                    </div>

                    {totalPastPages > 1 && (
                        <p style={{ textAlign: 'center', color: '#666', fontSize: '0.8rem', marginTop: '10px' }}>
                            Page {pastPage + 1} sur {totalPastPages}
                        </p>
                    )}
                </>
            )}
        </div>
    );
};

const AppointmentsList = ({ appointments, onCancel }) => (
    <>
        <UpcomingAppointments appointments={appointments} onCancel={onCancel} />
        <PastAppointments appointments={appointments} />
    </>
);

export default AppointmentsList;
