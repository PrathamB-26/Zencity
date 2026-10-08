import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { mapApi, categoriesApi, wardsApi } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import Button from '../../components/Button';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { HiMapPin, HiXMark } from 'react-icons/hi2';

// Leaflet custom marker icons by priority
const createPin = (color) =>
  new L.DivIcon({
    className: 'custom-pin',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.4);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

const PIN_ICONS = {
  CRITICAL: createPin('#dc2626'), // red
  HIGH: createPin('#ea580c'),     // orange
  MEDIUM: createPin('#2d6a4f'),   // civic green
  LOW: createPin('#6b7280'),      // gray
};

export default function CityComplaintMap() {
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [status, setStatus] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState('');
  const [wardId, setWardId] = useState('');

  useEffect(() => {
    Promise.all([categoriesApi.list(), wardsApi.list()])
      .then(([cRes, wRes]) => {
        if (cRes.data.success) setCategories(cRes.data.data);
        if (wRes.data.success) setWards(wRes.data.data);
      });
  }, []);

  const fetchMapData = () => {
    setLoading(true);
    mapApi.getComplaints({
      status: status || undefined,
      category_id: categoryId || undefined,
      priority: priority || undefined,
      ward_id: wardId || undefined,
      limit: 600,
    })
      .then((res) => {
        if (res.data.success) {
          setComplaints(res.data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMapData();
  }, [status, categoryId, priority, wardId]);

  return (
    <div className="space-y-4">
      {/* Header & Filter Controls */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <HiMapPin className="w-5 h-5 text-civic" /> City Complaint Map
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Geographic spatial distribution showing {complaints.length} geo-tagged civic cases
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white"
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white"
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={wardId}
            onChange={(e) => setWardId(e.target.value)}
            className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white"
          >
            <option value="">All Wards</option>
            {wards.map((w) => (
              <option key={w.ward_id} value={w.ward_id}>{w.ward_name}</option>
            ))}
          </select>

          {(status || priority || wardId || categoryId) && (
            <Button
              variant="ghost"
              size="sm"
              icon={HiXMark}
              onClick={() => { setStatus(''); setPriority(''); setWardId(''); setCategoryId(''); }}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Map Canvas */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm relative h-[680px]">
        {loading ? (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <span className="text-xs text-gray-500">Loading map markers...</span>
          </div>
        ) : (
          <MapContainer center={[18.5204, 73.8567]} zoom={12} scrollWheelZoom={true}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {complaints.map((c) => {
              const lat = parseFloat(c.latitude);
              const lon = parseFloat(c.longitude);
              if (isNaN(lat) || isNaN(lon)) return null;

              const icon = PIN_ICONS[c.priority] || PIN_ICONS.MEDIUM;

              return (
                <Marker key={c.complaint_id} position={[lat, lon]} icon={icon}>
                  <Popup>
                    <div className="p-1 space-y-1.5 max-w-xs text-xs font-sans">
                      <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-1">
                        <span className="font-bold text-gray-900">Case #{c.complaint_id}</span>
                        <StatusBadge status={c.status} />
                      </div>
                      <h4 className="font-semibold text-gray-800 text-xs">{c.title}</h4>
                      <p className="text-[11px] text-gray-600 line-clamp-2">{c.description}</p>
                      <div className="text-[10px] text-gray-400 space-y-0.5 pt-1">
                        <div>Category: <strong>{c.category_name}</strong></div>
                        <div>Ward: <strong>{c.ward_name}</strong></div>
                        <div>Reported: {new Date(c.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="pt-1.5 border-t border-gray-100">
                        <Link
                          to={`/citizen/complaints/${c.complaint_id}`}
                          className="font-bold text-civic hover:underline block text-right"
                        >
                          View Case Record →
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}

        {/* Floating Map Legend */}
        <div className="absolute bottom-5 right-5 z-[1000] bg-white/95 backdrop-blur-sm p-3 rounded-lg border border-gray-200 shadow-md text-xs space-y-1.5 pointer-events-auto">
          <span className="font-bold text-gray-700 block uppercase text-[10px] tracking-wider">Priority Legend</span>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600" />
            <span>Critical SLA (24h)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500" />
            <span>High (48h)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-civic" />
            <span>Medium Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gray-500" />
            <span>Low Priority</span>
          </div>
        </div>
      </div>
    </div>
  );
}
