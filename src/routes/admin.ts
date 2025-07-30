import { Router, IRouter } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router: IRouter = Router();

// Middleware d'authentification pour toutes les routes admin
router.use(authenticateToken);
router.use(requireAdmin);

// Routes du tableau de bord
router.get('/dashboard', AdminController.getDashboard);

// Routes de gestion des utilisateurs
router.get('/users/pending', AdminController.getPendingUsers);
router.get('/users', AdminController.getAllUsers);
router.put('/users/:userId/approve', AdminController.approveUser);
router.put('/users/:userId/reject', AdminController.rejectUser);

// Routes de gestion des administrateurs
router.get('/admins', AdminController.getAdmins);
router.post('/admins', AdminController.createAdmin);

export default router;
