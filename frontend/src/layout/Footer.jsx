import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900">ZenCity</span>
              <span className="text-xs text-gray-400">| Smart City Complaint & Analytics Platform</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Demonstration platform for PostgreSQL DBMS and Python Data Visualization.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-500">
            <Link to="/terms" className="hover:text-civic transition">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-civic transition">Privacy Policy</Link>
            <a href="https://github.com/PrathamB-26/Zencity" target="_blank" rel="noreferrer" className="hover:text-civic transition">
              GitHub Repository
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
