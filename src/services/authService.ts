import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, generateToken, generateOTP } from '../utils/auth';
import { sendOTPEmail, sendApprovalEmail, sendRejectionEmail } from '../utils/email';
import { RegisterUserData, LoginData, ApiResponse } from '../types';

const prisma = new PrismaClient();

export class AuthService {
  static async registerUser(userData: RegisterUserData, files?: Express.Multer.File[]): Promise<ApiResponse> {
    try {
      // Vérifier si l'email existe déjà
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        return {
          success: false,
          message: 'Cet email est déjà utilisé'
        };
      }

      // Générer et envoyer l'OTP
      const otp = generateOTP();
      const otpExpiresAt = new Date(Date.now() + parseInt(process.env.OTP_EXPIRES_IN || '300000'));

      // Enregistrer l'OTP
      await prisma.otpVerification.create({
        data: {
          email: userData.email,
          otp,
          expiresAt: otpExpiresAt
        }
      });

      // Envoyer l'email avec l'OTP
      await sendOTPEmail(userData.email, otp);

      // Hasher le mot de passe
      const hashedPassword = await hashPassword(userData.password);

      // Créer l'utilisateur temporaire (non vérifié)
      const user = await prisma.user.create({
        data: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          password: hashedPassword,
          isVerified: false,
          isApproved: false
        }
      });

      // Traiter les fichiers si présents
      if (files && files.length > 0) {
        for (const file of files) {
          const media = await prisma.media.create({
            data: {
              url: file.path,
              type: file.mimetype
            }
          });

          await prisma.registrationMedia.create({
            data: {
              userId: user.id,
              mediaId: media.id
            }
          });
        }
      }

      return {
        success: true,
        message: 'Un code de vérification a été envoyé à votre email',
        data: { userId: user.id }
      };
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      return {
        success: false,
        message: 'Erreur lors de l\'inscription'
      };
    }
  }

  static async verifyOTP(email: string, otp: string): Promise<ApiResponse> {
    try {
      const otpRecord = await prisma.otpVerification.findFirst({
        where: {
          email,
          otp,
          verified: false,
          expiresAt: {
            gte: new Date()
          }
        }
      });

      if (!otpRecord) {
        return {
          success: false,
          message: 'Code OTP invalide ou expiré'
        };
      }

      // Marquer l'OTP comme vérifié
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { verified: true }
      });

      // Marquer l'utilisateur comme vérifié
      await prisma.user.update({
        where: { email },
        data: { isVerified: true }
      });

      return {
        success: true,
        message: 'Email vérifié avec succès. Votre inscription sera examinée par un administrateur.'
      };
    } catch (error) {
      console.error('Erreur lors de la vérification OTP:', error);
      return {
        success: false,
        message: 'Erreur lors de la vérification'
      };
    }
  }

  static async loginUser(loginData: LoginData): Promise<ApiResponse> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: loginData.email }
      });

      if (!user) {
        return {
          success: false,
          message: 'Email ou mot de passe incorrect'
        };
      }

      if (!user.isVerified) {
        return {
          success: false,
          message: 'Veuillez vérifier votre email avant de vous connecter'
        };
      }

      if (!user.isApproved) {
        return {
          success: false,
          message: 'Votre compte n\'a pas encore été approuvé par un administrateur'
        };
      }

      const isPasswordValid = await comparePassword(loginData.password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Email ou mot de passe incorrect'
        };
      }

      const token = generateToken({
        id: user.id,
        email: user.email,
        role: 'user'
      });

      return {
        success: true,
        message: 'Connexion réussie',
        data: {
          token,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone
          }
        }
      };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return {
        success: false,
        message: 'Erreur lors de la connexion'
      };
    }
  }

  static async loginAdmin(loginData: LoginData): Promise<ApiResponse> {
    try {
      const admin = await prisma.admin.findUnique({
        where: { email: loginData.email }
      });

      if (!admin) {
        return {
          success: false,
          message: 'Email ou mot de passe incorrect'
        };
      }

      const isPasswordValid = await comparePassword(loginData.password, admin.password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Email ou mot de passe incorrect'
        };
      }

      const token = generateToken({
        id: admin.id,
        email: admin.email,
        role: 'admin'
      });

      return {
        success: true,
        message: 'Connexion administrateur réussie',
        data: {
          token,
          admin: {
            id: admin.id,
            email: admin.email
          }
        }
      };
    } catch (error) {
      console.error('Erreur lors de la connexion admin:', error);
      return {
        success: false,
        message: 'Erreur lors de la connexion'
      };
    }
  }

  static async resendOTP(email: string): Promise<ApiResponse> {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return {
          success: false,
          message: 'Aucun utilisateur trouvé avec cet email'
        };
      }

      if (user.isVerified) {
        return {
          success: false,
          message: 'Cet email est déjà vérifié'
        };
      }

      // Supprimer les anciens OTP non vérifiés
      await prisma.otpVerification.deleteMany({
        where: {
          email,
          verified: false
        }
      });

      // Générer un nouveau OTP
      const otp = generateOTP();
      const otpExpiresAt = new Date(Date.now() + parseInt(process.env.OTP_EXPIRES_IN || '300000'));

      await prisma.otpVerification.create({
        data: {
          email,
          otp,
          expiresAt: otpExpiresAt
        }
      });

      await sendOTPEmail(email, otp);

      return {
        success: true,
        message: 'Un nouveau code de vérification a été envoyé'
      };
    } catch (error) {
      console.error('Erreur lors du renvoi OTP:', error);
      return {
        success: false,
        message: 'Erreur lors du renvoi du code'
      };
    }
  }
}

export default AuthService;
