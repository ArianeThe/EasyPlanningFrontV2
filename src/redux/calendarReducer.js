import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../config";

export const fetchAppointments = createAsyncThunk("calendar/fetchAppointments", async (_, { getState }) => {
    const token = localStorage.getItem("token");
    const { role } = getState().user;

    // Si c'est un admin, on utilise la route admin, sinon la route user
    const endpoint = role === "admin" ? "/admin/appointments" : "/appointments";

    try {
        const response = await axios.get(`${API_URL}${endpoint}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        // Normalisation : l'admin retourne { appointments: [] }, l'user retourne un tableau direct []
        let appointments = Array.isArray(response.data) ? response.data : response.data.appointments;

        if (!Array.isArray(appointments)) {
            console.error("Format de données invalide:", response.data);
            throw new Error("Les données reçues ne sont pas un tableau");
        }

        // Pour la route user, on transforme legerement pour que FullCalendar comprenne
        if (role !== "admin") {
            appointments = appointments.map(apt => ({
                id: apt.id,
                title: apt.appointment_type || "Mon RDV",
                start: apt.start_time,
                end: apt.end_time,
                user_id: apt.user_id,
                appointment_type: apt.appointment_type,
                status: apt.status,
                backgroundColor: apt.type_color || '#3788d8',
                borderColor: apt.type_color || '#3788d8',
                patient_name: "Moi"
            }));
        }

        return appointments;
    } catch (error) {
        console.error(`🚨 Erreur API Redux (${endpoint}) :`, error);
        throw error;
    }
});

const initialState = {
    events: [],
    availableSlots: [],
    status: "idle",
    error: null,
};

// Fonction utilitaire pour valider les dates
const isValidDate = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
};

const calendarSlice = createSlice({
    name: "calendar",
    initialState,
    reducers: {
        setEvents: (state, action) => {
            state.events = action.payload;
        },
        setAvailableSlots: (state, action) => {
            state.availableSlots = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAppointments.pending, (state) => {
                state.status = "loading";
                console.log("⏳ Chargement des rendez-vous...");
            })
            .addCase(fetchAppointments.fulfilled, (state, action) => {
                console.log("📦 Données reçues par le reducer:", action.payload);

                // Transformation des rendez-vous en événements FullCalendar
                const transformedEvents = action.payload
                    .map((apt, index) => {
                        console.log(`🔄 Traitement du rendez-vous ${index}:`, apt);

                        // Validation des données obligatoires
                        if (!apt.id) {
                            console.warn(`⚠️ Rendez-vous ${index} sans ID:`, apt);
                            return null;
                        }

                        if (!isValidDate(apt.start) || !isValidDate(apt.end)) {
                            console.warn(`⚠️ Rendez-vous ${apt.id} avec dates invalides:`, {
                                start: apt.start,
                                end: apt.end
                            });
                            return null;
                        }

                        // Création de l'événement au format FullCalendar
                        // Pas besoin de re-transformer les dates, elles sont déjà en ISO
                        const event = {
                            id: apt.id.toString(),
                            title: apt.title,
                            start: apt.start, // Déjà au bon format ISO
                            end: apt.end,     // Déjà au bon format ISO
                            backgroundColor: apt.backgroundColor || '#4CAF50',
                            borderColor: apt.borderColor || '#4CAF50',
                            textColor: '#ffffff',
                            allDay: false,
                            display: 'block',
                            extendedProps: {
                                userId: apt.user_id,
                                patientName: apt.patient_name,
                                appointmentType: apt.appointment_type,
                                status: apt.status
                            }
                        };

                        console.log(`✅ Événement créé pour ID ${apt.id}:`, event);
                        return event;
                    })
                    .filter(event => event !== null);

                state.events = transformedEvents;
                state.status = "succeeded";
                state.error = null;

                console.log(`✅ Redux mis à jour avec ${transformedEvents.length} événements sur ${action.payload.length} reçus`);
                console.log("📋 Événements finaux dans Redux:", transformedEvents);
            })
            .addCase(fetchAppointments.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
                console.error("❌ Échec du chargement des rendez-vous:", action.error.message);
            });
    },
});

export const { setEvents, setAvailableSlots } = calendarSlice.actions;
export default calendarSlice.reducer;