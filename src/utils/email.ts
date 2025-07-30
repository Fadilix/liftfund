import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Code de vérification - Plateforme de campagnes',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Code de vérification</h2>
        <p>Votre code de vérification est :</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; margin: 0; font-size: 32px; letter-spacing: 3px;">${otp}</h1>
        </div>
        <p>Ce code expire dans 5 minutes.</p>
        <p>Si vous n'avez pas demandé ce code, ignorez ce message.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendApprovalEmail = async (email: string, firstName: string): Promise<void> => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Compte approuvé - Plateforme de campagnes',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Félicitations ${firstName} !</h2>
        <p>Votre compte a été approuvé par l'administrateur.</p>
        <p>Vous pouvez maintenant vous connecter et créer vos campagnes.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/login" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            Se connecter
          </a>
        </div>
        <p>Merci de faire partie de notre plateforme !</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendRejectionEmail = async (email: string, firstName: string, reason?: string): Promise<void> => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Inscription non approuvée - Plateforme de campagnes',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Bonjour ${firstName},</h2>
        <p>Nous regrettons de vous informer que votre inscription n'a pas été approuvée.</p>
        ${reason ? `<p><strong>Raison :</strong> ${reason}</p>` : ''}
        <p>Si vous pensez qu'il y a une erreur, n'hésitez pas à nous contacter.</p>
        <p>Cordialement,<br>L'équipe de la plateforme</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
