import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { HiLockClosed, HiEnvelope } from 'react-icons/hi2';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'OFFICER') {
        navigate('/officer/dashboard');
      } else {
        navigate('/citizen/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Email or password is incorrect.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="max-w-md mx-auto my-10 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Sign in to ZenCity</h2>
        <p className="text-xs text-gray-500 mt-1">Access your municipal civic dashboard</p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="login-email">
            Email address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <HiEnvelope className="w-4 h-4" />
            </span>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-civic focus:border-civic"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-gray-700" htmlFor="login-password">
              Password <span className="text-rose-500">*</span>
            </label>
            <Link to="/forgot-password" className="text-xs text-civic hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <HiLockClosed className="w-4 h-4" />
            </span>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-civic focus:border-civic"
            />
          </div>
        </div>

        <Button type="submit" variant="primary" loading={loading} className="w-full mt-2">
          Sign In
        </Button>
      </form>

      {/* Demo Credentials Quick-Fill Panel */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block text-center mb-3">
          Quick Demo Accounts (Password: password123)
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickFill('admin@zencity.local')}
            className="p-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-civic-pale hover:border-civic transition text-center"
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('officer.road1@zencity.local')}
            className="p-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-civic-pale hover:border-civic transition text-center"
          >
            Officer
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('citizen1@zencity.local')}
            className="p-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-civic-pale hover:border-civic transition text-center"
          >
            Citizen
          </button>
        </div>
      </div>

      <p className="text-xs text-center text-gray-500 mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-civic hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
}
