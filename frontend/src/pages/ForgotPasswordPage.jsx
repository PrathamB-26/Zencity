import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../services/api';
import Button from '../components/Button';
import { HiEnvelope } from 'react-icons/hi2';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ loading: false, success: false, message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, message: '' });
    try {
      const res = await authApi.forgotPassword(email);
      setStatus({
        loading: false,
        success: true,
        message: res.data.message || 'Reset link logged to developer console.',
      });
    } catch (err) {
      setStatus({
        loading: false,
        success: false,
        message: err.response?.data?.message || 'Error requesting reset link.',
      });
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 text-center">Reset Password</h2>
      <p className="text-xs text-gray-500 text-center mt-1">
        Enter your registered email to receive a password reset link.
      </p>

      {status.message && (
        <div
          className={`mt-4 p-3 rounded-lg text-xs font-medium border ${
            status.success ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="forgot-email">
            Email address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <HiEnvelope className="w-4 h-4" />
            </span>
            <input
              id="forgot-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-civic focus:border-civic"
            />
          </div>
        </div>

        <Button type="submit" variant="primary" loading={status.loading} className="w-full">
          Send Reset Instructions
        </Button>
      </form>

      <p className="text-xs text-center text-gray-500 mt-6">
        Remembered password?{' '}
        <Link to="/login" className="text-civic font-semibold hover:underline">
          Return to login
        </Link>
      </p>
    </div>
  );
}
