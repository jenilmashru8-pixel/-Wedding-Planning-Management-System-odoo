import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';
import { initSocket } from './socket.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import enquiriesRoutes from './routes/enquiries.routes.js';
import clientsRoutes from './routes/clients.routes.js';
import weddingsRoutes from './routes/weddings.routes.js';
import agreementsRoutes from './routes/agreements.routes.js';
import vendorsRoutes from './routes/vendors.routes.js';
import quotationsRoutes from './routes/quotations.routes.js';
import tasksRoutes from './routes/tasks.routes.js';
import operationsRoutes from './routes/operations.routes.js';
import guestsRoutes from './routes/guests.routes.js';
import paymentsRoutes from './routes/payments.routes.js';
import expensesRoutes from './routes/expenses.routes.js';
import vendorSettlementsRoutes from './routes/vendorSettlements.routes.js';
import financeRoutes from './routes/finance.routes.js';
import teamRoutes from './routes/team.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import settingsRoutes from './routes/settings.routes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Security & Parsing Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

app.use(cors({
  origin: '*',
  credentials: true,
}));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Rate limiting (generous for internal SaaS dashboard)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Serve static uploads
const uploadsPath = path.resolve(process.cwd(), '../uploads');
app.use('/uploads', express.static(uploadsPath));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'The Royal Knot Wedding Planning API',
    database: 'PostgreSQL',
  });
});

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/enquiries', enquiriesRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/weddings', weddingsRoutes);
app.use('/api/agreements', agreementsRoutes);
app.use('/api/vendors', vendorsRoutes);
app.use('/api/quotations', quotationsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/operations', operationsRoutes);
app.use('/api/guests', guestsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/vendor-settlements', vendorSettlementsRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/settings', settingsRoutes);

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`[The Royal Knot] Backend server listening on port ${PORT}`);
  });
}

export { app, server };
export default app;
