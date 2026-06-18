import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home.jsx';
import EventDetails from './pages/EventDetails.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import ChangePassword from './pages/ChangePassword.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { useEffect, useState } from 'react';
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import EditEvent from "./pages/EditEvent";
import { ToastProvider } from "./context/ToastContext";

function PrivateRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function useTheme() {
  const getInitial = () => {
    if (typeof window === 'undefined') return 'light';

    const stored = localStorage.getItem('theme');

    if (stored === 'dark' || stored === 'light') return stored;

    return window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  };

  const [theme, setTheme] = useState(getInitial);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (theme === 'dark') {
      root.classList.add('dark');
      body && body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body && body.classList.remove('dark');
    }

    localStorage.setItem('theme', theme);
  }, [theme]);

  return { theme, setTheme };
}




function Layout({ children }) {
  const { theme, setTheme } = useTheme();
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50 text-slate-800 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-purple-950 dark:text-slate-100 flex flex-col">
      <Navbar
  theme={theme}
  setTheme={setTheme}
/>

      <section className="animated-hero-bg border-b border-blue-100 dark:border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl md:text-5xl pb-2 font-black tracking-tight bg-gradient-to-r from-blue-700 to-cyan-600 dark:from-purple-300 dark:to-cyan-300 bg-clip-text text-transparent">
            Discover and Manage Events
          </h1>

          <p className="mt-3 text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
            Register, organize, review, and track your event participation.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full">
        {children}
      </main>

      <footer className="mt-16 border-t border-blue-100 dark:border-purple-500/20 bg-white/80 dark:bg-slate-950/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-6 text-sm text-slate-600 dark:text-slate-400 flex items-center justify-between">
          <p className="mt-1">
            Source code on{' '}
            <a
              href="https://github.com/Ayush-509/EventFlow.git"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-blue-600 dark:text-purple-300 hover:underline"
            >
              GitHub
            </a>
            .
          </p>

          <p className="text-right">
            © {new Date().getFullYear()}{' '}
            <span className="font-bold text-blue-700 dark:text-purple-300">
              EventFlow
            </span>
            . All rights reserved.
          </p>

          <p className="mt-1">
            Contact us{' '}
            <a
              href="mailto:help@event.com"
              className="font-bold text-blue-600 dark:text-purple-300 hover:underline"
            >
              help@event.com
            </a>
            .
          </p>
        </div>
      </footer>
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
              {/* all routes */}
              <Route path="/" element={<Home />} />
            <Route path="/events/:id" element={<EventDetails />} />

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={ <PrivateRoute roles={[ "customer", "organizer", "admin", ]} > <Profile /> </PrivateRoute> }/>
            <Route path="/edit-event/:id" element={ <PrivateRoute roles={["organizer"]}> <EditEvent /> </PrivateRoute> }/>

            <Route
              path="/forgot-password"
              element={<ForgotPassword />}
            />

            <Route
              path="/reset-password/:token"
              element={<ResetPassword />}
            />

            <Route
              path="/change-password"
              element={
                <PrivateRoute
                  roles={['customer', 'organizer', 'admin']}
                >
                  <ChangePassword />
                </PrivateRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <PrivateRoute roles={['customer', 'organizer', 'admin']}>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            </Routes>
          </Layout>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
