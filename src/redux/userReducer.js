import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    token: localStorage.getItem("token") || null,
    role: localStorage.getItem("token") ? localStorage.getItem("role") : "guest",  // Vérifie si le token existe avant d'assigner un rôle
    userInfo: JSON.parse(localStorage.getItem("userInfo")) || null,  // Stocke les infos utilisateur dans `localStorage`
    isAuthenticated: !!localStorage.getItem("token")
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            console.log(" Connexion réussie :", action.payload);
            state.token = action.payload.token;
            state.role = action.payload.role;
            state.userInfo = action.payload.userInfo;
            state.isAuthenticated = true;

            localStorage.setItem("token", action.payload.token);
            localStorage.setItem("role", action.payload.role);
            localStorage.setItem("userInfo", JSON.stringify(action.payload.userInfo));
        },
        logout: (state) => {
            console.log(" Déconnexion, suppression des données utilisateur");
            state.token = null;
            state.role = "guest";
            state.userInfo = null;
            state.isAuthenticated = false;

            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("userInfo");
        },
        updateUser: (state, action) => {
            console.log(" Mise à jour des infos utilisateur :", action.payload);
            state.userInfo = { email: action.payload.email };

            localStorage.setItem("userInfo", JSON.stringify({ email: action.payload.email }));
        }
    },
});

export const { loginSuccess, logout, updateUser } = userSlice.actions;
export default userSlice.reducer;
