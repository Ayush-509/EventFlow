import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Home from "./pages/Home.jsx";
import EventDetails from "./pages/EventDetails.jsx";
import EventGallery from "./pages/EventGallery.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import Profile from "./pages/Profile.jsx";
import EditEvent from "./pages/EditEvent.jsx";
import Favorites from "./pages/Favorites.jsx";
import AdminCustomers from "./pages/AdminCustomers.jsx";
import AdminOrganizers from "./pages/AdminOrganizers.jsx";
import EventsMap from "./pages/EventsMap.jsx";
import Messages from "./pages/Messages.jsx";
import CreateEvent from "./pages/createEvent.jsx";
import Auth from "./pages/Auth.jsx";
import Chat from "./pages/Chat";

import Navbar from "./components/Navbar.jsx";

import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";

import "leaflet/dist/leaflet.css";

function PrivateRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/auth" replace />;

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function useTheme() {
  const getInitial = () => {
    const stored = localStorage.getItem("theme");

    if (stored === "light" || stored === "dark") return stored;

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  const [theme, setTheme] = useState(getInitial);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.body.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return { theme, setTheme };
}

function Layout({ children }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950">
      <Navbar theme={theme} setTheme={setTheme} />

      <section className="animated-hero-bg border-b border-blue-100 dark:border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-700 to-cyan-600 dark:from-purple-300 dark:to-cyan-300 bg-clip-text text-transparent">
            Discover and Manage Events
          </h1>

          <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">
            Register, organize, review and track your event participation.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />

              <Route path="/events/:id" element={<EventDetails />} />

              {/* Gallery */}
              <Route
                path="/gallery/:eventId"
                element={<EventGallery />}
              />

              <Route path="/auth" element={<Auth />} />

              <Route
                path="/profile"
                element={
                  <PrivateRoute roles={["customer", "organizer", "admin"]}>
                    <Profile />
                  </PrivateRoute>
                }
              />

              <Route
                path="/edit-event/:id"
                element={
                  <PrivateRoute roles={["organizer"]}>
                    <EditEvent />
                  </PrivateRoute>
                }
              />

              <Route path="/forgot-password" element={<ForgotPassword />} />

              <Route
                path="/reset-password/:token"
                element={<ResetPassword />}
              />

              <Route
                path="/change-password"
                element={
                  <PrivateRoute roles={["customer", "organizer", "admin"]}>
                    <ChangePassword />
                  </PrivateRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <PrivateRoute roles={["customer", "organizer", "admin"]}>
                    <Dashboard />
                  </PrivateRoute>
                }
              />

              <Route path="/favorites" element={<Favorites />} />

              <Route path="/events-map" element={<EventsMap />} />

              <Route path="/messages" element={<Messages />} />

              <Route path="/createEvent" element={<CreateEvent />} />

              <Route
                path="/admin/customers"
                element={<AdminCustomers />}
              />

              <Route
                path="/admin/organizers"
                element={<AdminOrganizers />}
              />
              <Route path="/chat/:conversationId" element={<Chat />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

