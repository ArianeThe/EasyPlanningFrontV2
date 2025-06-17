import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "./redux/userReducer";  // Import action déconnexion
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Calendar from "./components/Calendar";
import AppointmentTypes from "./pages/AppointmentsTypes";
import UserProfile from "./pages/UserProfile";
import "./App.css";

const App = () => {
    const dispatch = useDispatch();
    const { isAuthenticated, role } = useSelector((state) => state.user);

    const handleLogout = () => {
      dispatch(logout());  // Supprimer l'état Redux
      localStorage.removeItem("token");  // Supprimer le token
      localStorage.removeItem("role");   // Supprimer le rôle
      localStorage.removeItem("userInfo");
      window.location.href = "/login";   // Redirection forcée vers la page de connexion
  };

    // Composant pour protéger les routes admin
    const ProtectedAdminRoute = ({ children }) => {
        return isAuthenticated && role === "admin" ? children : <Navigate to="/login" />;
    };

    // Composant pour protéger les routes utilisateur
    const ProtectedUserRoute = ({ children }) => {
        return isAuthenticated && role === "user" ? children : <Navigate to="/login" />;
    };

    return (
        <Router>
            <div className="app">
                <Routes>
                    <Route
                        path="/"
                        element={
                            isAuthenticated ? (
                                role === "admin" ? (
                                    <Navigate to="/admin" />
                                ) : (
                                    <Navigate to="/user" />
                                )
                            ) : (
                                <Navigate to="/login" />
                            )
                        }
                    />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedAdminRoute>
                                <AdminDashboard />
                            </ProtectedAdminRoute>
                        }
                    />

                    <Route 
                        path="/admin/appointment-types" 
                        element={
                            <ProtectedAdminRoute>
                                <AppointmentTypes />
                            </ProtectedAdminRoute>
                        } 
                   />

                   <Route 
                       path="/admin/user/:userId" 
                      element={
                          <ProtectedAdminRoute>
                              <UserProfile />
                          </ProtectedAdminRoute>
                      } 
                  />


                    <Route
                        path="/user"
                        element={
                            <ProtectedUserRoute>
                                <UserDashboard />
                            </ProtectedUserRoute>
                        }
                    />
                    <Route path="/calendar" element={
                        <ProtectedUserRoute>
                            <div>
                                <button onClick={handleLogout}>Déconnexion</button>
                                <Calendar />
                            </div>
                        </ProtectedUserRoute>
                    } />


                </Routes>
            </div>
        </Router>
    );
};

export default App;
