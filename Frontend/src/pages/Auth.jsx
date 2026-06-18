import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Auth() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isSignup, setIsSignup] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (isSignup) {
        const res = await axios.post(
          "/api/auth/register",
          {
            name,
            email,
            password,
            role,
          }
        );

        login(res.data.user, res.data.token);

        navigate("/");
      } else {
        const res = await axios.post(
          "/api/auth/login",
          {
            email,
            password,
          }
        );

        login(res.data.user, res.data.token);

        navigate("/");
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href =
      "http://localhost:5000/api/auth/google";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">

        {/* Heading */}
        <h1 className="text-3xl font-bold text-center mb-6">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h1>

        {/* Toggle Buttons */}
        <div className="flex mb-6 border rounded-lg overflow-hidden">
          <button
            onClick={() => setIsSignup(false)}
            className={`w-1/2 py-3 font-medium ${
              !isSignup
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            Sign In
          </button>

          <button
            onClick={() => setIsSignup(true)}
            className={`w-1/2 py-3 font-medium ${
              isSignup
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {isSignup && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                required
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                className="w-full border rounded-lg p-3"
              />

              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value)
                }
                className="w-full border rounded-lg p-3"
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
            type="email"
            placeholder="Email Address"
            required
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full border rounded-lg p-3"
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full border rounded-lg p-3"
          />

          {!isSignup && (
            <div className="text-right">
              <button
                type="button"
                onClick={() =>
                  navigate("/forgot-password")
                }
                className="text-blue-600 text-sm"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
          >
            {loading
              ? "Please wait..."
              : isSignup
              ? "Create Account"
              : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <hr className="flex-1" />
          <span className="mx-3 text-gray-500">
            OR
          </span>
          <hr className="flex-1" />
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full border py-3 rounded-lg flex justify-center items-center gap-2 hover:bg-gray-50"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Continue with Google
        </button>

        {/* Bottom Toggle */}
        <div className="mt-6 text-center">
          {isSignup ? (
            <p>
              Already have an account?{" "}
              <button
                onClick={() =>
                  setIsSignup(false)
                }
                className="text-blue-600 font-medium"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{" "}
              <button
                onClick={() =>
                  setIsSignup(true)
                }
                className="text-blue-600 font-medium"
              >
                Create Account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}