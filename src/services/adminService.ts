import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/auth';
import { sendApprovalEmail, sendRejectionEmail } from '../utils/email';
import { ApiResponse, UserWithMedia, AdminDashboardStats } from '../types';

const prisma = new PrismaClient();

export class AdminService {
  static async getDashboardStats(): Promise<ApiResponse<AdminDashboardStats>> {
    try {
      const [
        totalUsers,
        pendingApprovals,
        totalCampaigns,
        activeCampaigns,
        totalDonations,
        totalAmountResult
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({
          where: {
            isVerified: true,
            isApproved: false
          }
        }),
        prisma.campaign.count(),
        prisma.campaign.count({
          where: { isActive: true }
        }),
        prisma.donation.count(),
        prisma.transaction.aggregate({
          _sum: {
            amount: true
          }
        })
      ]);

      const stats: AdminDashboardStats = {
        totalUsers,
        pendingApprovals,
        totalCampaigns,
        activeCampaigns,
        totalDonations,
        totalAmount: totalAmountResult._sum.amount || 0
      };

      return {
        success: true,
        message: 'Statistiques récupérées avec succès',
        data: stats
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return {
        success: false,
        message: 'Erreur lors de la récupération des statistiques'
      };
    }
  }

  static async getPendingUsers(): Promise<ApiResponse<UserWithMedia[]>> {
    try {
      const users = await prisma.user.findMany({
        where: {
          isVerified: true,
          isApproved: false,
          deletedAt: null
        },
        include: {
          registrationMedia: {
            include: {
              media: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      return {
        success: true,
        message: 'Utilisateurs en attente récupérés avec succès',
        data: users
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs en attente:', error);
      return {
        success: false,
        message: 'Erreur lors de la récupération des utilisateurs'
      };
    }
  }

  static async getAllUsers(): Promise<ApiResponse<UserWithMedia[]>> {
    try {
      const users = await prisma.user.findMany({
        where: {
          deletedAt: null
        },
        include: {
          registrationMedia: {
            include: {
              media: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return {
        success: true,
        message: 'Utilisateurs récupérés avec succès',
        data: users
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      return {
        success: false,
        message: 'Erreur lors de la récupération des utilisateurs'
      };
    }
  }

  static async approveUser(userId: number): Promise<ApiResponse> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return {
          success: false,
          message: 'Utilisateur non trouvé'
        };
      }

      if (!user.isVerified) {
        return {
          success: false,
          message: 'L\'utilisateur doit d\'abord vérifier son email'
        };
      }

      if (user.isApproved) {
        return {
          success: false,
          message: 'Cet utilisateur est déjà approuvé'
        };
      }

      await prisma.user.update({
        where: { id: userId },
        data: { isApproved: true }
      });

      // Envoyer un email de confirmation
      await sendApprovalEmail(user.email, user.firstName);

      return {
        success: true,
        message: 'Utilisateur approuvé avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
      return {
        success: false,
        message: 'Erreur lors de l\'approbation'
      };
    }
  }

  static async rejectUser(userId: number, reason?: string): Promise<ApiResponse> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return {
          success: false,
          message: 'Utilisateur non trouvé'
        };
      }

      if (user.isApproved) {
        return {
          success: false,
          message: 'Impossible de rejeter un utilisateur déjà approuvé'
        };
      }

      // Supprimer l'utilisateur et ses données associées
      await prisma.$transaction(async (tx) => {
        // Supprimer les médias de registration
        const registrationMedia = await tx.registrationMedia.findMany({
          where: { userId },
          include: { media: true }
        });

        for (const regMedia of registrationMedia) {
          await tx.registrationMedia.delete({
            where: { id: regMedia.id }
          });
          await tx.media.delete({
            where: { id: regMedia.mediaId }
          });
        }

        // Supprimer les OTP
        await tx.otpVerification.deleteMany({
          where: { email: user.email }
        });

        // Supprimer l'utilisateur
        await tx.user.delete({
          where: { id: userId }
        });
      });

      // Envoyer un email de rejet
      await sendRejectionEmail(user.email, user.firstName, reason);

      return {
        success: true,
        message: 'Utilisateur rejeté avec succès'
      };
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      return {
        success: false,
        message: 'Erreur lors du rejet'
      };
    }
  }

  static async createAdmin(email: string, password: string): Promise<ApiResponse> {
    try {
      const existingAdmin = await prisma.admin.findUnique({
        where: { email }
      });

      if (existingAdmin) {
        return {
          success: false,
          message: 'Cet email est déjà utilisé par un administrateur'
        };
      }

      const hashedPassword = await hashPassword(password);

      const admin = await prisma.admin.create({
        data: {
          email,
          password: hashedPassword
        }
      });

      return {
        success: true,
        message: 'Administrateur créé avec succès',
        data: {
          id: admin.id,
          email: admin.email
        }
      };
    } catch (error) {
      console.error('Erreur lors de la création de l\'admin:', error);
      return {
        success: false,
        message: 'Erreur lors de la création de l\'administrateur'
      };
    }
  }

  static async getAdmins(): Promise<ApiResponse> {
    try {
      const admins = await prisma.admin.findMany({
        where: {
          deletedAt: null
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return {
        success: true,
        message: 'Administrateurs récupérés avec succès',
        data: admins
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des admins:', error);
      return {
        success: false,
        message: 'Erreur lors de la récupération des administrateurs'
      };
    }
  }
}

export default AdminService;
