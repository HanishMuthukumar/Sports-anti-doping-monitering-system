import React, { useEffect, useState } from 'react';
import { notificationApi } from '../../api/operationsApi';
import { Notification } from '../../types';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { EmptyState } from '../../components/shared/EmptyState';
import { Bell, CheckCheck } from 'lucide-react';

export const AthleteNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const res = await notificationApi.list();
      setNotifications(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    await notificationApi.markAllRead();
    fetchNotifs();
  };

  const handleMarkRead = async (id: string) => {
    await notificationApi.markRead(id);
    fetchNotifs();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Bell className="w-6 h-6 text-teal-600" />
            <span>Programme Notices</span>
          </h2>
          <p className="text-sm text-slate-500">Official testing schedule, sample dispatch, and result alerts.</p>
        </div>
        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            <CheckCheck className="w-4 h-4 mr-1 text-teal-600" />
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-slate-200">
          <EmptyState
            title="No notices"
            description="You have no notifications in your inbox."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.is_read && handleMarkRead(n.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                n.is_read
                  ? 'bg-white border-slate-200 opacity-80'
                  : 'bg-teal-50/50 border-teal-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-semibold text-sm ${n.is_read ? 'text-slate-800' : 'text-teal-900 font-bold'}`}>
                  {n.title}
                </span>
                <span className="text-xs text-slate-400">{n.created_at?.slice(0, 16).replace('T', ' ')}</span>
              </div>
              <p className="text-sm text-slate-600 mt-1">{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
