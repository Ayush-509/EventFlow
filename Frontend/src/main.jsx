import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import axios from 'axios';
import { GoogleOAuthProvider } from "@react-oauth/google";

// Axios base config
axios.defaults.baseURL = '';
axios.defaults.withCredentials = true;

// Theme control (force light mode always)
function applyThemeFromStorage() {
  try {
    const root = document.documentElement;
    const body = document.body;

    // Force LIGHT theme
    root.classList.remove('dark');
    body?.classList.remove('dark');

    localStorage.setItem('theme', 'light');

    // optional debug helper
    window.theme = {
      get: () => localStorage.getItem('theme'),
      set: (next) => {
        localStorage.setItem('theme', next);
        applyThemeFromStorage();
      }
    };
  } catch (err) {
    console.error('Theme init error:', err);
  }
}

applyThemeFromStorage();

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider
    clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
  >
    <App />
  </GoogleOAuthProvider>
);