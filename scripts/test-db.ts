import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('🔍 Test de connexion à la base de données...');
    
    await prisma.$connect();
    console.log('✅ Connexion à la base de données réussie !');
    
    const adminCount = await prisma.admin.count();
    console.log(`👑 Nombre d'administrateurs: ${adminCount}`);
    
    const userCount = await prisma.user.count();
    console.log(`👥 Nombre d'utilisateurs: ${userCount}`);
    
    console.log('✅ Test de base de données terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test de base de données:', error);
    console.log('💡 Assurez-vous que PostgreSQL est démarré et que la base de données existe');
    console.log('💡 Commandes utiles:');
    console.log('   createdb api_caleb');
    console.log('   npx prisma migrate dev');
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
