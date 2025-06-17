import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';  //  Ajout de Redux
import store from './redux/store';  //  Import du store Redux

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>  {/* Enveloppe App avec Redux */}
      <App />
    </Provider>
  </React.StrictMode>
);

reportWebVitals();
