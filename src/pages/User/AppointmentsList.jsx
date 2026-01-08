import React from 'react';

const AppointmentsList = ({ appointments, onCancel }) => {
    const now = new Date();

    const upcomingAppointments = appointments.filter(apt => {
        const appointmentDate = new Date(apt.start_time);
        return appointmentDate >= now && apt.status !== 'cancelled';
    });

    const pastAppointments = appointments.filter(apt => {
        const appointmentDate = new Date(apt.start_time);
        return appointmentDate < now || apt.status === 'cancelled';
    });

    const AppointmentCard = ({ apt, isPast = false }) => (
        <div className={`appointment-card ${isPast ? 'past-card' : ''}`}>
            <h3>{apt.title || 'Rendez-vous'}</h3>
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

    return (
        <>
            {/* Rendez-vous à venir */}
            <div className="appointments-section">
                <h2>Mes rendez-vous à venir</h2>
                {upcomingAppointments.length === 0 ? (
                    <p>Aucun rendez-vous à venir</p>
                ) : (
                    <div className="appointments-list">
                        {upcomingAppointments.map(apt => (
                            <AppointmentCard key={apt.id} apt={apt} />
                        ))}
                    </div>
                )}
            </div>

            {/* Rendez-vous passés */}
            <div className="appointments-section past-appointments">
                <h2>Mes rendez-vous passés</h2>
                {pastAppointments.length === 0 ? (
                    <p>Aucun rendez-vous passé</p>
                ) : (
                    <div className="appointments-list">
                        {pastAppointments.map(apt => (
                            <AppointmentCard key={apt.id} apt={apt} isPast={true} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default AppointmentsList;
