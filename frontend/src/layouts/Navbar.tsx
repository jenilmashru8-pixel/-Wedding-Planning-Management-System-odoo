import React, { useState, useEffect } from 'react';
import { Menu, Bell, LogOut, Radio, UserCheck, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { api } from '../services/api';
import { NotificationItem } from '../types';
import { formatDateTime } from '../utils/formatters';

export const Navbar: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const { user, logout, login } = useAuth();
  const { isConnected } = useSocket();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unreadCount || 0);
      } catch (err) {
        // Silently fail if not logged in
      }
    };

    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const demoAccounts = [
    { role: 'FOUNDER', label: 'Founder / Admin', email: 'founder@royalknot.com' },
    { role: 'PLANNER', label: 'Wedding Planner', email: 'priya.sharma@royalknot.com' },
    { role: 'FINANCE', label: 'Finance Manager', email: 'amit.verma@royalknot.com' },
    { role: 'FIELD_COORDINATOR', label: 'Field Coordinator', email: 'vikram.singh@royalknot.com' },
    { role: 'CLIENT', label: 'Client / Couple', email: 'aarav.kapoor@example.com' },
    { role: 'VENDOR', label: 'Vendor Partner', email: 'royal.caterers@example.com' },
  ];

  const handleQuickSwitchRole = async (email: string) => {
    try {
      await login(email, 'RoyalKnot@2026');
      setIsRoleSwitcherOpen(false);
      window.location.reload();
    } catch (err) {
      console.error('Failed to switch role:', err);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-gold-200/80 px-4 lg:px-8 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl text-charcoal-700 hover:bg-gold-50 lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-burgundy-700 bg-burgundy-50 px-2.5 py-1 rounded-lg border border-burgundy-200">
            Agency Management System
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
            {isConnected ? 'Live Sync Active' : 'Connecting'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Fast Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsRoleSwitcherOpen(!isRoleSwitcherOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gold-50 hover:bg-gold-100 text-burgundy-800 rounded-xl border border-gold-300 text-xs font-semibold shadow-xs transition-all"
            title="Switch demo role in 1 click"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
            <span className="hidden md:inline">Role:</span>
            <span className="uppercase text-burgundy-900">{user?.role?.replace('_', ' ')}</span>
          </button>

          {isRoleSwitcherOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-gold-300 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 border-b border-gold-100">
                <p className="text-[10px] uppercase font-bold text-charcoal-400 tracking-wider">Fast Role Switcher (1-Click)</p>
              </div>
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  onClick={() => handleQuickSwitchRole(acc.email)}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-gold-50/70 transition-colors ${
                    user?.role === acc.role ? 'font-bold text-burgundy-700 bg-gold-50' : 'text-charcoal-700'
                  }`}
                >
                  <span>{acc.label}</span>
                  {user?.role === acc.role && <span className="w-2 h-2 rounded-full bg-burgundy-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-xl text-charcoal-600 hover:text-burgundy-700 hover:bg-gold-50 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-gold-300 shadow-xl py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 pb-2 border-b border-gold-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-serif font-bold text-sm text-charcoal-900">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-burgundy-100 text-burgundy-800 text-[10px] font-bold rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-gold-700 hover:text-burgundy-700 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-charcoal-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-charcoal-400">No new notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 hover:bg-gold-50/50 transition-colors ${!n.isRead ? 'bg-gold-50/25' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-charcoal-900">{n.title}</p>
                        <span className="text-[10px] text-charcoal-400 whitespace-nowrap">{formatDateTime(n.createdAt)}</span>
                      </div>
                      <p className="text-xs text-charcoal-600 mt-0.5">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="p-2 rounded-xl text-charcoal-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
