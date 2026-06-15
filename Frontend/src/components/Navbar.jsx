import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Navbar({ theme, setTheme }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [profilePhoto, setProfilePhoto] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:5000/api/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setProfilePhoto(res.data.user.profilePhoto);
      } catch (error) {
        console.log(error);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/80 backdrop-blur-xl border-b border-blue-100 dark:border-purple-500/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/">
          <img
            className="h-14 object-contain"
            src="/logo.png"
            alt="EventFlow"
          />
        </Link>

        <nav className="flex items-center gap-5 text-sm font-medium">
          <Link
            to="/"
            className={
              location.pathname === "/"
                ? "font-semibold text-blue-600"
                : ""
            }
          >
            Home
          </Link>

          {user && (
            <Link to="/dashboard">
              Dashboard
            </Link>
          )}

          {user && (
            <Link to="/change-password">
              Change Password
            </Link>
          )}

          {user && (
            <Link to="/profile">
              <img
                src={
                  profilePhoto ||
                  `https://ui-avatars.com/api/?name=${user.name}`
                }
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
              />
            </Link>
          )}

          {user ? (
            <button onClick={logout} className="btn-outline">
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="btn-outline">
                Login
              </Link>

              <Link to="/signup" className="btn">
                Sign up
              </Link>
            </>
          )}

          <button
            className="input px-3 py-2 text-sm"
            onClick={() => {
              const next =
                theme === "dark" ? "light" : "dark";

              localStorage.setItem("theme", next);
              setTheme(next);
            }}
          >
            {theme === "dark"
              ? "🌙 Dark"
              : "☀️ Light"}
          </button>
        </nav>
      </div>
    </header>
  );
}