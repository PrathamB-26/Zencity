import React, { useState, useEffect } from 'react';
import { departmentsApi } from '../../services/api';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { HiBuildingOffice2 } from 'react-icons/hi2';

export default function DepartmentsManagement() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    departmentsApi.list()
      .then((res) => {
        if (res.data.success) setDepartments(res.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Municipal Departments</h1>
        <p className="text-xs text-gray-500 mt-1">Operational divisions handling civic complaints</p>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((d) => (
            <div key={d.department_id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-civic-pale text-civic-dark">
                  <HiBuildingOffice2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">{d.department_name}</h3>
                  <span className="text-[11px] text-gray-400">ID #{d.department_id}</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed min-h-[3rem]">{d.description}</p>
              <div className="pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="font-bold text-gray-900 block">{d.total_complaints || 0}</span>
                  <span className="text-gray-400 text-[10px]">Total Cases</span>
                </div>
                <div>
                  <span className="font-bold text-emerald-600 block">{d.resolved_count || 0}</span>
                  <span className="text-gray-400 text-[10px]">Resolved</span>
                </div>
                <div>
                  <span className="font-bold text-civic block">{d.officer_count || 0}</span>
                  <span className="text-gray-400 text-[10px]">Officers</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
