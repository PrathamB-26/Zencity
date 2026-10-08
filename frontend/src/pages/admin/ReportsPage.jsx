import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../../services/api';
import Button from '../../components/Button';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { HiPrinter, HiArrowDownTray } from 'react-icons/hi2';

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getFull()
      .then((res) => {
        if (res.data.success) setData(res.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <LoadingSkeleton count={3} />;

  const kpis = data?.kpis || {};
  const catStats = data?.category_statistics?.category_breakdown || [];
  const deptStats = data?.department_statistics?.department_breakdown || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center justify-between no-print">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Municipal Summary Report</h1>
          <p className="text-xs text-gray-500 mt-1">Exportable executive summary of civic operations and resolution metrics</p>
        </div>
        <Button variant="primary" icon={HiPrinter} onClick={handlePrint}>
          Print / Save PDF
        </Button>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-gray-900">ZenCity Municipal Report</h2>
            <span className="text-xs text-gray-500">Date: {new Date().toLocaleDateString()}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Smart City Complaint & DBMS Analytics Platform</p>
        </div>

        {/* Executive KPIs */}
        <div>
          <h3 className="text-sm font-bold uppercase text-gray-700 tracking-wider mb-3">1. Executive Overview</h3>
          <div className="grid grid-cols-4 gap-4 text-center border border-gray-200 rounded-lg p-4 bg-gray-50/50">
            <div>
              <span className="text-xl font-bold text-gray-900 block">{kpis.total_complaints}</span>
              <span className="text-xs text-gray-500">Total Cases</span>
            </div>
            <div>
              <span className="text-xl font-bold text-emerald-700 block">{kpis.resolution_rate}%</span>
              <span className="text-xs text-gray-500">Resolution Rate</span>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900 block">{kpis.average_resolution_time_days} days</span>
              <span className="text-xs text-gray-500">Avg Resolution Speed</span>
            </div>
            <div>
              <span className="text-xl font-bold text-amber-600 block">{kpis.average_citizen_rating} ★</span>
              <span className="text-xs text-gray-500">Citizen Rating</span>
            </div>
          </div>
        </div>

        {/* Department Table */}
        <div>
          <h3 className="text-sm font-bold uppercase text-gray-700 tracking-wider mb-3">2. Department Performance</h3>
          <table className="min-w-full divide-y divide-gray-200 text-xs border border-gray-200">
            <thead className="bg-gray-50 text-gray-600 font-semibold">
              <tr>
                <th className="p-2 text-left">Department</th>
                <th className="p-2 text-right">Assigned</th>
                <th className="p-2 text-right">Resolved</th>
                <th className="p-2 text-right">Pending</th>
                <th className="p-2 text-right">Rate</th>
                <th className="p-2 text-right">Avg Days</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {deptStats.map((d) => (
                <tr key={d.department_name}>
                  <td className="p-2 font-medium">{d.department_name}</td>
                  <td className="p-2 text-right">{d.total_assigned}</td>
                  <td className="p-2 text-right text-emerald-600 font-semibold">{d.resolved_count}</td>
                  <td className="p-2 text-right text-amber-600">{d.pending_count}</td>
                  <td className="p-2 text-right font-bold">{d.resolution_rate}%</td>
                  <td className="p-2 text-right">{d.avg_res_days}d</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top Problem Categories */}
        <div>
          <h3 className="text-sm font-bold uppercase text-gray-700 tracking-wider mb-3">3. Major Civic Categories</h3>
          <table className="min-w-full divide-y divide-gray-200 text-xs border border-gray-200">
            <thead className="bg-gray-50 text-gray-600 font-semibold">
              <tr>
                <th className="p-2 text-left">Category</th>
                <th className="p-2 text-right">Complaint Count</th>
                <th className="p-2 text-right">Share of Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {catStats.slice(0, 6).map((c) => (
                <tr key={c.category_name}>
                  <td className="p-2 font-medium">{c.category_name}</td>
                  <td className="p-2 text-right font-bold text-gray-900">{c.count}</td>
                  <td className="p-2 text-right text-gray-600">{c.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
