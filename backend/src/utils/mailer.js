import nodemailer from "nodemailer";

const hasSMTP = () =>
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS;

export async function sendMail({ to, subject, html }) {
  try {
    if (!hasSMTP()) return { skipped: true };

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: String(process.env.SMTP_SECURE || "false") === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const from = process.env.MAIL_FROM || process.env.SMTP_USER;

    await transporter.sendMail({ from, to, subject, html });
    return { ok: true };
  } catch (e) {
    // Do not fail order flow if email fails
    console.warn("Mailer error:", e?.message || e);
    return { ok: false };
  }
}
