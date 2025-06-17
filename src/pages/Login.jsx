import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux"; 
import { useNavigate } from "react-router-dom";
import { loginSuccess, logout } from "../redux/userReducer";
import "../styles/login.css";  

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, role } = useSelector((state) => state.user);

    useEffect(() => {
        if (isAuthenticated) {
            if (role === "admin") {
                navigate("/admin");
            } else if (role === "user") {
                navigate("/user");
            }
        }
    }, [isAuthenticated, role, navigate]);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        
        const cleanedEmail = email.trim().toLowerCase();
        if (!validateEmail(cleanedEmail)) {
            setErrorMessage("Format d'email invalide");
            return;
        }

        try {
            const response = await axios.post("http://localhost:5000/login", { 
                email: cleanedEmail, password 
            });
            
            dispatch(loginSuccess({
                token: response.data.token,
                role: response.data.role,
                userInfo: response.data.userInfo
            }));

            setErrorMessage("");
        } catch (error) {
            console.error("❌ Erreur de connexion :", error.response?.data?.message || "Identifiants incorrects.");
            setErrorMessage(error.response?.data?.message || "Identifiants incorrects.");
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    return (
        <div className="login-container">
            <h2>Connexion</h2>
            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <input 
                        type="email" 
                        placeholder="Email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={errorMessage.includes('email') ? 'error' : ''}
                    />
                </div>
                <div className="form-group">
                    <input 
                        type="password" 
                        placeholder="Mot de passe" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} 
                    />
                </div>
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                <button type="submit">Se connecter</button>
            </form>

            <p className="mt-3">
                Pas encore de compte ? <a href="/register">S'inscrire</a>
            </p>

            {isAuthenticated && <button onClick={handleLogout}>Déconnexion</button>}
        </div>
    );
};

export default Login;
