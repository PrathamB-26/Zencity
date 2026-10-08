import React, { useState, useEffect } from 'react';
import { wardsApi } from '../../services/api';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { HiMap } from 'react-icons/hi2';

export default function WardsManagement() {
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    wardsApi.list()
      .then((res) => {
        if (res.data.success) setWards(res.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Municipal Wards & Zones</h1>
        <p className="text-xs text-gray-500 mt-1">12 Administrative subdivisions with geographic centroid coordinates</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-6"><LoadingSkeleton type="table" count={6} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3 text-left">Ward ID</th>
                  <th className="px-4 py-3 text-left">Ward Name</th>
                  <th className="px-4 py-3 text-left">Zone</th>
                  <th className="px-4 py-3 text-left">Centroid GPS</th>
                  <th className="px-4 py-3 text-left">Total Reported</th>
                  <th className="px-4 py-3 text-right">Unresolved Cases</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {wards.map((w) => (
                  <tr key={w.ward_id} className="hover:bg-gray-50/60 transition">
                    <td className="px-4 py-3 font-semibold text-gray-900">#{w.ward_id}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{w.ward_name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-gray-100 text-gray-700">
                        {w.zone}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {w.center_latitude}, {w.center_longitude}
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900">{w.total_complaints || 0}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        {w.unresolved_count || 0} pending
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
