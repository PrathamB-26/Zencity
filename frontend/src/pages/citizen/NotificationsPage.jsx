import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationsApi } from '../../services/api';
import Button from '../../components/Button';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { HiBell, HiCheck } from 'react-icons/hi2';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    notificationsApi.list()
      .then((res) => {
        if (res.data.success) {
          setNotifications(res.data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = () => {
    notificationsApi.markRead().then(() => {
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    });
  };

  const markSingleRead = (id) => {
    notificationsApi.markRead(id).then(() => {
      setNotifications(notifications.map((n) => (n.notification_id === id ? { ...n, is_read: true } : n)));
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Activity Notifications</h1>
          <p className="text-xs text-gray-500 mt-1">Real-time alerts regarding status updates and assignments</p>
        </div>
        {notifications.some((n) => !n.is_read) && (
          <Button variant="outline" size="sm" onClick={markAllRead} icon={HiCheck}>
            Mark All as Read
          </Button>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        {loading ? (
          <LoadingSkeleton count={4} />
        ) : notifications.length === 0 ? (
          <EmptyState
            title="No notifications"
            description="You are caught up. Future updates on your complaints will be listed here."
            icon={HiBell}
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <div
                key={n.notification_id}
                className={`py-4 flex items-start justify-between gap-4 transition ${
                  !n.is_read ? 'bg-civic-surface/80 px-3 rounded-lg' : ''
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${!n.is_read ? 'bg-civic' : 'bg-gray-300'}`} />
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {n.type.replace('_', ' ')}
                    </span>
                    <time className="text-[11px] text-gray-400">
                      {new Date(n.created_at).toLocaleString()}
                    </time>
                  </div>
                  <p className="text-sm text-gray-800 font-medium">{n.message}</p>
                  {n.complaint_id && (
                    <Link
                      to={`/citizen/complaints/${n.complaint_id}`}
                      className="inline-block text-xs font-semibold text-civic hover:underline"
                    >
                      View Complaint #{n.complaint_id} →
                    </Link>
                  )}
                </div>

                {!n.is_read && (
                  <button
                    onClick={() => markSingleRead(n.notification_id)}
                    className="text-xs text-gray-400 hover:text-civic flex-shrink-0"
                    title="Mark as read"
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
