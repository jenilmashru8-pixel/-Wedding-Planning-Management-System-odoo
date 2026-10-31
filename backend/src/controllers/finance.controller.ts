import { Response } from 'express';
import prisma from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { calculateWeddingProfit } from '../utils/calculations.js';
import { Prisma } from '@prisma/client';
import { format } from 'date-fns';

export const getFinanceDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  const weddings = await prisma.wedding.findMany({
    include: {
      extraExpenses: { where: { approvalStatus: 'APPROVED' } },
      vendorBookings: true,
      clientPayments: true,
      vendorPayments: true,
      operationalExpenses: true,
      timeLogs: { where: { isApproved: true } },
    },
  });

  let totalContractRevenue = new Prisma.Decimal(0);
  let totalRecognizedRevenue = new Prisma.Decimal(0);
  let totalClientCollections = new Prisma.Decimal(0);
  let totalVendorCosts = new Prisma.Decimal(0);
  let totalVendorPaymentsPaid = new Prisma.Decimal(0);
  let totalOperationalCosts = new Prisma.Decimal(0);
  let totalLabourCosts = new Prisma.Decimal(0);

  const weddingBreakdowns = weddings.map((w) => {
    let extras = new Prisma.Decimal(0);
    w.extraExpenses.forEach((e) => (extras = extras.add(e.amount)));

    let vCosts = new Prisma.Decimal(0);
    w.vendorBookings.forEach((vb) => (vCosts = vCosts.add(vb.agreedAmount)));

    let cPaid = new Prisma.Decimal(0);
    w.clientPayments.forEach((cp) => (cPaid = cPaid.add(cp.amount)));

    let vPaid = new Prisma.Decimal(0);
    w.vendorPayments.forEach((vp) => (vPaid = vPaid.add(vp.amount)));

    let opCosts = new Prisma.Decimal(0);
    w.operationalExpenses.forEach((oe) => (opCosts = opCosts.add(oe.amount)));

    let lCosts = new Prisma.Decimal(0);
    w.timeLogs.forEach((tl) => (lCosts = lCosts.add(tl.calculatedLabourCost)));

    const profit = calculateWeddingProfit({
      contractAmount: w.contractAmount,
      approvedAdditions: extras,
      vendorCosts: vCosts,
      operationalExpenses: opCosts,
      labourCosts: lCosts,
      clientPaymentsCollected: cPaid,
      vendorPaymentsPaid: vPaid,
    });

    totalContractRevenue = totalContractRevenue.add(w.contractAmount);
    totalRecognizedRevenue = totalRecognizedRevenue.add(profit.recognizedRevenue);
    totalClientCollections = totalClientCollections.add(profit.clientCollected);
    totalVendorCosts = totalVendorCosts.add(profit.totalVendorCosts);
    totalVendorPaymentsPaid = totalVendorPaymentsPaid.add(profit.vendorPaid);
    totalOperationalCosts = totalOperationalCosts.add(profit.operationalCosts);
    totalLabourCosts = totalLabourCosts.add(profit.labourCosts);

    return {
      weddingId: w.id,
      weddingCode: w.weddingCode,
      name: w.name,
      location: w.location,
      packageType: w.packageType,
      status: w.status,
      startDate: w.startDate,
      ...profit,
    };
  });

  const totalCosts = totalVendorCosts.add(totalOperationalCosts).add(totalLabourCosts);
  const netProfit = totalRecognizedRevenue.sub(totalCosts);
  const profitMargin = totalRecognizedRevenue.greaterThan(0)
    ? Number(netProfit.mul(100).div(totalRecognizedRevenue).toFixed(2))
    : 0;

  const clientOutstanding = totalRecognizedRevenue.sub(totalClientCollections);
  const vendorLiabilities = totalVendorCosts.sub(totalVendorPaymentsPaid);

  // Location comparison (Jaipur vs Udaipur)
  const jaipurWeddings = weddingBreakdowns.filter((w) => w.location.toLowerCase().includes('jaipur'));
  const udaipurWeddings = weddingBreakdowns.filter((w) => w.location.toLowerCase().includes('udaipur'));

  const jaipurRevenue = jaipurWeddings.reduce((sum, w) => sum + Number(w.recognizedRevenue), 0);
  const jaipurProfit = jaipurWeddings.reduce((sum, w) => sum + Number(w.netProfit), 0);

  const udaipurRevenue = udaipurWeddings.reduce((sum, w) => sum + Number(w.recognizedRevenue), 0);
  const udaipurProfit = udaipurWeddings.reduce((sum, w) => sum + Number(w.netProfit), 0);

  // Monthly trends
  const monthlyTrendsMap: Record<string, { month: string; revenue: number; profit: number; count: number }> = {};
  weddingBreakdowns.forEach((w) => {
    const m = format(new Date(w.startDate), 'MMM yyyy');
    if (!monthlyTrendsMap[m]) {
      monthlyTrendsMap[m] = { month: m, revenue: 0, profit: 0, count: 0 };
    }
    monthlyTrendsMap[m].revenue += Number(w.recognizedRevenue);
    monthlyTrendsMap[m].profit += Number(w.netProfit);
    monthlyTrendsMap[m].count += 1;
  });

  res.json({
    success: true,
    data: {
      kpis: {
        totalWeddings: weddings.length,
        totalContractRevenue,
        totalRecognizedRevenue,
        totalClientCollections,
        totalClientReceivables: clientOutstanding.greaterThan(0) ? clientOutstanding : 0,
        totalVendorCosts,
        totalVendorPaymentsPaid,
        totalVendorLiabilities: vendorLiabilities.greaterThan(0) ? vendorLiabilities : 0,
        totalOperationalCosts,
        totalLabourCosts,
        totalWeddingCosts: totalCosts,
        netProfit,
        profitMargin,
        averageProfitPerWedding: weddings.length > 0 ? Number(netProfit.div(weddings.length).toFixed(2)) : 0,
      },
      weddingBreakdowns,
      locationComparison: {
        jaipur: { weddingsCount: jaipurWeddings.length, revenue: jaipurRevenue, profit: jaipurProfit },
        udaipur: { weddingsCount: udaipurWeddings.length, revenue: udaipurRevenue, profit: udaipurProfit },
      },
      monthlyTrends: Object.values(monthlyTrendsMap),
    },
  });
};

