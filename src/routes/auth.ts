import { Router, IRouter } from 'express';
import { AuthController } from '../controllers/authController';
import { uploadRegistrationFiles } from '../middleware/upload';

const router: IRouter = Router();

// Routes d'authentification utilisateur
router.post('/register', uploadRegistrationFiles, AuthController.register);
router.post('/verify-otp', AuthController.verifyOTP);
router.post('/resend-otp', AuthController.resendOTP);
router.post('/login', AuthController.login);

// Route d'authentification administrateur
router.post('/admin/login', AuthController.loginAdmin);

export default router;
