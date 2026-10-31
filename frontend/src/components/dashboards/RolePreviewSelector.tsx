import React from 'react';
import {
  Crown,
  Sparkles,
  DollarSign,
  Radio,
  HeartHandshake,
  Store,
  CheckCircle2,
  ArrowRightLeft,
  UserCheck,
} from 'lucide-react';
import { UserRole } from '../../types';

export interface DemoPersona {
  role: UserRole;
  name: string;
  email: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
}

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    role: 'FOUNDER',
    name: 'Rajesh Singhania',
    email: 'founder@royalknot.com',
    title: 'Executive Founder',
    subtitle: 'Palace Portfolio & Accrual Profitability',
    icon: Crown,
    accentColor: 'border-gold-400 bg-gold-50/70 text-gold-900',
    badgeBg: 'bg-burgundy-900 text-gold-200',
    badgeText: 'Patron',
  },
  {
    role: 'PLANNER',
    name: 'Priya Sharma',
    email: 'priya.sharma@royalknot.com',
    title: 'Lead Wedding Planner',
    subtitle: 'CRM Funnel, 44 Tasks & Sourcing',
    icon: Sparkles,
    accentColor: 'border-purple-300 bg-purple-50/70 text-purple-900',
    badgeBg: 'bg-purple-800 text-purple-100',
    badgeText: 'Architect',
  },
  {
    role: 'FINANCE',
    name: 'Amit Verma',
    email: 'amit.verma@royalknot.com',
    title: 'Finance Director',
    subtitle: 'Treasury, 18% GST & Settlements',
    icon: DollarSign,
    accentColor: 'border-emerald-400 bg-emerald-50/70 text-emerald-900',
    badgeBg: 'bg-emerald-800 text-emerald-100',
    badgeText: 'Treasury',
  },
  {
    role: 'FIELD_COORDINATOR',
    name: 'Vikram Singh',
    email: 'vikram.singh@royalknot.com',
    title: 'Day-Of Coordinator',
    subtitle: 'Live Timeline, Arrivals & Incident Triage',
    icon: Radio,
    accentColor: 'border-amber-400 bg-amber-50/70 text-amber-900',
    badgeBg: 'bg-amber-800 text-amber-100',
    badgeText: 'Ground Ops',
  },
  {
    role: 'CLIENT',
    name: 'Aarav & Meera',
    email: 'aarav.kapoor@example.com',
    title: 'The Royal Couple',
    subtitle: 'Countdown, Agreements, Itinerary & RSVPs',
    icon: HeartHandshake,
    accentColor: 'border-rose-400 bg-rose-50/70 text-rose-900',
    badgeBg: 'bg-rose-800 text-rose-100',
    badgeText: 'Couple',
  },
  {
    role: 'VENDOR',
    name: 'Royal Mewar Caterers',
    email: 'royal.caterers@example.com',
    title: 'Heritage Partner',
    subtitle: 'Palace Call Times, Quotations & Settlements',
    icon: Store,
    accentColor: 'border-blue-400 bg-blue-50/70 text-blue-900',
    badgeBg: 'bg-blue-800 text-blue-100',
    badgeText: 'Partner',
  },
];

interface RolePreviewSelectorProps {
  currentRole: UserRole;
  selectedPreviewRole: UserRole;
  onSelectPreviewRole: (role: UserRole) => void;
  onSwitchLogin: (email: string) => void;
  isSwitching?: boolean;
}

export const RolePreviewSelector: React.FC<RolePreviewSelectorProps> = ({
  currentRole,
  selectedPreviewRole,
  onSelectPreviewRole,
  onSwitchLogin,
  isSwitching = false,
}) => {
  const activePersona = DEMO_PERSONAS.find((p) => p.role === selectedPreviewRole) || DEMO_PERSONAS[0];
  const loggedInPersona = DEMO_PERSONAS.find((p) => p.role === currentRole);

  return (
    <div className="card-luxury p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-white via-gold-50/20 to-white border border-gold-300/80 shadow-md">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3 pb-3 border-b border-gold-200/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-burgundy-900 text-gold-300 flex items-center justify-center font-bold text-xs shadow-xs">
            <ArrowRightLeft className="w-4 h-4 text-gold-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-charcoal-900 uppercase tracking-wider font-serif">
                Role-Based Excellence Dashboard Center
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                6 Tailored Portals
              </span>
            </div>
            <p className="text-[11px] text-charcoal-500">
              Logged in as <span className="font-semibold text-burgundy-800">{loggedInPersona?.name || currentRole}</span>. Click any persona below to preview their specialized luxury dashboard.
            </p>
          </div>
        </div>

        {/* 1-Click Authenticate Action */}
        {selectedPreviewRole !== currentRole && (
          <div className="flex items-center gap-2 self-start lg:self-center">
            <span className="text-[11px] text-charcoal-500 hidden sm:inline">
              Previewing: <strong className="text-charcoal-800">{activePersona.title}</strong>
            </span>
            <button
              onClick={() => onSwitchLogin(activePersona.email)}
              disabled={isSwitching}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-burgundy-800 hover:bg-burgundy-900 text-gold-200 text-xs font-semibold shadow-xs transition-all hover:scale-102 disabled:opacity-50"
            >
              <UserCheck className="w-3.5 h-3.5 text-gold-400" />
              <span>{isSwitching ? 'Switching...' : `Log In As ${activePersona.title}`}</span>
            </button>
          </div>
        )}
      </div>

      {/* Role Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {DEMO_PERSONAS.map((persona) => {
          const Icon = persona.icon;
          const isSelected = selectedPreviewRole === persona.role;
          const isCurrentSession = currentRole === persona.role;

          return (
            <button
              key={persona.role}
              onClick={() => onSelectPreviewRole(persona.role)}
              className={`p-2.5 rounded-xl border text-left transition-all duration-200 relative group flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-br from-gold-100/90 to-amber-50 border-gold-500 shadow-md ring-2 ring-gold-400/40'
                  : 'bg-white/80 hover:bg-gold-50/40 border-gold-200/70 hover:border-gold-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${
                      isSelected ? 'bg-burgundy-900 text-gold-300' : 'bg-gold-100/70 text-burgundy-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {isCurrentSession && (
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-burgundy-700 text-gold-200">
                      <CheckCircle2 className="w-2.5 h-2.5 text-gold-300" /> Active
                    </span>
                  )}
                </div>
                <div className="font-serif font-bold text-xs text-charcoal-900 group-hover:text-burgundy-800 leading-tight">
                  {persona.title}
                </div>
                <div className="text-[10px] text-charcoal-500 font-medium truncate mt-0.5">
                  {persona.name}
                </div>
              </div>
              <div className="mt-2 pt-1 border-t border-gold-200/50 flex items-center justify-between text-[9px] text-charcoal-400">
                <span className="uppercase tracking-wide font-mono font-bold text-gold-800">
                  {persona.badgeText}
                </span>
                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-burgundy-700' : 'bg-charcoal-300'}`} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
