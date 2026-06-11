import { useState } from "react";
import axios from "axios";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] =
    useState("");
  const [newPassword, setNewPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);
  const [message, setMessage] =
    useState("");
  const [error, setError] =
    useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const token =
        localStorage.getItem("token");

      const res = await axios.put(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/auth/change-password`,
        {
          oldPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        res.data.message ||
          "Password changed successfully"
      );

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to change password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div
        className="card mx-auto p-4"
        style={{ maxWidth: "500px" }}
      >
        <h2 className="text-center mb-4">
          Change Password
        </h2>

        {message && (
          <div className="alert alert-success">
            {message}
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">
              Current Password
            </label>

            <input
              type="password"
              className="form-control"
              value={oldPassword}
              onChange={(e) =>
                setOldPassword(
                  e.target.value
                )
              }
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              New Password
            </label>

            <input
              type="password"
              className="form-control"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(
                  e.target.value
                )
              }
              required
              minLength={6}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              Confirm New Password
            </label>

            <input
              type="password"
              className="form-control"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading
              ? "Updating..."
              : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;