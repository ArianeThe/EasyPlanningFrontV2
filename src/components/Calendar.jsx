import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";
import { fetchAppointments } from "../redux/calendarReducer";
import frLocale from '@fullcalendar/core/locales/fr';
import AdminBookingModal from "./AdminBookingModal";

//  AJOUT: Imports CSS nécessaires
//import '@fullcalendar/react/dist/vdom'; // important si tu as des erreurs React 18+

//import '@fullcalendar/daygrid/dist/daygrid.css';
//import '@fullcalendar/timegrid/dist/timegrid.css';
//import '@fullcalendar/core/index.css'; // parfois encore nécessaire selon les plugins

const Calendar = ({ events }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userRole = useSelector((state) => state.user.role);
    const userId = useSelector((state) => state.user.userInfo?.id);
    const calendarStatus = useSelector((state) => state.calendar.status);
    // 🔧 Correction : les événements sont stockés dans `state.calendar.events` (et non `appointments`)
    const reduxEvents = useSelector((state) => state.calendar.events || []);

    //  État local pour éviter les re-renders excessifs
    const [isCalendarReady, setIsCalendarReady] = useState(false);
    const [renderKey, setRenderKey] = useState(0);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [selectedInfo, setSelectedInfo] = useState(null);

    //  Mémorisation des événements pour éviter les re-calculs constants
    const eventsToDisplay = useMemo(() => {
        const sourceEvents = events && events.length > 0 ? events : reduxEvents;
        return sourceEvents;
    }, [events, reduxEvents]);

    //  Formatage mémorisé des événements
    const formattedEvents = useMemo(() => {
        return eventsToDisplay.map(event => {
            try {
                return {
                    id: String(event.id),
                    title: event.title || 'Sans titre',
                    start: new Date(event.start),
                    end: new Date(event.end),
                    backgroundColor: event.backgroundColor || '#3788d8',
                    borderColor: event.borderColor || event.backgroundColor || '#3788d8',
                    textColor: event.textColor || '#ffffff',
                    extendedProps: event.extendedProps || {}
                };
            } catch (error) {
                console.error("❌ Erreur formatage événement:", event, error);
                return null;
            }
        }).filter(Boolean);
    }, [eventsToDisplay]);

    // Chargement initial contrôlé
    useEffect(() => {
        let isMounted = true;

        if (calendarStatus === "idle") {
            dispatch(fetchAppointments()).then(() => {
                if (isMounted) {
                    setIsCalendarReady(true);
                }
            }).catch((error) => {
                console.error("❌ Erreur chargement rendez-vous:", error);
                if (isMounted) {
                    setIsCalendarReady(true); // On affiche quand même le calendrier
                }
            });
        } else if (calendarStatus === "succeeded") {
            setIsCalendarReady(true);
        }

        return () => {
            isMounted = false;
        };
    }, [dispatch, calendarStatus]);

    // 🔧 Force le re-render quand les événements changent significativement
    useEffect(() => {
        if (formattedEvents.length > 0) {
            setRenderKey(prev => prev + 1);
        }
    }, [formattedEvents.length]);

    const handleSelect = async (info) => {
        if (userRole === "admin") {
            setSelectedInfo(info);
            setShowAdminModal(true);
        } else {
            try {
                await axios.post(`${API_URL}/book-appointment`, {
                    userId,
                    start: info.startStr,
                    end: info.endStr
                }, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                });

                alert(`Créneau réservé pour ${info.startStr} !`);
                dispatch(fetchAppointments());
            } catch (error) {
                console.error("Erreur de réservation :", error);
                alert("Impossible de réserver ce créneau.");
            }
        }
    };

    // 🔧 Affichage conditionnel : attendre que le calendrier soit prêt
    if (!isCalendarReady) {
        return (
            <div className="calendar-container" style={{ height: '800px', padding: '20px' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    fontSize: '18px',
                    color: '#666'
                }}>
                    🔄 Chargement du calendrier...
                </div>
            </div>
        );
    }

    return (
        <div className="calendar-container" style={{ height: '800px', padding: '20px' }}>
            {process.env.NODE_ENV === 'development' && (
                <div style={{
                    marginBottom: '10px',
                    padding: '10px',
                    backgroundColor: '#f0f0f0',
                    fontSize: '12px',
                    borderRadius: '4px'
                }}>
                    <strong>🔧 DEBUG FULLCALENDAR:</strong><br />
                    Status: {calendarStatus} |
                    Événements: {eventsToDisplay.length} |
                    Prêt: {isCalendarReady ? '✅' : '❌'}
                </div>
            )}

            <FullCalendar
                key={`calendar-${renderKey}`}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                locale={frLocale}
                events={formattedEvents}
                selectable={true}
                select={handleSelect}
                height="100%"
                slotMinTime="09:30:00"
                slotMaxTime="20:00:00"
                allDaySlot={false}
                slotDuration="00:45:00"
                eventClick={(info) => {
                    const id = info.event.id?.toString();
                    if (id) {
                        info.jsEvent?.preventDefault?.();
                        navigate(`/appointment/${id}`);
                    }
                }}
                timeZone="local"
                nowIndicator={true}
                weekends={true}
                eventTimeFormat={{
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                }}
                slotLabelFormat={{
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                }}
            />

            {showAdminModal && (
                <AdminBookingModal
                    info={selectedInfo}
                    onClose={() => setShowAdminModal(false)}
                    onSuccess={() => dispatch(fetchAppointments())}
                />
            )}
        </div>
    );
};

export default Calendar;