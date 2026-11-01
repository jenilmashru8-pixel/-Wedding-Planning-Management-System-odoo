import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronDown,
  Crown,
  LogOut,
  Menu,
  Radio,
  Search,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { api } from '../services/api';
import { NotificationItem } from '../types';
import { formatDateTime } from '../utils/formatters';
import { getNavItemsForRole } from './Sidebar';

export const Navbar: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const { user, logout, login } = useAuth();
  const { isConnected } = useSocket();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [search, setSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const availablePages = useMemo(() => getNavItemsForRole(user?.role), [user?.role]);
  const searchResults = search.trim()
    ? availablePages.filter((item) => item.name.toLowerCase().includes(search.trim().toLowerCase())).slice(0, 5)
    : [];

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unreadCount || 0);
      } catch (err) {
        console.error('Failed to load notifications:', err);
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
      console.error('Failed to mark notifications as read:', err);
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

  const openPage = (path: string) => {
    navigate(path);
    setSearch('');
    setIsSearchFocused(false);
  };

  return (
    <div className="border-b border-gold-500/60 bg-navy-900 text-ivory-50">
      <header className="mx-auto flex min-h-[76px] max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-xl border border-gold-400/30 p-2 text-gold-200 transition-colors hover:bg-white/10 lg:hidden"
            aria-label="Open workspace menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => navigate('/')} className="flex min-w-0 items-center gap-3 text-left">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold-300/70 bg-navy-700 text-gold-300 shadow-gold-glow">
              <Crown className="h-5 w-5" />
            </span>
            <span className="hidden min-w-0 sm:block">
              <span className="block truncate font-serif text-base font-semibold tracking-[0.12em] text-gold-100 sm:text-lg">
                THE ROYAL KNOT
              </span>
              <span className="block text-[9px] uppercase tracking-[0.2em] text-gold-300/80">Jaipur · Udaipur · India</span>
            </span>
          </button>
        </div>

        <div className="relative hidden w-full max-w-sm md:block">
          <label htmlFor="workspace-search" className="sr-only">Search workspace pages</label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold-300" />
          <input
            id="workspace-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => window.setTimeout(() => setIsSearchFocused(false), 120)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && searchResults[0]) openPage(searchResults[0].path);
              if (event.key === 'Escape') setIsSearchFocused(false);
            }}
            placeholder="Find an accessible workspace page..."
            className="w-full rounded-full border border-gold-300/40 bg-navy-800/80 py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-ivory-200/50 focus:border-gold-300 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
          />
          {isSearchFocused && search.trim() && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-gold-200 bg-white py-1 text-charcoal-900 shadow-xl">
              {searchResults.length ? searchResults.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    type="button"
                    onMouseDown={() => openPage(item.path)}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs hover:bg-gold-50"
                  >
                    <Icon className="h-4 w-4 text-gold-700" />
                    {item.name}
                  </button>
                );
              }) : <p className="px-4 py-3 text-xs text-charcoal-500">No matching accessible pages</p>}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <span className="hidden items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-medium text-emerald-100 xl:inline-flex">
            <Radio className="h-3 w-3 text-emerald-300" />
            {isConnected ? 'Live sync' : 'Connecting'}
          </span>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsRoleSwitcherOpen(!isRoleSwitcherOpen)}
              className="flex items-center gap-1.5 rounded-full border border-gold-300/40 bg-navy-800 px-2.5 py-2 text-[10px] font-semibold text-gold-100 transition-colors hover:bg-navy-700 sm:px-3"
              title="Switch demo role in 1 click"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-gold-300" />
              <span className="hidden md:inline">{user?.role?.replace('_', ' ')}</span>
              <ChevronDown className="h-3 w-3" />
            </button>
            {isRoleSwitcherOpen && (
              <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-gold-300 bg-white py-2 text-charcoal-900 shadow-xl">
                <p className="border-b border-gold-100 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-charcoal-500">Demo role switcher</p>
                {demoAccounts.map((account) => (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => handleQuickSwitchRole(account.email)}
                    className={`flex w-full items-center justify-between px-3.5 py-2 text-left text-xs hover:bg-gold-50 ${
                      user?.role === account.role ? 'font-bold text-navy-700' : 'text-charcoal-700'
                    }`}
                  >
                    {account.label}
                    {user?.role === account.role && <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
              className="relative rounded-full p-2 text-gold-100 transition-colors hover:bg-white/10"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {isNotifOpen && (
              <div className="absolute right-0 z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-gold-300 bg-white py-3 text-charcoal-900 shadow-xl">
                <div className="flex items-center justify-between border-b border-gold-100 px-4 pb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif text-sm font-bold">Notifications</h4>
                    {unreadCount > 0 && <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[10px] font-bold text-navy-800">{unreadCount} new</span>}
                  </div>
                  {unreadCount > 0 && (
                    <button type="button" onClick={handleMarkAllRead} className="text-xs font-medium text-gold-700 hover:text-navy-700">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 divide-y divide-gold-100 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-6 text-center text-xs text-charcoal-500">No new notifications</p>
                  ) : notifications.map((notification) => (
                    <div key={notification.id} className={`p-3.5 hover:bg-gold-50/60 ${!notification.isRead ? 'bg-gold-50/40' : ''}`}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold">{notification.title}</p>
                        <span className="whitespace-nowrap text-[10px] text-charcoal-500">{formatDateTime(notification.createdAt)}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-charcoal-600">{notification.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 rounded-full border border-gold-300/30 p-1 pr-2 text-left transition-colors hover:bg-white/10"
              aria-label="Open profile menu"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-400 text-xs font-bold uppercase text-navy-950">
                {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
              </span>
              <span className="hidden max-w-28 sm:block">
                <span className="block truncate text-[11px] font-semibold text-gold-100">{user?.firstName} {user?.lastName}</span>
                <span className="block text-[9px] uppercase tracking-wider text-gold-300/80">{user?.role?.replace('_', ' ')}</span>
              </span>
              <ChevronDown className="hidden h-3 w-3 text-gold-200 sm:block" />
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-gold-300 bg-white p-2 text-charcoal-900 shadow-xl">
                <div className="flex items-center gap-2 border-b border-gold-100 px-2 pb-2">
                  <UserRound className="h-4 w-4 text-gold-700" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold">{user?.firstName} {user?.lastName}</p>
                    <p className="truncate text-[10px] text-charcoal-500">{user?.email}</p>
                  </div>
                </div>
                <button type="button" onClick={logout} className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs font-semibold text-rose-700 hover:bg-rose-50">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};
