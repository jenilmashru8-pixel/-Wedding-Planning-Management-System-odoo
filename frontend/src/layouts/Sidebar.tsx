import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquareHeart,
  Users,
  Sparkles,
  FileCheck2,
  Store,
  FileText,
  CalendarCheck,
  UserCheck,
  Radio,
  CreditCard,
  Receipt,
  Scale,
  LineChart,
  UserCog,
  Bell,
  Settings,
  Crown,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils/formatters';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Enquiries / CRM', path: '/enquiries', icon: MessageSquareHeart, roles: ['FOUNDER', 'PLANNER', 'FINANCE'] },
  { name: 'Clients', path: '/clients', icon: Users, roles: ['FOUNDER', 'PLANNER', 'FINANCE', 'CLIENT'] },
  { name: 'Weddings', path: '/weddings', icon: Sparkles },
  { name: 'Agreements', path: '/agreements', icon: FileCheck2 },
  { name: 'Vendors', path: '/vendors', icon: Store },
  { name: 'Quotations', path: '/quotations', icon: FileText },
  { name: 'Wedding Planning', path: '/tasks', icon: CalendarCheck },
  { name: 'Guest Management', path: '/guests', icon: UserCheck },
  { name: 'Live Operations', path: '/operations', icon: Radio, badge: 'Live' },
  { name: 'Payments', path: '/payments', icon: CreditCard },
  { name: 'Expenses & Billing', path: '/expenses', icon: Receipt },
  { name: 'Vendor Settlements', path: '/vendor-settlements', icon: Scale, roles: ['FOUNDER', 'FINANCE', 'PLANNER', 'VENDOR'] },
  { name: 'Financial Reports', path: '/finance', icon: LineChart, roles: ['FOUNDER', 'FINANCE'] },
  { name: 'Team Management', path: '/team', icon: UserCog, roles: ['FOUNDER', 'PLANNER', 'FINANCE'] },
  { name: 'Notifications', path: '/notifications', icon: Bell },
  { name: 'Settings', path: '/settings', icon: Settings, roles: ['FOUNDER', 'PLANNER', 'FINANCE'] },
];

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const filteredItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return user?.role ? item.roles.includes(user.role) : false;
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-charcoal-900/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-burgundy-950 via-burgundy-900 to-burgundy-950 text-white flex flex-col border-r border-gold-500/20 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Emblem */}
        <div className="p-6 border-b border-gold-500/20 bg-burgundy-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gold-600 via-gold-400 to-gold-200 p-0.5 shadow-gold-glow flex items-center justify-center">
              <div className="w-full h-full bg-burgundy-900 rounded-[10px] flex items-center justify-center text-gold-300">
                <Crown className="w-5 h-5 text-gold-400" />
              </div>
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold tracking-wider text-gold-200">THE ROYAL KNOT</h1>
              <p className="text-[10px] uppercase tracking-widest text-gold-400/80 font-medium">Jaipur & Udaipur</p>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group',
                  isActive
                    ? 'bg-gradient-to-r from-gold-500/20 to-gold-400/10 text-gold-200 border border-gold-400/30 shadow-sm'
                    : 'text-ivory-200 hover:text-white hover:bg-white/5'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-colors',
                      isActive ? 'text-gold-400' : 'text-gold-300/60 group-hover:text-gold-300'
                    )}
                  />
                  <span>{item.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-gold-400" />}
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile Card */}
        <div className="p-4 border-t border-gold-500/20 bg-burgundy-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gold-400 text-burgundy-950 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
              {user?.firstName?.[0] || 'U'}
              {user?.lastName?.[0] || 'K'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gold-100 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[10px] text-gold-300/70 font-medium tracking-wide uppercase">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
