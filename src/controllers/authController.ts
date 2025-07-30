import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { registerSchema, loginSchema, otpVerificationSchema } from '../utils/validation';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = registerSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Données invalides',
          error: error.details[0]?.message
        });
        return;
      }

      const files = req.files as Express.Multer.File[];
      const result = await AuthService.registerUser(value, files);

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      console.error('Erreur dans register:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  static async verifyOTP(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = otpVerificationSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Données invalides',
          error: error.details[0]?.message
        });
        return;
      }

      const result = await AuthService.verifyOTP(value.email, value.otp);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Erreur dans verifyOTP:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Données invalides',
          error: error.details[0]?.message
        });
        return;
      }

      const result = await AuthService.loginUser(value);
      res.status(result.success ? 200 : 401).json(result);
    } catch (error) {
      console.error('Erreur dans login:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  static async loginAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Données invalides',
          error: error.details[0]?.message
        });
        return;
      }

      const result = await AuthService.loginAdmin(value);
      res.status(result.success ? 200 : 401).json(result);
    } catch (error) {
      console.error('Erreur dans loginAdmin:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  static async resendOTP(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email requis'
        });
        return;
      }

      const result = await AuthService.resendOTP(email);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Erreur dans resendOTP:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }
}

export default AuthController;
