import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/auth';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function createDefaultAdmin() {
  try {
    const defaultEmail = 'admin@caleb.com';
    const defaultPassword = 'Admin123!';

    const existingAdmin = await prisma.admin.findUnique({
      where: { email: defaultEmail }
    });

    if (existingAdmin) {
      console.log('❌ Un administrateur par défaut existe déjà');
      return;
    }

    const hashedPassword = await hashPassword(defaultPassword);
    
    const admin = await prisma.admin.create({
      data: {
        email: defaultEmail,
        password: hashedPassword
      }
    });

    console.log('✅ Administrateur par défaut créé avec succès');
    console.log(`📧 Email: ${defaultEmail}`);
    console.log(`🔐 Mot de passe: ${defaultPassword}`);
    console.log('⚠️  Pensez à changer ce mot de passe après la première connexion!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultAdmin();
