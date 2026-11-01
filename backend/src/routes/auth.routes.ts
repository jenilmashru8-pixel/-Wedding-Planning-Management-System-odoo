import { Request, Response, Router, RequestHandler } from 'express';
import { forgotPassword, login, getMe, logout, register, resetPassword } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const router = Router();

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many password reset attempts. Please try again later.' },
});

const asyncHandler = (handler: (req: Request, res: Response) => Promise<void>): RequestHandler =>
  (req, res, next) => {
    void handler(req, res).catch(next);
  };

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/forgot-password', passwordResetLimiter, asyncHandler(forgotPassword));
router.post('/reset-password', passwordResetLimiter, asyncHandler(resetPassword));
router.post('/logout', logout);
router.get('/me', authenticateToken, getMe);

export default router;
