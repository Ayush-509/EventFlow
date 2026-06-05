import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Signup() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('/api/auth/signup', {
        name,
        email,
        password,
        role,
      });

      login(res.data);
      nav('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
          Create account
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Join the platform to explore and manage events
        </p>

        {error && (
          <div className="mb-3 text-sm px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          <input
            className="input w-full"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="input w-full"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="input w-full"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <select
            className="input w-full"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="customer">Customer</option>
            <option value="organizer">Organizer</option>
          </select>

          <button className="btn w-full mt-2">
            Sign up
          </button>
        </form>

        <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Have an account?{' '}
          <Link to="/login" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}