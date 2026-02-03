import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../styles/login.css";
import AliceLayout from "../components/AliceLayout";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState("");
    const [role, setRole] = useState("user");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [notification, setNotification] = useState({ type: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const tokenFromUrl = searchParams.get("token");
        const roleFromUrl = searchParams.get("role") || "user";

        if (tokenFromUrl) {
            setToken(tokenFromUrl);
            setRole(roleFromUrl);
        } else {
            setNotification({ type: 'error', message: "Token manquant. Veuillez utiliser le lien reçu par email." });
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setNotification({ type: '', message: '' });

        if (!token) {
            setNotification({ type: 'error', message: "Token manquant" });
            return;
        }

        if (newPassword.length < 6) {
            setNotification({ type: 'error', message: "Le mot de passe doit contenir au moins 6 caractères" });
            return;
        }

        if (newPassword !== confirmPassword) {
            setNotification({ type: 'error', message: "Les mots de passe ne correspondent pas" });
            return;
        }

        setIsLoading(true);

        try {
            const endpoint = role === 'admin'
                ? `${API_URL}/reset-password`
                : `${API_URL}/user/reset-password`;

            console.log(`🔐 Tentative de réinitialisation pour ${role}`);

            const response = await axios.post(endpoint, {
                token: token,
                newPassword: newPassword
            });

            setNotification({ type: 'success', message: response.data.message });

            setTimeout(() => {
                navigate("/login");
            }, 3000);

        } catch (error) {
            console.error("❌ Erreur lors de la réinitialisation :", error);
            setNotification({
                type: 'error',
                message: error.response?.data?.message || "Une erreur est survenue. Veuillez réessayer."
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AliceLayout>
            <div className="login-container">
                <h2>Réinitialiser le mot de passe</h2>
                <p style={{ marginBottom: "20px", color: "#666" }}>
                    Entrez votre nouveau mot de passe.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Nouveau mot de passe (min. 6 caractères)"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            disabled={isLoading || !token}
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Confirmer le mot de passe"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isLoading || !token}
                        />
                    </div>

                    {notification.message && (
                        <div className={notification.type === 'error' ? "error-message" : "success-message"} style={{
                            backgroundColor: notification.type === 'error' ? "#f8d7da" : "#d4edda",
                            color: notification.type === 'error' ? "#721c24" : "#155724",
                            padding: "10px",
                            borderRadius: "4px",
                            marginBottom: "15px",
                            border: notification.type === 'error' ? "1px solid #f5c6cb" : "1px solid #c3e6cb"
                        }}>
                            {notification.message}
                            {notification.type === 'success' && (
                                <>
                                    <br />
                                    <small>Redirection vers la page de connexion...</small>
                                </>
                            )}
                        </div>
                    )}

                    <button type="submit" disabled={isLoading || !token}>
                        {isLoading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
                    </button>
                </form>

                <p className="mt-3">
                    <a href="/login">Retour à la connexion</a>
                </p>
            </div>
        </AliceLayout>
    );
};

export default ResetPassword;
