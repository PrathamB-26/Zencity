import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { complaintsApi, feedbackApi } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import ComplaintTimeline from '../../components/ComplaintTimeline';
import Button from '../../components/Button';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import {
  HiArrowLeft,
  HiMapPin,
  HiStar,
  HiCheckCircle,
  HiExclamationCircle,
} from 'react-icons/hi2';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function ComplaintDetails() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Feedback form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const fetchDetails = () => {
    complaintsApi.getById(id)
      .then((res) => {
        if (res.data.success) {
          setComplaint(res.data.complaint);
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Unable to load complaint details.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      const res = await feedbackApi.create({
        complaint_id: complaint.complaint_id,
        rating,
        comment,
      });
      if (res.data.success) {
        setFeedbackSuccess(true);
        fetchDetails(); // Refresh to show CLOSED status
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-xl mx-auto text-center py-12 bg-white rounded-xl border border-gray-200 p-8">
        <HiExclamationCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
        <h2 className="text-base font-bold text-gray-900">Error Loading Ticket</h2>
        <p className="text-xs text-gray-500 mt-1">{error}</p>
        <Link to="/citizen/complaints" className="inline-block mt-4 text-xs font-semibold text-civic">
          ← Back to complaints list
        </Link>
      </div>
    );
  }

  const coords = [
    complaint.latitude ? parseFloat(complaint.latitude) : 18.5204,
    complaint.longitude ? parseFloat(complaint.longitude) : 73.8567,
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/citizen/complaints" className="text-xs text-gray-500 hover:text-civic flex items-center gap-1 mb-2">
            <HiArrowLeft className="w-3.5 h-3.5" /> Back to My Complaints
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">Case #{complaint.complaint_id}</h1>
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Reported on {new Date(complaint.created_at).toLocaleString()}
          </p>
        </div>

        {complaint.due_date && (
          <div className="text-right sm:border-l sm:pl-4 sm:border-gray-200">
            <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold block">SLA Target Due Date</span>
            <span className="text-xs font-bold text-gray-800">{new Date(complaint.due_date).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Lifecycle Progress Stepper */}
      <ComplaintTimeline currentStatus={complaint.status} history={complaint.history || []} />

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Information & Image */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <div>
              <span className="text-xs font-semibold text-civic-dark uppercase tracking-wider">
                {complaint.category_group} / {complaint.category_name}
              </span>
              <h2 className="text-lg font-bold text-gray-900 mt-1">{complaint.title}</h2>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Problem Description</h4>
              <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap leading-relaxed">
                {complaint.description}
              </p>
            </div>

            {/* Evidence Image */}
            {complaint.image && (
              <div>
                <h4 className="text-xs font-semibold uppercase text-gray-400 tracking-wider mb-2">Attached Evidence</h4>
                <div className="rounded-lg overflow-hidden border border-gray-200 max-h-72 bg-gray-50 flex items-center justify-center">
                  <img
                    src={complaint.image.startsWith('http') ? complaint.image : complaint.image}
                    alt="Evidence photograph"
                    className="max-h-72 w-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Citizen Feedback Form (Only when RESOLVED) */}
          {complaint.status === 'RESOLVED' && !complaint.feedback_rating && !feedbackSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <HiCheckCircle className="w-6 h-6 text-emerald-600" />
                <h3 className="text-base font-bold text-emerald-950">Resolution Feedback Required</h3>
              </div>
              <p className="text-xs text-emerald-800 mb-4">
                Field teams marked this civic issue as resolved. Please verify the repair and provide rating feedback to close the case.
              </p>

              <form onSubmit={handleFeedbackSubmit} className="space-y-4 bg-white p-4 rounded-lg border border-emerald-100">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Satisfaction Rating (1 to 5 Stars)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className={`p-1 rounded transition ${star <= rating ? 'text-amber-400' : 'text-gray-300'}`}
                      >
                        <HiStar className="w-7 h-7 fill-current" />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-gray-700 ml-2">{rating} / 5 Stars</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="fb-comment">
                    Remarks on Repair Work
                  </label>
                  <textarea
                    id="fb-comment"
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Comment on repair speed, thoroughness, or remaining issues..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-civic"
                  />
                </div>

                <Button type="submit" variant="primary" loading={submittingFeedback}>
                  Submit Rating & Close Ticket
                </Button>
              </form>
            </div>
          )}

          {/* Recorded Feedback Display */}
          {(complaint.feedback_rating || feedbackSuccess) && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Recorded Citizen Satisfaction</h3>
              <div className="flex items-center gap-1 text-amber-400 mb-2">
                {Array.from({ length: complaint.feedback_rating || rating }).map((_, i) => (
                  <HiStar key={i} className="w-5 h-5 fill-current" />
                ))}
                <span className="text-xs font-bold text-gray-700 ml-2">
                  {complaint.feedback_rating || rating} / 5 Stars
                </span>
              </div>
              <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded border border-gray-100 italic">
                "{complaint.feedback_comment || comment || 'Resolution confirmed.'}"
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Municipal Assignment & Map */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 pb-2 border-b border-gray-100">
              Municipal Assignment
            </h3>

            <div>
              <span className="text-[11px] uppercase text-gray-400 font-semibold block">Responsible Department</span>
              <span className="text-sm font-bold text-gray-900">{complaint.department_name || 'Unassigned'}</span>
            </div>

            <div>
              <span className="text-[11px] uppercase text-gray-400 font-semibold block">Administrative Ward</span>
              <span className="text-sm font-semibold text-gray-800">{complaint.ward_name} ({complaint.zone})</span>
            </div>

            <div>
              <span className="text-[11px] uppercase text-gray-400 font-semibold block">Assigned Officer</span>
              <span className="text-sm font-semibold text-gray-800">
                {complaint.officer_name || 'Awaiting field crew allocation'}
              </span>
            </div>

            <div>
              <span className="text-[11px] uppercase text-gray-400 font-semibold block">Reported Locality</span>
              <span className="text-xs text-gray-600">{complaint.location_text || 'Coordinates provided'}</span>
            </div>
          </div>

          {/* Interactive Mini Map */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-2">
            <div className="flex items-center gap-1 text-xs font-bold text-gray-900 uppercase">
              <HiMapPin className="w-4 h-4 text-civic" /> Issue Location Map
            </div>
            <div className="h-52 rounded-lg overflow-hidden border border-gray-200">
              <MapContainer center={coords} zoom={14} scrollWheelZoom={false}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={coords} icon={markerIcon}>
                  <Popup>
                    <div className="text-xs">
                      <strong>#{complaint.complaint_id}</strong>: {complaint.title}
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
            <span className="text-[10px] text-gray-400 block text-right">
              Lat: {coords[0].toFixed(4)}, Lon: {coords[1].toFixed(4)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
