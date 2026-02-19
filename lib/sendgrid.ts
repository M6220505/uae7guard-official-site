import sgMail from '@sendgrid/mail';

let initialized = false;

function init() {
  if (initialized) return;
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    throw new Error('SENDGRID_API_KEY is not configured');
  }
  sgMail.setApiKey(apiKey);
  initialized = true;
}

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'alerts@uae7guard.com';
const FROM_NAME = 'UAE7Guard Security';

// Send a security alert email
export async function sendSecurityAlert(to: string, data: {
  subject: string;
  address: string;
  riskLevel: string;
  riskScore: number;
  recommendation: string;
}): Promise<void> {
  init();

  await sgMail.send({
    to,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: data.subject,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#e4e4e7;padding:32px;border-radius:12px">
        <h1 style="color:#10b981;font-size:24px;margin-bottom:8px">UAE7Guard Alert</h1>
        <p style="color:#71717a;margin-bottom:24px">A security event requires your attention.</p>
        <div style="background:#18181b;border:1px solid #27272a;border-radius:8px;padding:20px;margin-bottom:16px">
          <div style="color:#71717a;font-size:12px;text-transform:uppercase;margin-bottom:4px">Address</div>
          <div style="font-family:monospace;color:#22d3ee;word-break:break-all">${data.address}</div>
        </div>
        <div style="display:flex;gap:16px;margin-bottom:24px">
          <div style="flex:1;background:#18181b;border:1px solid #27272a;border-radius:8px;padding:16px;text-align:center">
            <div style="font-size:28px;font-weight:bold;color:${
              data.riskLevel === 'critical' ? '#ef4444' :
              data.riskLevel === 'high' ? '#f97316' :
              data.riskLevel === 'moderate' ? '#eab308' : '#10b981'
            }">${data.riskScore}</div>
            <div style="color:#71717a;font-size:12px;text-transform:uppercase">${data.riskLevel} risk</div>
          </div>
        </div>
        <p style="color:#a1a1aa">${data.recommendation}</p>
        <hr style="border-color:#27272a;margin:24px 0" />
        <p style="color:#52525b;font-size:12px;text-align:center">UAE7Guard — Enterprise Web3 Security Platform</p>
      </div>
    `,
  });
}

// Send a welcome email after signup
export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  init();

  await sgMail.send({
    to,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: 'Welcome to UAE7Guard',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#e4e4e7;padding:32px;border-radius:12px">
        <h1 style="color:#10b981;font-size:24px">Welcome, ${name}!</h1>
        <p style="color:#a1a1aa;margin-top:12px">Your account is ready. Start scanning wallet addresses for threats, configure alerts, and protect your Web3 assets.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://uae7guard.com'}/dashboard" style="display:inline-block;margin-top:24px;padding:12px 24px;background:linear-gradient(to right,#10b981,#06b6d4);color:#000;font-weight:bold;border-radius:8px;text-decoration:none">Open Dashboard</a>
        <hr style="border-color:#27272a;margin:24px 0" />
        <p style="color:#52525b;font-size:12px;text-align:center">UAE7Guard — Enterprise Web3 Security Platform</p>
      </div>
    `,
  });
}
