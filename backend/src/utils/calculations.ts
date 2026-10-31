import { Prisma } from '@prisma/client';

export const toDecimal = (val: number | string | Prisma.Decimal | undefined | null): Prisma.Decimal => {
  if (val === undefined || val === null || val === '') return new Prisma.Decimal(0);
  return new Prisma.Decimal(val);
};

export const roundMoney = (val: Prisma.Decimal): Prisma.Decimal => {
  return val.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
};

/**
 * Calculate total quotation amount:
 * Base amount OR (Price per plate * Guest count) + Additional staff + Transportation + Tax - Discount
 */
export const calculateQuotationTotal = (params: {
  baseAmount?: number | string | Prisma.Decimal;
  pricePerPlate?: number | string | Prisma.Decimal;
  guestCount?: number;
  additionalStaffCost?: number | string | Prisma.Decimal;
  transportationCost?: number | string | Prisma.Decimal;
  taxRate?: number | string | Prisma.Decimal;
  discountAmount?: number | string | Prisma.Decimal;
}): { subtotal: Prisma.Decimal; taxAmount: Prisma.Decimal; totalAmount: Prisma.Decimal } => {
  const base = toDecimal(params.baseAmount);
  const ppp = toDecimal(params.pricePerPlate);
  const count = params.guestCount || 0;
  const staff = toDecimal(params.additionalStaffCost);
  const transport = toDecimal(params.transportationCost);
  const taxRate = toDecimal(params.taxRate || 18);
  const discount = toDecimal(params.discountAmount);

  // If pricePerPlate is provided (>0), catering subtotal = pricePerPlate * guestCount. Otherwise baseAmount.
  let primaryAmount = base;
  if (ppp.greaterThan(0) && count > 0) {
    primaryAmount = ppp.mul(count);
  }

  const subtotalBeforeDiscount = primaryAmount.add(staff).add(transport);
  const taxableAmount = subtotalBeforeDiscount.sub(discount);
  const safeTaxable = taxableAmount.greaterThan(0) ? taxableAmount : new Prisma.Decimal(0);

  const taxAmount = roundMoney(safeTaxable.mul(taxRate).div(100));
  const totalAmount = roundMoney(safeTaxable.add(taxAmount));

  return {
    subtotal: roundMoney(subtotalBeforeDiscount),
    taxAmount,
    totalAmount,
  };
};

/**
 * Calculate extra expense with quantity, unit price, and tax
 */
export const calculateExtraExpense = (params: {
  quantity: number;
  unitPrice: number | string | Prisma.Decimal;
  taxRate?: number | string | Prisma.Decimal;
}): { amount: Prisma.Decimal; taxAmount: Prisma.Decimal; totalAmount: Prisma.Decimal } => {
  const qty = new Prisma.Decimal(params.quantity > 0 ? params.quantity : 1);
  const price = toDecimal(params.unitPrice);
  const taxRate = toDecimal(params.taxRate || 18);

  const amount = roundMoney(qty.mul(price));
  const taxAmount = roundMoney(amount.mul(taxRate).div(100));
  const totalAmount = roundMoney(amount.add(taxAmount));

  return {
    amount,
    taxAmount,
    totalAmount,
  };
};

/**
 * Profitability calculation
 */
export const calculateWeddingProfit = (params: {
  contractAmount: number | string | Prisma.Decimal;
  approvedAdditions?: number | string | Prisma.Decimal;
  discounts?: number | string | Prisma.Decimal;
  vendorCosts: number | string | Prisma.Decimal;
  operationalExpenses?: number | string | Prisma.Decimal;
  labourCosts?: number | string | Prisma.Decimal;
  clientPaymentsCollected?: number | string | Prisma.Decimal;
  vendorPaymentsPaid?: number | string | Prisma.Decimal;
}) => {
  const contract = toDecimal(params.contractAmount);
  const additions = toDecimal(params.approvedAdditions);
  const discounts = toDecimal(params.discounts);
  const recognizedRevenue = roundMoney(contract.add(additions).sub(discounts));

  const vendorCosts = toDecimal(params.vendorCosts);
  const operational = toDecimal(params.operationalExpenses);
  const labour = toDecimal(params.labourCosts);
  const totalWeddingCosts = roundMoney(vendorCosts.add(operational).add(labour));

  const netProfit = roundMoney(recognizedRevenue.sub(totalWeddingCosts));
  const profitMargin = recognizedRevenue.greaterThan(0)
    ? roundMoney(netProfit.mul(100).div(recognizedRevenue))
    : new Prisma.Decimal(0);

  const clientCollected = toDecimal(params.clientPaymentsCollected);
  const clientOutstanding = roundMoney(recognizedRevenue.sub(clientCollected));

  const vendorPaid = toDecimal(params.vendorPaymentsPaid);
  const vendorLiabilities = roundMoney(vendorCosts.sub(vendorPaid));

  return {
    contractAmount: roundMoney(contract),
    recognizedRevenue,
    clientCollected: roundMoney(clientCollected),
    clientOutstanding: clientOutstanding.greaterThan(0) ? clientOutstanding : new Prisma.Decimal(0),
    totalVendorCosts: roundMoney(vendorCosts),
    vendorPaid: roundMoney(vendorPaid),
    vendorLiabilities: vendorLiabilities.greaterThan(0) ? vendorLiabilities : new Prisma.Decimal(0),
    operationalCosts: roundMoney(operational),
    labourCosts: roundMoney(labour),
    totalWeddingCosts,
    netProfit,
    profitMargin: Number(profitMargin.toString()),
  };
};
