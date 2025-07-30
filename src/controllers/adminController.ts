import { Response } from 'express';
import { AdminService } from '../services/adminService';
import { AuthRequest } from '../middleware/auth';
import { createAdminSchema } from '../utils/validation';

export class AdminController {
  static async getDashboard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await AdminService.getDashboardStats();
      res.status(result.success ? 200 : 500).json(result);
    } catch (error) {
      console.error('Erreur dans getDashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  static async getPendingUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await AdminService.getPendingUsers();
      res.status(result.success ? 200 : 500).json(result);
    } catch (error) {
      console.error('Erreur dans getPendingUsers:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  static async getAllUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await AdminService.getAllUsers();
      res.status(result.success ? 200 : 500).json(result);
    } catch (error) {
      console.error('Erreur dans getAllUsers:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  static async approveUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userIdParam = req.params.userId;
      if (!userIdParam) {
        res.status(400).json({
          success: false,
          message: 'ID utilisateur requis'
        });
        return;
      }

      const userId = parseInt(userIdParam);
      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: 'ID utilisateur invalide'
        });
        return;
      }

      const result = await AdminService.approveUser(userId);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Erreur dans approveUser:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  static async rejectUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userIdParam = req.params.userId;
      if (!userIdParam) {
        res.status(400).json({
          success: false,
          message: 'ID utilisateur requis'
        });
        return;
      }

      const userId = parseInt(userIdParam);
      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: 'ID utilisateur invalide'
        });
        return;
      }

      const { reason } = req.body;
      const result = await AdminService.rejectUser(userId, reason);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Erreur dans rejectUser:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  static async createAdmin(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { error, value } = createAdminSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Données invalides',
          error: error.details[0]?.message
        });
        return;
      }

      const result = await AdminService.createAdmin(value.email, value.password);
      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      console.error('Erreur dans createAdmin:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  static async getAdmins(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await AdminService.getAdmins();
      res.status(result.success ? 200 : 500).json(result);
    } catch (error) {
      console.error('Erreur dans getAdmins:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }
}

export default AdminController;
