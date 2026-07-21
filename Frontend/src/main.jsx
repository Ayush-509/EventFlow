import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import axios from 'axios';
import { GoogleOAuthProvider } from "@react-oauth/google";
import "leaflet/dist/leaflet.css";

// Axios base config
axios.defaults.baseURL = '';
axios.defaults.withCredentials = true;

// Theme control
function applyThemeFromStorage() {
  try {
    const root = document.documentElement;
    const body = document.body;
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = storedTheme === 'dark' || storedTheme === 'light'
      ? storedTheme
      : prefersDark ? 'dark' : 'light';

    root.classList.toggle('dark', theme === 'dark');
    body?.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;

    localStorage.setItem('theme', theme);

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