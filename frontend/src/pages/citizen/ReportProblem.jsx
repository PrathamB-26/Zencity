import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { categoriesApi, wardsApi, complaintsApi } from '../../services/api';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import {
  HiMapPin,
  HiPhoto,
  HiXMark,
  HiCheckCircle,
  HiExclamationCircle,
} from 'react-icons/hi2';

// Fix Leaflet default icon paths in React
const customPinIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} icon={customPinIcon} /> : null;
}

export default function ReportProblem() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [wardId, setWardId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [locationText, setLocationText] = useState('');
  const [coords, setCoords] = useState([18.5204, 73.8567]); // Default city center

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedComplaint, setSubmittedComplaint] = useState(null);

  useEffect(() => {
    Promise.all([categoriesApi.list(), wardsApi.list()])
      .then(([catRes, wardRes]) => {
        if (catRes.data.success) {
          setCategories(catRes.data.data);
          if (catRes.data.data.length > 0) setCategoryId(catRes.data.data[0].category_id);
        }
        if (wardRes.data.success) {
          setWards(wardRes.data.data);
          if (wardRes.data.data.length > 0) setWardId(wardRes.data.data[0].ward_id);
        }
      })
      .catch((err) => console.error('Error fetching lookups:', err))
      .finally(() => setLoadingLookups(false));
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {
          alert('Unable to access device GPS coordinates.');
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim()) {
      setError('Please provide a complaint title and description.');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('category_id', categoryId);
    formData.append('ward_id', wardId);
    formData.append('priority', priority);
    formData.append('location_text', locationText.trim());
    formData.append('latitude', coords[0]);
    formData.append('longitude', coords[1]);

    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const res = await complaintsApi.create(formData);
      if (res.data.success) {
        setSubmittedComplaint(res.data.complaint);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to register complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Report a Civic Problem</h1>
        <p className="text-xs text-gray-500 mt-1">
          Provide detailed issue information and pin the problem site for municipal dispatch.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
          <HiExclamationCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Complaint Information */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 pb-2 border-b border-gray-100">
            1. Issue Details
          </h2>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="c-title">
              Complaint Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="c-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep pothole causing two-wheeler skidding"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-civic focus:border-civic"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="c-cat">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                id="c-cat"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-civic focus:border-civic bg-white"
              >
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.category_name} ({c.category_group})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="c-ward">
                Administrative Ward <span className="text-rose-500">*</span>
              </label>
              <select
                id="c-ward"
                value={wardId}
                onChange={(e) => {
                  setWardId(e.target.value);
                  const selected = wards.find((w) => w.ward_id === parseInt(e.target.value, 10));
                  if (selected && selected.center_latitude && selected.center_longitude) {
                    setCoords([parseFloat(selected.center_latitude), parseFloat(selected.center_longitude)]);
                  }
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-civic focus:border-civic bg-white"
              >
                {wards.map((w) => (
                  <option key={w.ward_id} value={w.ward_id}>
                    {w.ward_name} ({w.zone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="c-priority">
                Urgency Priority
              </label>
              <select
                id="c-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-civic focus:border-civic bg-white"
              >
                <option value="LOW">Low (SLA: 7 Days)</option>
                <option value="MEDIUM">Medium (SLA: 4 Days)</option>
                <option value="HIGH">High (SLA: 48 Hours)</option>
                <option value="CRITICAL">Critical (SLA: 24 Hours)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="c-desc">
              Detailed Problem Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="c-desc"
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact landmarks, dimensions of damage, and safety hazards..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-civic focus:border-civic"
            />
          </div>
        </div>

        {/* Section 2: Location Map Pin Selection */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">
              2. Geographic Location
            </h2>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="text-xs font-semibold text-civic hover:underline flex items-center gap-1"
            >
              <HiMapPin className="w-4 h-4" /> Use Current GPS
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="c-loc-text">
              Street / Landmark Address
            </label>
            <input
              id="c-loc-text"
              type="text"
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              placeholder="e.g. Near Ganpati Temple Chowk, Main Street"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-civic focus:border-civic"
            />
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-2">
              Click anywhere on the map to accurately place the complaint marker.
            </p>
            <div className="h-64 rounded-lg overflow-hidden border border-gray-200 relative">
              <MapContainer center={coords} zoom={13} scrollWheelZoom={false}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={coords} setPosition={setCoords} />
              </MapContainer>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span>Latitude: <strong>{coords[0].toFixed(5)}</strong></span>
              <span>Longitude: <strong>{coords[1].toFixed(5)}</strong></span>
            </div>
          </div>
        </div>

        {/* Section 3: Evidence Image Upload */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 pb-2 border-b border-gray-100">
            3. Photographic Evidence
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <label className="flex-1 w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-civic transition bg-civic-surface">
              <HiPhoto className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-xs font-semibold text-gray-700">Upload on-site photograph</span>
              <span className="text-[11px] text-gray-400 mt-1">JPEG, PNG, WEBP up to 5MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {imagePreview && (
              <div className="relative w-36 h-36 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-black"
                >
                  <HiXMark className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => navigate('/citizen/dashboard')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={submitting} icon={HiCheckCircle}>
            Submit Complaint
          </Button>
        </div>
      </form>

      {/* Submission Success Dialog */}
      {submittedComplaint && (
        <Modal
          isOpen={true}
          onClose={() => navigate(`/citizen/complaints/${submittedComplaint.complaint_id}`)}
          title="Complaint Registered"
        >
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <HiCheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Case #{submittedComplaint.complaint_id} Created</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Your civic report has been submitted to the municipal database and routed for department dispatch.
              </p>
            </div>
            <div className="pt-4 flex justify-center gap-3">
              <Button
                variant="primary"
                onClick={() => navigate(`/citizen/complaints/${submittedComplaint.complaint_id}`)}
              >
                Track Complaint Now
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSubmittedComplaint(null);
                  setTitle('');
                  setDescription('');
                  removeImage();
                }}
              >
                Submit Another
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
