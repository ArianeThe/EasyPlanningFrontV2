import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { API_URL } from "../../config";
import { fetchAppointments } from "../../redux/calendarReducer";
import "../../styles/Appointment.css";
import AliceLayout from "../../components/AliceLayout";

const Appointment = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { events, status } = useSelector((state) => state.calendar);
    const { role, userInfo, isAuthenticated } = useSelector((state) => state.user);

    // Hooks d'état doivent être déclarés avant tout return conditionnel
    const [cancelLoading, setCancelLoading] = useState(false);
    const [reschedLoading, setReschedLoading] = useState(false);
    const [shareLoading, setShareLoading] = useState(false);
    const [newDate, setNewDate] = useState(""); // yyyy-mm-dd
    const [newTime, setNewTime] = useState(""); // HH:mm
    const event = useMemo(() => {
        return events?.find(e => e.id?.toString() === appointmentId?.toString());
    }, [events, appointmentId]);

    // Contrôle d'accès: admin OU propriétaire du rendez-vous
    const isOwner = useMemo(() => {
        if (!event) return false;
        const ownerId = event?.extendedProps?.userId;
        return userInfo?.id && ownerId && userInfo.id?.toString() === ownerId?.toString();
    }, [event, userInfo]);

    // Données d'affichage calculées en amont (robustes même si event est null pendant le premier render)
    const start = event?.start ? new Date(event.start) : null;
    const end = event?.end ? new Date(event.end) : null;
    const patientName = event?.extendedProps?.patientName || "-";
    const patientId = event?.extendedProps?.userId;
    const appointmentType = event?.extendedProps?.appointmentType || "-";
    const statusLabel = event?.extendedProps?.status || "-"; // ex: scheduled/honored/cancelled
    const cancelledBy = event?.extendedProps?.cancelledBy || "";
    const honored = event?.extendedProps?.honored; // bool éventuel si dispo

    const statutTexte = (() => {
        // Priorité: annulé > honoré > confirmé
        if (statusLabel?.toLowerCase() === "cancelled") return "Annulé";
        if (typeof honored === "boolean") return honored ? "Honoré" : "Confirmé";
        if (statusLabel?.toLowerCase() === "honored") return "Honoré";
        return "Confirmé";
    })();

    const [file, setFile] = useState(null);
    const [sharedDocs, setSharedDocs] = useState([]);
    const [docsLoading, setDocsLoading] = useState(false);

    const fetchSharedDocs = useCallback(async () => {
        if (!event?.id) return;
        try {
            setDocsLoading(true);
            const headers = {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            };
            const response = await axios.get(`${API_URL}/appointments/${event.id}/documents`, { headers });
            setSharedDocs(response.data.documents || []);
        } catch (error) {
            console.error("Erreur lors de la récupération des documents partagés", error);
        } finally {
            setDocsLoading(false);
        }
    }, [event?.id]);

    useEffect(() => {
        fetchSharedDocs();
    }, [fetchSharedDocs]);

    // Mesure de la largeur du bouton d'annulation pour l'appliquer aux contrôles de droite
    const cancelBtnRef = useRef(null);
    const [controlWidthPx, setControlWidthPx] = useState(null);
    useEffect(() => {
        if (cancelBtnRef.current) {
            const w = cancelBtnRef.current.offsetWidth;
            if (w && w > 0) setControlWidthPx(`${w}px`);
        }
    }, [cancelLoading, statutTexte, patientName, appointmentType]);

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (!event && status === "succeeded") {
        // Rendez-vous introuvable après chargement
        return <div>Rendez-vous introuvable.</div>;
    }

    if (!event) {
        // En attendant le chargement initial du calendrier
        return <div>Chargement…</div>;
    }

    if (!(role === "admin" || isOwner)) {
        return <div>Accès non autorisé.</div>;
    }

    // start/end/patientName/... déjà calculés ci-dessus

    const handleCancel = async () => {
        try {
            setCancelLoading(true);
            const headers = {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            };
            await axios.post(`${API_URL}/appointments/${event.id}/cancel`, {}, { headers });
            await dispatch(fetchAppointments());
        } catch (e) {
            console.error("Annulation échouée", e);
        } finally {
            setCancelLoading(false);
        }
    };

    const handleReschedule = async () => {
        if (!newDate || !newTime) return;
        try {
            setReschedLoading(true);
            const newStartIso = new Date(`${newDate}T${newTime}:00`).toISOString();
            // garde la même durée
            const durationMs = end && start ? (end.getTime() - start.getTime()) : 30 * 60 * 1000;
            const newEndIso = new Date(new Date(newStartIso).getTime() + durationMs).toISOString();
            const headers = {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
            };
            await axios.put(`${API_URL}/appointments/${event.id}`, { start: newStartIso, end: newEndIso }, { headers });
            await dispatch(fetchAppointments());
            setNewDate("");
            setNewTime("");
        } catch (e) {
            console.error("Repositionnement échoué", e);
        } finally {
            setReschedLoading(false);
        }
    };

    const handleShare = async () => {
        if (!file) return;
        try {
            setShareLoading(true);
            const form = new FormData();
            form.append("file", file);
            form.append("titre", file.name || "Document");
            const headers = {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            };
            await axios.post(`${API_URL}/appointments/${event.id}/share`, form, { headers });
            setFile(null);
            await fetchSharedDocs();
        } catch (e) {
            console.error("Partage échoué", e);
        } finally {
            setShareLoading(false);
        }
    };

    // mesure déjà initialisée ci-dessus

    return (
        <AliceLayout>
        <div className="user-dashboard appointment-page" style={controlWidthPx ? { ['--ctrl-w']: controlWidthPx } : undefined}>
            <h2 className="appointment-title">Détail du rendez-vous</h2>

            <div className="appointment-grid">
                {/* Colonne gauche: détails + annulation */}
                <div className="appointment-col">
                    <h3 className="col-title">Informations</h3>

                    <div className="appointment-row">
                        <strong>Patient:</strong> {patientName}
                        {patientId && (
                            <> — <Link to={`/admin/user/${patientId}`}>Voir la fiche</Link></>
                        )}
                    </div>

                    <div className="appointment-row">
                        <strong>Date/Heure:</strong> {start.toLocaleString()} {end ? ` → ${end.toLocaleString()}` : ""}
                    </div>

                    <div className="appointment-row">
                        <strong>Motif:</strong> {appointmentType}
                    </div>

                    <div className="appointment-row">
                        <strong>Statut:</strong> {statutTexte}
                        {cancelledBy && statutTexte === "Annulé" && (
                            <> — <em>Annulé par: {cancelledBy}</em></>
                        )}
                    </div>

                    <button ref={cancelBtnRef} className="btn btn-danger btn-fit" onClick={handleCancel} disabled={cancelLoading}>
                        {cancelLoading ? "Annulation…" : "Annuler le rendez-vous"}
                    </button>
                </div>

                {/* Colonne droite: repositionner + partage */}
                <div className="appointment-col">
                    <h3 className="col-title">Actions</h3>

                    <div className="panel">
                        <div className="panel-title">Repositionner</div>
                        <div className="reschedule-row">
                            <input className="input input-ctrl" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                            <input className="input input-ctrl" type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
                            <button className="btn btn-ctrl" onClick={handleReschedule} disabled={reschedLoading || !newDate || !newTime}>
                                {reschedLoading ? "Repositionnement…" : "Valider"}
                            </button>
                        </div>
                    </div>

                    {(role === "admin" || isOwner) && (
                        <div className="panel">
                            <div className="panel-title">Partager un document</div>
                            <div className="share-row">
                                <input className="input input-ctrl" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                                <button className="btn btn-ctrl" onClick={handleShare} disabled={shareLoading || !file}>
                                    {shareLoading ? "Partage…" : "Partager"}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="panel">
                        <div className="panel-title">Documents partagés</div>
                        <div className="docs-list">
                            {docsLoading ? (
                                <div className="docs-empty">Chargement…</div>
                            ) : sharedDocs.length === 0 ? (
                                <div className="docs-empty">Aucun document partagé.</div>
                            ) : (
                                <ul>
                                    {sharedDocs.map((doc) => (
                                        <li key={doc.id}>
                                            <span>{doc.name}</span>
                                            {patientId && (
                                                <a
                                    href={`${API_URL}/documents/${patientId}/${doc.id}/download?token=${localStorage.getItem("token")}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Télécharger
                                                </a>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {role === "admin" && (
                <div className="back-row">
                    <button className="btn btn-ctrl" onClick={() => navigate('/calendar')}>← Retour au calendrier</button>
                </div>
            )}
        </div>
        </AliceLayout>
    );
};

export default Appointment;
