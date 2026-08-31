import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('EMAIL_USER / EMAIL_PASS not set — emails will be logged to console instead of sent.');
    return null;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  return transporter;
};

// Sends an email, falling back to a console log if no mail credentials are configured (dev mode).
export const sendEmail = async ({ to, subject, html }) => {
  const t = getTransporter();

  if (!t) {
    console.log(`[mailer:stub] To: ${to} | Subject: ${subject}\n${html}`);
    return { stubbed: true };
  }

  return t.sendMail({
    from: `"Delivery App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
