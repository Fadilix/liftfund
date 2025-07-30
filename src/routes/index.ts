import { Router, IRouter } from 'express';
import authRoutes from './auth';
import adminRoutes from './admin';

const router: IRouter = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);

// Route de santé
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
