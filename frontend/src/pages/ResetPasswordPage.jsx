import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import Button from '../components/Button';
import { HiLockClosed } from 'react-icons/hi2';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword: password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset link is invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white border border-gray-200 rounded-2xl p-8 text-center">
        <h2 className="text-lg font-bold text-gray-900">Invalid Link</h2>
        <p className="text-xs text-gray-500 mt-2">No reset token found in URL parameters.</p>
        <Link to="/forgot-password" className="inline-block mt-4 text-xs font-semibold text-civic">
          Request new reset link
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-12 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 text-center">Set New Password</h2>
      <p className="text-xs text-gray-500 text-center mt-1">Enter your new secure password below.</p>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
          Password updated successfully. Redirecting to login...
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="new-pass">
            New Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <HiLockClosed className="w-4 h-4" />
            </span>
            <input
              id="new-pass"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-civic focus:border-civic"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="confirm-pass">
            Confirm New Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <HiLockClosed className="w-4 h-4" />
            </span>
            <input
              id="confirm-pass"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-civic focus:border-civic"
            />
          </div>
        </div>

        <Button type="submit" variant="primary" loading={loading} className="w-full">
          Update Password
        </Button>
      </form>
    </div>
  );
}
