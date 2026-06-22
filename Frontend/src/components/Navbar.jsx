import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Navbar({ theme, setTheme }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [profilePhoto, setProfilePhoto] = useState("");
  const [open, setOpen] = useState(false);

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
        
        {/* Logo */}
        <Link to="/">
          <img
            className="h-14 object-contain"
            src="/logo.png"
            alt="EventFlow"
          />
        </Link>

        {/* Navigation */}
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

          <Link
  to="/messages"
  className={
    location.pathname === "/messages"
      ? "font-semibold text-blue-600"
      : ""
  }
>
  📨 Messages
</Link>

          <Link
          to="/events-map"
          className={
          location.pathname === "/events-map"
          ? "font-semibold text-blue-600"
          : ""
          }>Explore Map
          </Link>

          {/* User Not Logged In */}
          {!user ? (
            <Link to="/auth" className="btn">
              Sign In
            </Link>
          ) : (
            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2"
              >
                <img
                  src={
                    profilePhoto ||
                    `https://ui-avatars.com/api/?name=${user.name}`
                  }
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                />

                <span className="hidden md:block">
                  {user.name}
                </span>

                <span>▼</span>
              </button>

              {open && (
                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                  
                  <Link
                    to="/profile"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-800"
                  >
                    My Profile
                  </Link>

                  <Link
                    to="/dashboard"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-800"
                  >
                    Dashboard
                  </Link>

                  {user?.role === "customer" && (
                    <Link
                      to="/favorites"
                      onClick={() => setOpen(false)}
                      className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-800"
                    >
                      My Favorites
                    </Link>
                  )}

                  {user?.role === "admin" && (
                    <div>
                      <Link
                        to="/admin/customers"
                        onClick={() => setOpen(false)}
                        className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-800"
                      >
                        Manage Customers
                      </Link>
                      <Link
                        to="/admin/organizers"
                        onClick={() => setOpen(false)}
                        className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-800"
                      >
                        Manage Organizers
                      </Link>
                    </div>
                  )}

                  <Link
                    to="/change-password"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-800"
                  >
                    Change Password
                  </Link>

                  <button
                    onClick={() => {
                      setOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-800"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Theme Toggle */}
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