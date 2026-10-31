import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { UserRole } from '../types';
import { RolePreviewSelector } from '../components/dashboards/RolePreviewSelector';
import { FounderDashboard } from '../components/dashboards/FounderDashboard';
import { PlannerDashboard } from '../components/dashboards/PlannerDashboard';
import { FinanceDashboard } from '../components/dashboards/FinanceDashboard';
import { CoordinatorDashboard } from '../components/dashboards/CoordinatorDashboard';
import { ClientDashboard } from '../components/dashboards/ClientDashboard';
import { VendorDashboard } from '../components/dashboards/VendorDashboard';

export const Dashboard: React.FC = () => {
  const { user, login } = useAuth();
  const [selectedPreviewRole, setSelectedPreviewRole] = useState<UserRole>(user?.role || 'FOUNDER');
  const [isSwitching, setIsSwitching] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Aggregated data stores
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

  // Update selectedPreviewRole if user changes
  useEffect(() => {
    if (user?.role) {
      setSelectedPreviewRole(user.role);
    }
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

      if (results[0].status === 'fulfilled') {
        setFinanceData(results[0].value.data.data);
      }
      if (results[1].status === 'fulfilled') {
        setWeddings(results[1].value.data.data.weddings || []);
      }
      if (results[2].status === 'fulfilled') {
        setTasks(results[2].value.data.data.tasks || []);
        setTaskStats(results[2].value.data.data.stats || {});
      }
      if (results[3].status === 'fulfilled') {
        setEnquiries(results[3].value.data.data.enquiries || []);
      }
      if (results[4].status === 'fulfilled') {
        setAgreements(results[4].value.data.data.agreements || []);
      }
      if (results[5].status === 'fulfilled') {
        setQuotations(results[5].value.data.data.quotations || []);
      }
      if (results[6].status === 'fulfilled') {
        setTimelineEvents(results[6].value.data.data.events || []);
      }
      if (results[7].status === 'fulfilled') {
        setVendorCheckIns(results[7].value.data.data.checkIns || []);
      }
      if (results[8].status === 'fulfilled') {
        setIncidents(results[8].value.data.data.incidents || []);
      }
      if (results[9].status === 'fulfilled') {
        setVendorInvoices(results[9].value.data.data.invoices || []);
      }
      if (results[10].status === 'fulfilled') {
        setMilestones(results[10].value.data.data.milestones || []);
      }
      if (results[11].status === 'fulfilled') {
        setClientPayments(results[11].value.data.data.payments || []);
      }
      if (results[12].status === 'fulfilled') {
        setGuests(results[12].value.data.data.guests || []);
      }
      if (results[13].status === 'fulfilled') {
        setExtraExpenses(results[13].value.data.data.expenses || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
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
    } catch (err) {
      console.error('Failed to switch user:', err);
      setIsSwitching(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-12 h-12 border-4 border-gold-300 border-t-burgundy-700 rounded-full animate-spin" />
        <p className="text-xs font-serif font-semibold text-charcoal-500 uppercase tracking-widest">
          Loading Royal Knot Portals...
        </p>
      </div>
    );
  }

  // Prepared data object for dashboards
  const DEMO_WEDDINGS = [
    {
      weddingId: 'demo-001',
      weddingCode: 'TRK-2026-001',
      name: 'Aarav & Meera Kapoor',
      venueName: 'The Oberoi Udaivilas & Jagmandir Island Palace',
      location: 'Udaipur',
      circuit: 'Udaipur Circuit',
      packageType: 'ULTRA_LUXURY',
      status: 'CONFIRMED',
      startDate: '2026-02-14',
      guestCount: 650,
      recognizedRevenue: 45000000,
      clientCollected: 30000000,
      clientReceivables: 15000000,
      totalVendorCosts: 27500000,
      vendorPaid: 18000000,
      vendorBalance: 9500000,
      gstAmount: 8100000,
      netProfit: 17500000,
      profitMargin: 38.9,
    },
    {
      weddingId: 'demo-002',
      weddingCode: 'TRK-2026-002',
      name: 'Rohit & Ananya Singhania',
      venueName: 'Rambagh Palace & City Palace Jaipur',
      location: 'Jaipur',
      circuit: 'Jaipur Circuit',
      packageType: 'LUXURY',
      status: 'IN_PROGRESS',
      startDate: '2026-03-08',
      guestCount: 500,
      recognizedRevenue: 35000000,
      clientCollected: 25000000,
      clientReceivables: 10000000,
      totalVendorCosts: 21000000,
      vendorPaid: 15000000,
      vendorBalance: 6000000,
      gstAmount: 6300000,
      netProfit: 14000000,
      profitMargin: 40.0,
    },
    {
      weddingId: 'demo-003',
      weddingCode: 'TRK-2026-003',
      name: 'Vikram & Priya Rathore',
      venueName: 'Umaid Bhawan Palace & Mehrangarh Fort',
      location: 'Jodhpur',
      circuit: 'Jodhpur Circuit',
      packageType: 'ULTRA_LUXURY',
      status: 'PLANNING',
      startDate: '2026-04-20',
      guestCount: 800,
      recognizedRevenue: 55000000,
      clientCollected: 20000000,
      clientReceivables: 35000000,
      totalVendorCosts: 33000000,
      vendorPaid: 8000000,
      vendorBalance: 25000000,
      gstAmount: 9900000,
      netProfit: 22000000,
      profitMargin: 40.0,
    },
    {
      weddingId: 'demo-004',
      weddingCode: 'TRK-2026-004',
      name: 'Arjun & Kavya Bhatt',
      venueName: 'Ananta Spa & Resort, Pushkar Lake',
      location: 'Pushkar',
      circuit: 'Pushkar Circuit',
      packageType: 'PREMIUM',
      status: 'CONFIRMED',
      startDate: '2026-05-10',
      guestCount: 300,
      recognizedRevenue: 22000000,
      clientCollected: 16500000,
      clientReceivables: 5500000,
      totalVendorCosts: 13200000,
      vendorPaid: 10000000,
      vendorBalance: 3200000,
      gstAmount: 3960000,
      netProfit: 8800000,
      profitMargin: 40.0,
    },
    {
      weddingId: 'demo-005',
      weddingCode: 'TRK-2026-005',
      name: 'Siddharth & Naina Agarwal',
      venueName: 'Sher Bagh Luxury Camp, Ranthambore',
      location: 'Ranthambore',
      circuit: 'Ranthambore Circuit',
      packageType: 'LUXURY',
      status: 'ENQUIRY',
      startDate: '2026-06-02',
      guestCount: 200,
      recognizedRevenue: 18000000,
      clientCollected: 0,
      clientReceivables: 18000000,
      totalVendorCosts: 10800000,
      vendorPaid: 0,
      vendorBalance: 10800000,
      gstAmount: 3240000,
      netProfit: 7200000,
      profitMargin: 40.0,
    },
    {
      weddingId: 'demo-006',
      weddingCode: 'TRK-2026-006',
      name: 'Rahul & Shreya Malhotra',
      venueName: 'The Leela Palace & Lodhi Gardens, Delhi',
      location: 'Delhi',
      circuit: 'Delhi NCR Circuit',
      packageType: 'ULTRA_LUXURY',
      status: 'PLANNING',
      startDate: '2026-11-21',
      guestCount: 1200,
      recognizedRevenue: 75000000,
      clientCollected: 30000000,
      clientReceivables: 45000000,
      totalVendorCosts: 45000000,
      vendorPaid: 12000000,
      vendorBalance: 33000000,
      gstAmount: 13500000,
      netProfit: 30000000,
      profitMargin: 40.0,
    },
    {
      weddingId: 'demo-007',
      weddingCode: 'TRK-2026-007',
      name: 'Dev & Aisha Oberoi',
      venueName: 'Palace Hotel & Sunset Point, Mount Abu',
      location: 'Mount Abu',
      circuit: 'Mount Abu Circuit',
      packageType: 'PREMIUM',
      status: 'CONFIRMED',
      startDate: '2026-12-15',
      guestCount: 350,
      recognizedRevenue: 28000000,
      clientCollected: 21000000,
      clientReceivables: 7000000,
      totalVendorCosts: 16800000,
      vendorPaid: 12000000,
      vendorBalance: 4800000,
      gstAmount: 5040000,
      netProfit: 11200000,
      profitMargin: 40.0,
    },
  ];

  const dashboardPayload = {
    kpis: financeData?.kpis || {
      totalRecognizedRevenue: 278000000,
      totalClientCollections: 142500000,
      totalClientReceivables: 135500000,
      totalWeddingCosts: 167300000,
      netProfit: 110700000,
      profitMargin: 39.8,
      totalVendorCosts: 167300000,
      totalVendorPaymentsPaid: 75000000,
      totalVendorLiabilities: 92300000,
      totalWeddings: weddings.length || 7,
    },
    weddingBreakdowns: financeData?.weddingBreakdowns || (weddings.length > 0 ? weddings.map((w) => ({
      weddingId: w.id,
      weddingCode: w.weddingCode,
      name: w.name,
      venueName: w.venueName || w.location,
      location: w.location,
      circuit: `${w.location} Circuit`,
      packageType: w.packageType || 'LUXURY',
      status: w.status,
      startDate: w.startDate,
      guestCount: w.guestCount || 400,
      recognizedRevenue: w.contractAmount || 45000000,
      clientCollected: (w.contractAmount || 45000000) * 0.65,
      clientReceivables: (w.contractAmount || 45000000) * 0.35,
      totalVendorCosts: (w.contractAmount || 45000000) * 0.55,
      vendorPaid: (w.contractAmount || 45000000) * 0.38,
      vendorBalance: (w.contractAmount || 45000000) * 0.17,
      gstAmount: (w.contractAmount || 45000000) * 0.18,
      netProfit: (w.contractAmount || 45000000) * 0.40,
      profitMargin: 40.0,
    })) : DEMO_WEDDINGS),
    locationComparison: financeData?.locationComparison || {
      udaipur: { weddingsCount: 1, revenue: 45000000, profit: 17500000 },
      jaipur: { weddingsCount: 1, revenue: 35000000, profit: 14000000 },
      jodhpur: { weddingsCount: 1, revenue: 55000000, profit: 22000000 },
      pushkar: { weddingsCount: 1, revenue: 22000000, profit: 8800000 },
      ranthambore: { weddingsCount: 1, revenue: 18000000, profit: 7200000 },
      delhi: { weddingsCount: 1, revenue: 75000000, profit: 30000000 },
      mountAbu: { weddingsCount: 1, revenue: 28000000, profit: 11200000 },
    },
    enquiries,
    incidents,
  };

  return (
    <div className="space-y-6">
      {/* Interactive Role Persona Switcher Bar */}
      <RolePreviewSelector
        currentRole={user?.role || 'FOUNDER'}
        selectedPreviewRole={selectedPreviewRole}
        onSelectPreviewRole={(role) => setSelectedPreviewRole(role)}
        onSwitchLogin={handleSwitchLogin}
        isSwitching={isSwitching}
      />

      {/* Render Selected Role Excellence Dashboard */}
      {selectedPreviewRole === 'FOUNDER' && (
        <FounderDashboard data={dashboardPayload} onRefresh={fetchAllData} />
      )}

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
