import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  ExternalLink,
  CheckCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { NotificationItem } from '../types';
import { formatDate } from '../utils/formatters';
import { EmptyState } from '../components/EmptyState';

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data.notifications);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gold-500/10 text-gold-600 border border-gold-500/20">
              <Bell className="w-5 h-5" />
            </span>
            <h1 className="font-serif text-2xl lg:text-3xl font-bold text-burgundy-900">
              Notifications & Operational Alerts
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs lg:text-sm text-charcoal-600 mt-1">
            Real-time milestone events, vendor delays, client signature alerts, and incident broadcasts.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-ivory-100 hover:bg-gold-500/10 text-burgundy-900 text-xs font-semibold border border-gold-300 transition-all shadow-sm"
          >
            <CheckCheck className="w-4 h-4 text-gold-600" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="p-12 text-center text-charcoal-400">Loading alerts...</div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No Notifications"
          description="You are fully up-to-date. Live alerts and operational notices will appear here."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => {
            const isAlert = item.type === 'ALERT' || item.type === 'WARNING';
            const isSuccess = item.type === 'SUCCESS';

            return (
              <div
                key={item.id}
                onClick={() => !item.isRead && handleMarkAsRead(item.id)}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-4 cursor-pointer ${
                  !item.isRead
                    ? 'bg-white border-gold-300 shadow-md ring-1 ring-gold-400/30'
                    : 'bg-ivory-50/60 border-charcoal-100 opacity-80'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isAlert
                      ? 'bg-rose-100 text-rose-700'
                      : isSuccess
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gold-500/10 text-gold-700'
                  }`}
                >
                  {isAlert ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : isSuccess ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Info className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      className={`text-sm font-semibold truncate ${
                        !item.isRead ? 'text-burgundy-950 font-bold' : 'text-charcoal-800'
                      }`}
                    >
                      {item.title}
                    </h3>
                    <span className="text-[10px] text-charcoal-400 whitespace-nowrap">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">{item.message}</p>

                  <div className="flex items-center gap-3 mt-2 text-[11px]">
                    {item.linkUrl && (
                      <a
                        href={item.linkUrl}
                        className="font-semibold text-gold-700 hover:text-burgundy-900 inline-flex items-center gap-1"
                      >
                        <span>View Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {!item.isRead && (
                      <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                        • New Alert
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default Notifications;
