import React, { useEffect, useState } from 'react';
import { CalendarDays, CircleDollarSign, HeartHandshake, Wallet } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { UserRole } from '../types';
import { formatLakhsCrores } from '../utils/formatters';
import { MetricCard } from '../components/MetricCard';
import { RolePreviewSelector } from '../components/dashboards/RolePreviewSelector';
import { FounderDashboard } from '../components/dashboards/FounderDashboard';
import { PlannerDashboard } from '../components/dashboards/PlannerDashboard';
import { FinanceDashboard } from '../components/dashboards/FinanceDashboard';
import { CoordinatorDashboard } from '../components/dashboards/CoordinatorDashboard';
import { ClientDashboard } from '../components/dashboards/ClientDashboard';
import { VendorDashboard } from '../components/dashboards/VendorDashboard';
import { WeddingHero } from '../components/dashboards/WeddingHero';
import { DashboardOverview } from '../components/dashboards/DashboardOverview';

export const Dashboard: React.FC = () => {
  const { user, login } = useAuth();
  const [selectedPreviewRole, setSelectedPreviewRole] = useState<UserRole>(user?.role || 'FOUNDER');
  const [isSwitching, setIsSwitching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [financeData, setFinanceData] = useState<any>(null);
  const [weddings, setWeddings] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [taskStats, setTaskStats] = useState<any>({});
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [agreements, setAgreements] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [vendorCheckIns, setVendorCheckIns] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [vendorInvoices, setVendorInvoices] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [clientPayments, setClientPayments] = useState<any[]>([]);
  const [guests, setGuests] = useState<any[]>([]);
  const [extraExpenses, setExtraExpenses] = useState<any[]>([]);

  useEffect(() => {
    if (user?.role) setSelectedPreviewRole(user.role);
  }, [user?.role]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const results = await Promise.allSettled([
        api.get('/finance/dashboard'),
        api.get('/weddings'),
        api.get('/tasks'),
        api.get('/enquiries'),
        api.get('/agreements'),
        api.get('/quotations'),
        api.get('/operations/timeline'),
        api.get('/operations/check-ins'),
        api.get('/operations/incidents'),
        api.get('/vendor-settlements/invoices'),
        api.get('/payments/milestones'),
        api.get('/payments'),
        api.get('/guests'),
        api.get('/expenses'),
      ]);

      if (results[0].status === 'fulfilled') setFinanceData(results[0].value.data.data);
      if (results[1].status === 'fulfilled') setWeddings(results[1].value.data.data.weddings || []);
      if (results[2].status === 'fulfilled') {
        setTasks(results[2].value.data.data.tasks || []);
        setTaskStats(results[2].value.data.data.stats || {});
      }
      if (results[3].status === 'fulfilled') setEnquiries(results[3].value.data.data.enquiries || []);
      if (results[4].status === 'fulfilled') setAgreements(results[4].value.data.data.agreements || []);
      if (results[5].status === 'fulfilled') setQuotations(results[5].value.data.data.quotations || []);
      if (results[6].status === 'fulfilled') setTimelineEvents(results[6].value.data.data.events || []);
      if (results[7].status === 'fulfilled') setVendorCheckIns(results[7].value.data.data.checkIns || []);
      if (results[8].status === 'fulfilled') setIncidents(results[8].value.data.data.incidents || []);
      if (results[9].status === 'fulfilled') setVendorInvoices(results[9].value.data.data.invoices || []);
      if (results[10].status === 'fulfilled') setMilestones(results[10].value.data.data.milestones || []);
      if (results[11].status === 'fulfilled') setClientPayments(results[11].value.data.data.payments || []);
      if (results[12].status === 'fulfilled') setGuests(results[12].value.data.data.guests || []);
      if (results[13].status === 'fulfilled') setExtraExpenses(results[13].value.data.data.expenses || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user]);

  const handleSwitchLogin = async (email: string) => {
    setIsSwitching(true);
    try {
      await login(email, 'RoyalKnot@2026');
      window.location.reload();
    } catch (error) {
      console.error('Failed to switch user:', error);
      setIsSwitching(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gold-300 border-t-navy-700" />
        <p className="font-serif text-xs font-semibold uppercase tracking-widest text-charcoal-500">
          Loading Royal Knot Portals...
        </p>
      </div>
    );
  }

  const dashboardPayload = {
    kpis: financeData?.kpis || {},
    weddingBreakdowns: financeData?.weddingBreakdowns || [],
    locationComparison: financeData?.locationComparison || {},
    enquiries,
    incidents,
  };
  const activeWeddings = weddings.filter((wedding) => !['COMPLETED', 'CANCELLED'].includes(wedding.status)).length;
  const recognizedRevenue = financeData?.kpis?.totalRecognizedRevenue;
  const clientReceivables = financeData?.kpis?.totalClientReceivables;

  return (
    <div className="space-y-6">
      <WeddingHero />

      <section aria-label="Wedding portfolio summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Active Weddings" value={activeWeddings} icon={CalendarDays} subtitle="From current wedding records" />
        <MetricCard
          title="New Enquiries"
          value={enquiries.filter((enquiry) => enquiry.status === 'NEW').length}
          icon={HeartHandshake}
          subtitle="New leads in the enquiry pipeline"
          variant="gold"
        />
        <MetricCard
          title="Recognized Revenue"
          value={recognizedRevenue === undefined ? '—' : formatLakhsCrores(recognizedRevenue)}
          icon={CircleDollarSign}
          subtitle={recognizedRevenue === undefined ? 'Not available for this role' : 'From finance dashboard data'}
          variant="navy"
        />
        <MetricCard
          title="Pending Payments"
          value={clientReceivables === undefined ? '—' : formatLakhsCrores(clientReceivables)}
          icon={Wallet}
          subtitle={clientReceivables === undefined ? 'Not available for this role' : 'Outstanding client receivables'}
        />
      </section>

      <DashboardOverview
        role={user?.role}
        weddings={weddings}
        tasks={tasks}
        timelineEvents={timelineEvents}
        milestones={milestones}
        financeData={financeData}
      />

      <RolePreviewSelector
        currentRole={user?.role || 'FOUNDER'}
        selectedPreviewRole={selectedPreviewRole}
        onSelectPreviewRole={setSelectedPreviewRole}
        onSwitchLogin={handleSwitchLogin}
        isSwitching={isSwitching}
      />

      {selectedPreviewRole === 'FOUNDER' && <FounderDashboard data={dashboardPayload} onRefresh={fetchAllData} />}
      {selectedPreviewRole === 'PLANNER' && (
        <PlannerDashboard
          weddings={weddings}
          tasks={tasks}
          taskStats={taskStats}
          enquiries={enquiries}
          agreements={agreements}
          quotations={quotations}
          onRefresh={fetchAllData}
        />
      )}
      {selectedPreviewRole === 'FINANCE' && (
        <FinanceDashboard
          data={dashboardPayload}
          milestones={milestones}
          payments={clientPayments}
          vendorInvoices={vendorInvoices}
          extraExpenses={extraExpenses}
          onRefresh={fetchAllData}
        />
      )}
      {selectedPreviewRole === 'FIELD_COORDINATOR' && (
        <CoordinatorDashboard
          weddings={weddings}
          timelineEvents={timelineEvents}
          vendorCheckIns={vendorCheckIns}
          incidents={incidents}
          onRefresh={fetchAllData}
        />
      )}
      {selectedPreviewRole === 'CLIENT' && (
        <ClientDashboard
          weddings={weddings}
          agreements={agreements}
          guests={guests}
          milestones={milestones}
          events={timelineEvents}
          tasks={tasks}
          onRefresh={fetchAllData}
        />
      )}
      {selectedPreviewRole === 'VENDOR' && (
        <VendorDashboard
          weddings={weddings}
          quotations={quotations}
          invoices={vendorInvoices}
          checkIns={vendorCheckIns}
          onRefresh={fetchAllData}
        />
      )}
    </div>
  );
};
