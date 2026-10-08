import React from 'react';

export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">System Configuration & Diagnostics</h1>
        <p className="text-xs text-gray-500 mt-1">Platform architecture parameters, ports, and demo accounts</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6 text-sm">
        <div>
          <h3 className="font-bold text-gray-900 mb-2">Service Endpoints</h3>
          <div className="space-y-2 text-xs font-mono bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div>Frontend React (Vite): <strong>http://localhost:5173</strong></div>
            <div>Backend Express API: <strong>http://localhost:5000/api</strong></div>
            <div>Python Analytics API: <strong>http://127.0.0.1:8000</strong></div>
            <div>PostgreSQL Database: <strong>localhost:5432 (zencity_db)</strong></div>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-gray-900 mb-2">Default Demo Credentials</h3>
          <div className="overflow-x-auto text-xs">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-100 rounded">
              <thead className="bg-gray-50 font-semibold text-gray-700">
                <tr>
                  <th className="p-2 text-left">Role</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Password</th>
                  <th className="p-2 text-left">Scope</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="p-2 font-bold text-purple-700">ADMIN</td>
                  <td className="p-2 font-mono">admin@zencity.local</td>
                  <td className="p-2 font-mono">password123</td>
                  <td className="p-2 text-gray-500">Full municipal control & analytics</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold text-blue-700">OFFICER</td>
                  <td className="p-2 font-mono">officer.road1@zencity.local</td>
                  <td className="p-2 font-mono">password123</td>
                  <td className="p-2 text-gray-500">Road Department field work queue</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold text-emerald-700">CITIZEN</td>
                  <td className="p-2 font-mono">citizen1@zencity.local</td>
                  <td className="p-2 font-mono">password123</td>
                  <td className="p-2 text-gray-500">Civic reporting & feedback tracking</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-gray-900 mb-2">DBMS Concepts Implemented</h3>
          <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
            <li>PostgreSQL schema with PRIMARY KEY, FOREIGN KEY, CHECK, UNIQUE, NOT NULL</li>
            <li>6 Relational Views for pre-aggregated statistical summaries</li>
            <li>Window functions (ROW_NUMBER, SUM OVER, LAG) for ward ranking and running totals</li>
            <li>Database transactions (BEGIN / COMMIT / ROLLBACK) for status lifecycle and audit log integrity</li>
            <li>B-Tree multi-column indexing on spatial coordinates, categories, and status</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
