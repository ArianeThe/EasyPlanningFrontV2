import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';

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
    const [appointments, setAppointments] = useState([]);

    const fetchAppointments = async () => {
        try {
            const response = await axios.get(`${API_URL}/appointments`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            console.log("✅ Rendez-vous récupérés:", response.data);
            setAppointments(response.data);
        } catch (error) {
            console.error('🚨 Erreur lors de la récupération des rendez-vous:', error);
        }
    };

    const cancelAppointment = async (appointmentId) => {
        try {
            await axios.delete(`${API_URL}/appointments/${appointmentId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            console.log("✅ Rendez-vous annulé :", appointmentId);
            fetchAppointments();
        } catch (error) {
            console.error("🚨 Erreur lors de l'annulation du rendez-vous :", error);
            throw error;
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    return { appointments, fetchAppointments, cancelAppointment };
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
