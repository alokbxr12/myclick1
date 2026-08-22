import nodemailer from "nodemailer";

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailAppPassword) {
    console.warn("GMAIL_USER/GMAIL_APP_PASSWORD not set; skipping password reset email send.");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: gmailUser, pass: gmailAppPassword },
  });

  await transporter.sendMail({
    from: `MyClick <${gmailUser}>`,
    to,
    subject: "Reset your MyClick password",
    html: `
      <p>You requested a password reset for your MyClick account.</p>
      <p><a href="${resetUrl}">Click here to reset your password</a></p>
      <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
    `,
  });
}
