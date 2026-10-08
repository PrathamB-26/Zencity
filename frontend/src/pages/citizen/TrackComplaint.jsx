import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import { HiMagnifyingGlass } from 'react-icons/hi2';

export default function TrackComplaint() {
  const [complaintId, setComplaintId] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const clean = complaintId.replace('#', '').trim();
    if (clean) {
      navigate(`/citizen/complaints/${clean}`);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-12 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-center">
      <div className="w-12 h-12 bg-civic-pale text-civic-dark rounded-full flex items-center justify-center mx-auto mb-3">
        <HiMagnifyingGlass className="w-6 h-6" />
      </div>
      <h1 className="text-xl font-bold text-gray-900">Track Civic Complaint</h1>
      <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
        Enter your municipal case ID to inspect real-time dispatch status, field progress, and completion timeline.
      </p>

      <form onSubmit={handleSearch} className="mt-6 flex gap-2">
        <input
          type="number"
          required
          value={complaintId}
          onChange={(e) => setComplaintId(e.target.value)}
          placeholder="e.g. 1045"
          className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-civic"
        />
        <Button type="submit" variant="primary">
          Track Status
        </Button>
      </form>
    </div>
  );
}
