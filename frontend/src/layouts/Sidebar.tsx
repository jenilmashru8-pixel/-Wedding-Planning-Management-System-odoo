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
  ChevronRight,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { cn } from '../utils/formatters';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  roles?: UserRole[];
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

export const getNavItemsForRole = (role?: UserRole) =>
  navItems.filter((item) => !item.roles || (role ? item.roles.includes(role) : false));

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  const filteredItems = getNavItemsForRole(user?.role);

  const linkClass = (path: string, mobile = false) => {
    const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
    return cn(
      'group flex items-center gap-2 whitespace-nowrap rounded-lg text-xs font-medium transition-colors',
      mobile ? 'w-full px-4 py-3' : 'px-3 py-2',
      active
        ? 'bg-gold-400 text-navy-950 shadow-sm'
        : 'text-ivory-100/85 hover:bg-white/10 hover:text-gold-200'
    );
  };

  return (
    <div className="relative border-b border-gold-500/60 bg-navy-600 text-white">
      <nav aria-label="Primary navigation" className="hidden lg:block">
        <div className="mx-auto flex max-w-[1600px] gap-1 overflow-x-auto px-6 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.path} to={item.path} className={linkClass(item.path)}>
                <Icon className="h-4 w-4 shrink-0 text-gold-300 group-hover:text-current" />
                <span>{item.name}</span>
                {item.badge && (
                  <span className="rounded-full border border-gold-300/40 bg-gold-300/10 px-1.5 py-0.5 text-[9px] font-bold text-gold-200">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-30 bg-navy-950/50 lg:hidden"
            onClick={onClose}
          />
          <nav
            aria-label="Mobile navigation"
            className="absolute inset-x-0 top-full z-40 grid max-h-[calc(100vh-7rem)] grid-cols-1 gap-1 overflow-y-auto border-t border-gold-400/30 bg-navy-700 p-3 shadow-2xl sm:grid-cols-2 lg:hidden"
          >
            <div className="col-span-full flex items-center justify-between border-b border-gold-400/20 px-3 pb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-200">Workspace menu</span>
              <button type="button" onClick={onClose} aria-label="Close menu" className="rounded-lg p-2 text-gold-200 hover:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            </div>
            {filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.path} to={item.path} onClick={onClose} className={linkClass(item.path, true)}>
                  <Icon className="h-4 w-4 shrink-0 text-gold-300" />
                  <span>{item.name}</span>
                  {item.badge && <span className="ml-auto text-[9px] uppercase tracking-wider text-gold-200">{item.badge}</span>}
                  <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />
                </NavLink>
              );
            })}
          </nav>
        </>
      )}
    </div>
  );
};
