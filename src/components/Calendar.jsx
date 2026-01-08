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

//  AJOUT: Imports CSS nécessaires
//import '@fullcalendar/react/dist/vdom'; // important si tu as des erreurs React 18+

//import '@fullcalendar/daygrid/dist/daygrid.css';
//import '@fullcalendar/timegrid/dist/timegrid.css';
//import '@fullcalendar/core/index.css'; // parfois encore nécessaire selon les plugins



console.log("🚀 `Calendar.jsx` chargé !");

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

    //  Mémorisation des événements pour éviter les re-calculs constants
    const eventsToDisplay = useMemo(() => {
        const sourceEvents = events && events.length > 0 ? events : reduxEvents;
        console.log("🔄 Recalcul des événements:", sourceEvents.length);
        return sourceEvents;
    }, [events, reduxEvents]);

    //  Formatage mémorisé des événements
    const formattedEvents = useMemo(() => {
        console.log("🔄 Formatage des événements:", eventsToDisplay.length);
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
            console.log("🔄 Chargement initial des rendez-vous...");
            dispatch(fetchAppointments()).then(() => {
                if (isMounted) {
                    setIsCalendarReady(true);
                    console.log("✅ Rendez-vous chargés, calendrier prêt");
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
            console.log("🔄 Nouveaux événements détectés, force re-render");
            setRenderKey(prev => prev + 1);
        }
    }, [formattedEvents.length]);

    const handleSelect = async (info) => {
        if (userRole !== "admin") {
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

    // 🔧 Log de diagnostic du chargement
    useEffect(() => {
        const timer = setTimeout(() => {
            const fcEvents = document.querySelectorAll(".fc-event");
            const fcCalendar = document.querySelector(".fc-view");
            
            console.log("📊 DIAGNOSTIC FULLCALENDAR:");
            console.log("  - Calendrier DOM présent:", !!fcCalendar);
            console.log("  - Événements DOM:", fcEvents.length);
            console.log("  - Événements formatés:", formattedEvents.length);
            console.log("  - Calendrier prêt:", isCalendarReady);
            console.log("  - Render key:", renderKey);
            
            if (!fcCalendar) {
                console.error("❌ PROBLÈME: Le DOM FullCalendar n'est pas créé !");
            } else if (fcEvents.length === 0 && formattedEvents.length > 0) {
                console.error("❌ PROBLÈME: Calendrier présent mais événements non affichés");
                console.log("🔍 Premier événement:", formattedEvents[0]);
            } else if (fcEvents.length > 0) {
                console.log("✅ Calendrier et événements OK !");
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [formattedEvents, isCalendarReady, renderKey]);

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
            {/* Debug amélioré */}
            {process.env.NODE_ENV === 'development' && (
                <div style={{ 
                    marginBottom: '10px', 
                    padding: '10px', 
                    backgroundColor: '#f0f0f0', 
                    fontSize: '12px',
                    borderRadius: '4px'
                }}>
                    <strong>🔧 DEBUG FULLCALENDAR:</strong><br/>
                    Status: {calendarStatus} | 
                    Événements bruts: {eventsToDisplay.length} | 
                    Formatés: {formattedEvents.length} | 
                    Prêt: {isCalendarReady ? '✅' : '❌'} | 
                    Render: #{renderKey}
                    {formattedEvents.length > 0 && (
                        <div style={{ marginTop: '5px', fontSize: '10px' }}>
                            Premier: {formattedEvents[0]?.title} ({formattedEvents[0]?.start?.toISOString()})
                        </div>
                    )}
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
                selectable={userRole !== "admin"}
                select={handleSelect}
                height="100%"
                // ⚙ Harmonisation avec les créneaux générés (9h00 → 20h00, pas 9h45)
                slotMinTime="09:30:00"
                slotMaxTime="20:00:00"
                allDaySlot={false}
                slotDuration="00:45:00"
                eventClick={(info) => {
                    console.log("🎯 Événement cliqué:", info.event);
                    // Redirige vers la page de détail du rendez-vous
                    const id = info.event.id?.toString();
                    if (id) {
                        info.jsEvent?.preventDefault?.();
                        navigate(`/appointment/${id}`);
                    }
                }}
                // 🔧 Callbacks de diagnostic
                loading={(isLoading) => {
                    console.log(`⏳ FullCalendar loading: ${isLoading} (render: ${renderKey})`);
                }}
                eventDidMount={(info) => {
                    console.log("🛠 Événement monté:", info.event.title);
                }}
                eventSourceFailure={(error) => {
                    console.error("❌ Erreur source événements:", error);
                }}
                // 🔧 Configuration minimale pour éviter les conflits
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
        </div>
    );
};

export default Calendar;