import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAppointments } from '../../redux/calendarReducer';

export const useSlots = () => {
    const [slots, setSlots] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchSlots = async () => {
        setIsLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const nextThreeMonths = new Date();
            nextThreeMonths.setMonth(nextThreeMonths.getMonth() + 3);
            const endDate = nextThreeMonths.toISOString().split('T')[0];

            const response = await axios.get(
                `${API_URL}/slots?start_date=${today}&end_date=${endDate}`,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                }
            );

            console.log("✅ Créneaux disponibles récupérés :", response.data.length);
            setSlots(response.data);
        } catch (error) {
            console.error("🚨 Erreur récupération des créneaux:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSlots();
    }, []);

    return { slots, isLoading, fetchSlots };
};

export const useAppointments = () => {
    const dispatch = useDispatch();
    const appointments = useSelector(state => state.calendar.events);
    const status = useSelector(state => state.calendar.status);

    const refreshAppointments = () => {
        dispatch(fetchAppointments());
    };

    const cancelAppointment = async (appointmentId) => {
        try {
            await axios.post(`${API_URL}/appointments/${appointmentId}/cancel`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            console.log("✅ Rendez-vous annulé via Redux:", appointmentId);
            refreshAppointments();
        } catch (error) {
            console.error("🚨 Erreur lors de l'annulation du rendez-vous :", error);
            throw error;
        }
    };

    useEffect(() => {
        if (status === 'idle') {
            refreshAppointments();
        }
    }, [status, dispatch]);

    // Transformation pour compatibilité avec AppointmentsList (qui attend start_time/end_time)
    const formattedAppointments = appointments.map(event => ({
        id: event.id,
        start_time: event.start,
        end_time: event.end,
        appointment_type: event.extendedProps?.appointmentType,
        status: event.extendedProps?.status,
        type_color: event.backgroundColor
    }));

    return {
        appointments: formattedAppointments,
        fetchAppointments: refreshAppointments,
        cancelAppointment
    };
};

export const useAppointmentTypes = () => {
    const [appointmentTypes, setAppointmentTypes] = useState([]);

    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const response = await axios.get(`${API_URL}/appointment-types`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                console.log("✅ Types de rendez-vous récupérés :", response.data);
                setAppointmentTypes(response.data.map(type => ({ id: type.id, name: type.name })));
            } catch (error) {
                console.error("🚨 Erreur lors de la récupération des types de rendez-vous :", error);
            }
        };
        fetchTypes();
    }, []);

    return { appointmentTypes };
};
