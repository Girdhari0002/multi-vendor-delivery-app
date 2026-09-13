import nodemailer from 'nodemailer';
import dns from 'dns';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('EMAIL_USER / EMAIL_PASS not set');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,

    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },

    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,

    lookup: (hostname, options, callback) => {
      dns.lookup(hostname, {
        family: 4,
        all: false,
      }, callback);
    },
  });

  return transporter;
};

export const sendEmail = async ({ to, subject, html }) => {
  const t = getTransporter();

  if (!t) {
    console.log(`[mailer:stub] To: ${to} | Subject: ${subject}`);
    return { stubbed: true };
  }

  try {
    const info = await t.sendMail({
      from: `"Delivery App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log('Email sent successfully:', info.messageId);

    return info;
  } catch (error) {
    console.error('========== EMAIL ERROR ==========');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Command:', error.command);
    console.error('Stack:', error.stack);
    console.error('================================');

    throw error;
  }
};