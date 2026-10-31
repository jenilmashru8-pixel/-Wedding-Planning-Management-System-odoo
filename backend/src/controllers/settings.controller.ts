import { Response } from 'express';
import prisma from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

export const getSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  const settings = await prisma.systemSetting.findMany();
  const settingsMap: Record<string, string> = {
    agencyName: 'The Royal Knot',
    agencyTagline: 'Luxury Destination Wedding Planning',
    locations: 'Jaipur, Udaipur',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD-MM-YYYY',
    defaultGstRate: '18',
    bookingDepositPercentage: '25',
    advancePaymentPercentage: '50',
    finalPaymentPercentage: '25',
  };

  settings.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  res.json({ success: true, data: { settings: settingsMap } });
};

export const updateSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  const updates: Record<string, string> = req.body;

  for (const [key, value] of Object.entries(updates)) {
    await prisma.systemSetting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });
  }

  res.json({ success: true, message: 'Settings updated successfully' });
};
