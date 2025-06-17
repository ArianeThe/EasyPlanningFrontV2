import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/userReducer";
import "../styles/login.css";

const Register = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        first_name: "",
        last_name: "",
        birth_date: "",
        phone: "",
        address: ""
    });
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        // Validation
        if (!validateEmail(formData.email)) {
            setErrorMessage("Format d'email invalide");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setErrorMessage("Les mots de passe ne correspondent pas");
            return;
        }

        if (formData.password.length < 6) {
            setErrorMessage("Le mot de passe doit contenir au moins 6 caractères");
            return;
        }

        try {
            const response = await axios.post("http://localhost:5000/register", {
                email: formData.email,
                password: formData.password,
                first_name: formData.first_name,
                last_name: formData.last_name,
                birth_date: formData.birth_date || null,
                phone: formData.phone || null,
                address: formData.address || null
            });

            // Connexion automatique après inscription
            dispatch(loginSuccess({
                token: response.data.token,
                role: response.data.role,
                userInfo: response.data.userInfo
            }));

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("role", response.data.role);
            localStorage.setItem("userInfo", JSON.stringify(response.data.userInfo));

            navigate("/user");
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "Erreur lors de l'inscription");
        }
    };

    return (
        <div className="login-container">
            <h2>Inscription</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <input
                        type="text"
                        name="first_name"
                        placeholder="Prénom"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="text"
                        name="last_name"
                        placeholder="Nom"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="date"
                        name="birth_date"
                        placeholder="Date de naissance"
                        value={formData.birth_date}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <input
                        type="tel"
                        name="phone"
                        placeholder="Téléphone"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <input
                        type="text"
                        name="address"
                        placeholder="Adresse"
                        value={formData.address}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        name="password"
                        placeholder="Mot de passe"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirmer le mot de passe"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </div>
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                <button type="submit">S'inscrire</button>
            </form>
            <p className="mt-3">
                Déjà inscrit ? <a href="/login">Se connecter</a>
            </p>
        </div>
    );
};

export default Register; 