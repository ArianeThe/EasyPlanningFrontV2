import React from "react";
import "../styles/aliceLayout.css";

// Ce layout s'inspire de la structure visuelle du site alice-thebault.fr
// (header clair, logo à gauche, menu horizontal, fond blanc, typographie sobre, footer simple)

const AliceLayout = ({ children }) => {
  return (
    <div className="alice-layout">
      <header className="alice-header">
        <div className="alice-header-content">
          <div className="alice-logo">
             <span className="header-title">Alice THEBAULT</span>             <span className="sub-title">Psychologue Clinicienne à Casson</span>
              
          </div>
         {/* <nav className="alice-nav">
             Menu fictif, à adapter selon les routes 
            <a href="/login">Connexion</a>
            <a href="/register">Inscription</a>
            <a href="/user">Espace patient</a>
            <a href="/admin">Espace admin</a>
          </nav>*/}
        </div>
      </header>
      <main className="alice-main">
        {children}
      </main>
      <footer className="alice-footer">
        <div>
          <span>© {new Date().getFullYear()} Site réalisé par Click 'N Access  2025. Tous droits réservés.</span>
        </div>
      </footer>
    </div>
  );
};

export default AliceLayout; 