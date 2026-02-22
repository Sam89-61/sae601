const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
      port: parseInt(process.env.SMTP_PORT || '2525'),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendPasswordResetEmail(email, rawToken, lang = 'fr') {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reinitialiser-mot-de-passe?token=${rawToken}&email=${encodeURIComponent(email)}`;

    const isFr = lang !== 'en';

    const subject = isFr
      ? 'Réinitialisation de votre mot de passe BuddyCoach'
      : 'Reset your BuddyCoach password';

    const html = isFr
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">BuddyCoach — Réinitialisation de mot de passe</h2>
          <p>Bonjour,</p>
          <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe :</p>
          <p style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}"
               style="background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Réinitialiser mon mot de passe
            </a>
          </p>
          <p>Ce lien est valable <strong>1 heure</strong>.</p>
          <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email — votre compte reste intact.</p>
          <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="color: #6b7280; font-size: 12px;">BuddyCoach — Votre coach fitness intelligent</p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">BuddyCoach — Password Reset</h2>
          <p>Hello,</p>
          <p>You requested a password reset. Click the link below to choose a new password:</p>
          <p style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}"
               style="background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Reset my password
            </a>
          </p>
          <p>This link expires in <strong>1 hour</strong>.</p>
          <p>If you did not request this, please ignore this email — your account is safe.</p>
          <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="color: #6b7280; font-size: 12px;">BuddyCoach — Your intelligent fitness coach</p>
        </div>
      `;

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@buddycoach.com',
      to: email,
      subject,
      html,
    });
  }
}

module.exports = new EmailService();
