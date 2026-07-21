import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";

export default function Auth() {
  const [isSignup, setIsSignup] = useState(false);

  const [name, setName] = useState("");
  const [role, setRole] = useState("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      let res;

      if (isSignup) {
        res = await axios.post("/api/auth/signup", {
          name,
          email,
          password,
          role,
        });
      } else {
        res = await axios.post("/api/auth/login", {
          email,
          password,
        });
      }

      login(res.data);
      nav("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `${isSignup ? "Signup" : "Login"} failed`
      );
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800 p-8 transition-colors duration-300">

        {/* Header */}
        <h1 className="text-3xl font-bold text-center mb-2 text-slate-900 dark:text-slate-100">
          EventFlow
        </h1>

        <p className="text-center text-slate-500 dark:text-slate-400 mb-6">
          Welcome to EventFlow
        </p>

        {/* Tabs */}
        <div className="flex mb-6">
          <button
            type="button"
            onClick={() => setIsSignup(false)}
            className={`flex-1 py-3 rounded-l-xl font-medium transition ${
              !isSignup
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            }`}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => setIsSignup(true)}
            className={`flex-1 py-3 rounded-r-xl font-medium transition ${
              isSignup
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={submit} className="space-y-4">

          {isSignup && (
            <>
              <input
                className="input w-full"
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                required
              />

              <select
                className="input w-full"
                value={role}
                onChange={(e) =>
                  setRole(e.target.value)
                }
              >
                <option value="customer">
                  Customer
                </option>

                <option value="organizer">
                  Organizer
                </option>
              </select>
            </>
          )}

          <input
            className="input w-full"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <input
            className="input w-full"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

          {!isSignup && (
            <div className="text-right">
              <a
                href="/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot Password?
              </a>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
          >
            {isSignup
              ? "Create Account"
              : "Sign In"}
          </button>
        </form>

        {/* Google Login Only For Sign In */}
        {!isSignup && (
          <>
            <div className="flex items-center my-5">
              <div className="flex-1 border-t"></div>

              <span className="px-3 text-slate-500 dark:text-slate-400">
                OR
              </span>

              <div className="flex-1 border-t"></div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={async (
                  credentialResponse
                ) => {
                  try {
                    const res = await axios.post(
                      "/api/auth/google-login",
                      {
                        credential:
                          credentialResponse.credential,
                      }
                    );

                    login(res.data);
                    nav("/");
                  } catch (error) {
                    setError(
                      error.response?.data?.message
                    );
                  }
                }}
              />
            </div>
          </>
        )}

        {/* Bottom Toggle */}
        <div className="mt-6 text-center text-sm">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() =>
                  setIsSignup(false)
                }
                className="text-blue-600 font-medium hover:underline"
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() =>
                  setIsSignup(true)
                }
                className="text-blue-600 font-medium hover:underline"
              >
                Create Account
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}