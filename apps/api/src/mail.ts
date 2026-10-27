import nodemailer from 'nodemailer';
import { mkdir, writeFile } from 'node:fs/promises';
import type { Config } from './config';
import { ApiError } from './security';
export type SendMail = (email: string, kind: 'verify' | 'reset', token: string) => Promise<void>;
export function mailer(config: Config): SendMail {
  const transport = config.SMTP_HOST ? nodemailer.createTransport({ host: config.SMTP_HOST, port: config.SMTP_PORT, secure: config.SMTP_PORT === 465, auth: config.SMTP_USER ? { user: config.SMTP_USER, pass: config.SMTP_PASS } : undefined }) : null;
  return async (email, kind, token) => {
    const url = `${config.FRONTEND_URL}/account/${kind}?token=${encodeURIComponent(token)}`;
    if (transport) { await transport.sendMail({ from: config.EMAIL_FROM, to: email, subject: kind === 'verify' ? 'Verify your TrackLab email' : 'Reset your TrackLab password', text: `Open this link to ${kind === 'verify' ? 'verify your email' : 'reset your password'}: ${url}\nThis link expires in ${kind === 'verify' ? '24 hours' : '30 minutes'}. If you did not request it, ignore this message.` }); return; }
    if (config.NODE_ENV === 'production') throw new ApiError(503, 'EMAIL_UNAVAILABLE', 'Email delivery is unavailable.');
    await mkdir('.local/mail', { recursive: true });
    await writeFile(`.local/mail/${kind}-${Date.now()}.json`, JSON.stringify({ to: email, url }, null, 2), { mode: 0o600 });
  };
}
