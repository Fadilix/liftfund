import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app: Application = express();
const PORT = 3001; // Port différent pour éviter les conflits

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Route de test simple
app.get('/test', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: '🎉 L\'API de test fonctionne !',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Route de test avec les utilitaires
app.post('/test/auth', async (req: Request, res: Response) => {
  try {
    const { hashPassword, generateToken, generateOTP } = await import('./src/utils/auth');
    
    const testPassword = 'TestPassword123!';
    const hashedPassword = await hashPassword(testPassword);
    const token = generateToken({ id: 1, email: 'test@example.com', role: 'user' });
    const otp = generateOTP();
    
    res.json({
      success: true,
      message: '🔐 Utilitaires d\'authentification testés',
      data: {
        originalPassword: testPassword,
        hashedPassword: hashedPassword.substring(0, 20) + '...',
        token: token.substring(0, 30) + '...',
        otp: otp,
        otpLength: otp.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du test des utilitaires',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

// Route de test de validation
app.post('/test/validation', async (req: Request, res: Response) => {
  try {
    const { registerSchema } = await import('./src/utils/validation');
    
    const testData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+33123456789',
      password: 'SecurePass123!'
    };
    
    const { error, value } = registerSchema.validate(testData);
    
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        error: error.details[0]?.message
      });
    } else {
      res.json({
        success: true,
        message: '✅ Validation réussie',
        data: value
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du test de validation',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

// Route 404
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route de test non trouvée'
  });
});

// Démarrage du serveur de test
app.listen(PORT, () => {
  console.log(`🧪 Serveur de test démarré sur le port ${PORT}`);
  console.log(`🔗 Test général: http://localhost:${PORT}/test`);
  console.log(`🔐 Test auth: POST http://localhost:${PORT}/test/auth`);
  console.log(`✅ Test validation: POST http://localhost:${PORT}/test/validation`);
  console.log('📝 Utilisez curl ou Postman pour tester les endpoints');
});

export default app;
