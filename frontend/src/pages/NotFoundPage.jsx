import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { HiHome } from 'react-icons/hi2';

export default function NotFoundPage() {
  return (
    <div className="max-w-md mx-auto my-16 bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
      <span className="text-5xl font-extrabold text-civic">404</span>
      <h2 className="text-xl font-bold text-gray-900 mt-3">Page Not Found</h2>
      <p className="text-xs text-gray-500 mt-2">
        The requested municipal page or complaint resource does not exist.
      </p>
      <div className="mt-6">
        <Link to="/">
          <Button variant="primary" icon={HiHome}>
            Return to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
}