export const getWeddingProfitReport = async (req: AuthRequest, res: Response): Promise<void> => {
  const { weddingId } = req.params;

  const wedding = await prisma.wedding.findUnique({
    where: { id: weddingId },
    include: {
      client: true,
      extraExpenses: { where: { approvalStatus: 'APPROVED' } },
      vendorBookings: {
        include: { vendor: { select: { companyName: true, category: true } } },
      },
      clientPayments: true,
      vendorPayments: {
        include: { vendor: { select: { companyName: true } } },
      },
      operationalExpenses: true,
      timeLogs: {
        where: { isApproved: true },
        include: { employee: { select: { firstName: true, lastName: true } } },
      },
    },
  });

  if (!wedding) {
    res.status(404).json({ success: false, message: 'Wedding not found' });
    return;
  }

  let extras = new Prisma.Decimal(0);
  wedding.extraExpenses.forEach((e) => (extras = extras.add(e.amount)));

  let vCosts = new Prisma.Decimal(0);
  wedding.vendorBookings.forEach((vb) => (vCosts = vCosts.add(vb.agreedAmount)));

  let cPaid = new Prisma.Decimal(0);
  wedding.clientPayments.forEach((cp) => (cPaid = cPaid.add(cp.amount)));

  let vPaid = new Prisma.Decimal(0);
  wedding.vendorPayments.forEach((vp) => (vPaid = vPaid.add(vp.amount)));

  let opCosts = new Prisma.Decimal(0);
  wedding.operationalExpenses.forEach((oe) => (opCosts = opCosts.add(oe.amount)));

  let lCosts = new Prisma.Decimal(0);
  wedding.timeLogs.forEach((tl) => (lCosts = lCosts.add(tl.calculatedLabourCost)));

  const profit = calculateWeddingProfit({
    contractAmount: wedding.contractAmount,
    approvedAdditions: extras,
    vendorCosts: vCosts,
    operationalExpenses: opCosts,
    labourCosts: lCosts,
    clientPaymentsCollected: cPaid,
    vendorPaymentsPaid: vPaid,
  });

  res.json({
    success: true,
    data: {
      wedding,
      profitAnalysis: profit,
      extraExpenses: wedding.extraExpenses,
      vendorBookings: wedding.vendorBookings,
      clientPayments: wedding.clientPayments,
      vendorPayments: wedding.vendorPayments,
      operationalExpenses: wedding.operationalExpenses,
      timeLogs: wedding.timeLogs,
    },
  });
};
