import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import AliceLayout from "../components/AliceLayout";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("user");
    const [isLoading, setIsLoading] = useState(false);

    // Utilisation du composant de notification (optionnel, ou gestion locale)
    // Ici je garde une gestion locale simple pour l'exemple, ou j'importe AlertMessage
    const [notification, setNotification] = useState({ type: '', message: '' });

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setNotification({ type: '', message: '' });

        const cleanedEmail = email.trim().toLowerCase();
        if (!validateEmail(cleanedEmail)) {
            setNotification({ type: 'error', message: "Format d'email invalide" });
            return;
        }

        setIsLoading(true);

        try {
            const endpoint = role === 'admin'
                ? `${API_URL}/forgot-password`
                : `${API_URL}/user/forgot-password`;

            console.log(` Envoi de la demande de réinitialisation pour ${role}`);

            const response = await axios.post(endpoint, {
                email: cleanedEmail
            });

            setNotification({ type: 'success', message: response.data.message });
            setEmail("");

        } catch (error) {
            console.error("❌ Erreur lors de la demande de réinitialisation :", error);
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
                <h2>Mot de passe oublié</h2>
                <p style={{ marginBottom: "20px", color: "#666" }}>
                    Entrez votre adresse email pour recevoir un lien de réinitialisation.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="role" style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                            Je suis :
                        </label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            disabled={isLoading}
                            style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: "4px",
                                border: "1px solid #ddd",
                                fontSize: "14px",
                                marginBottom: "15px"
                            }}
                        >
                            <option value="user">Utilisateur</option>
                            <option value="admin">Administrateur</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            maxLength="100"
                            className={notification.type === 'error' ? 'error' : ''}
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
                        </div>
                    )}

                    <button type="submit" disabled={isLoading}>
                        {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
                    </button>
                </form>

                <p className="mt-3">
                    <a href="/login">Retour à la connexion</a>
                </p>
            </div>
        </AliceLayout>
    );
};

export default ForgotPassword;
