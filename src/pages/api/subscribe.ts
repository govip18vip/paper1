// src/pages/api/subscribe.ts
// ─────────────────────────────────────────────────────────────
// 邮件订阅 API — Resend 集成
// POST /api/subscribe  { email: string, lang?: string }
// ─────────────────────────────────────────────────────────────

export const prerender = false;

import type { APIRoute } from "astro";

// 多语言邮件模板内容
const WELCOME_CONTENT: Record<string, { subject: string; heading: string; intro: string; cta: string; unsubNote: string }> = {
  "zh-CN": {
    subject:   "欢迎订阅 Bitaigen — 专业区块链资讯",
    heading:   "欢迎加入 Bitaigen！",
    intro:     "感谢您订阅我们的区块链资讯简报。您将第一时间收到：",
    cta:       "访问 Bitaigen.com →",
    unsubNote: "如需退订，请回复此邮件并注明「退订」。",
  },
  "zh-TW": {
    subject:   "歡迎訂閱 Bitaigen — 專業區塊鏈資訊",
    heading:   "歡迎加入 Bitaigen！",
    intro:     "感謝您訂閱我們的區塊鏈資訊快報。您將第一時間收到：",
    cta:       "前往 Bitaigen.com →",
    unsubNote: "如需退訂，請回覆此郵件並注明「退訂」。",
  },
  "en": {
    subject:   "Welcome to Bitaigen — Professional Blockchain News",
    heading:   "Welcome to Bitaigen!",
    intro:     "Thanks for subscribing to our blockchain newsletter. You'll receive:",
    cta:       "Visit Bitaigen.com →",
    unsubNote: "To unsubscribe, reply to this email with 'unsubscribe'.",
  },
  "es": {
    subject:   "Bienvenido a Bitaigen — Noticias Blockchain Profesionales",
    heading:   "¡Bienvenido a Bitaigen!",
    intro:     "Gracias por suscribirte. Recibirás:",
    cta:       "Visitar Bitaigen.com →",
    unsubNote: "Para cancelar la suscripción, responde a este correo con 'cancelar'.",
  },
  "pt": {
    subject:   "Bem-vindo ao Bitaigen — Notícias Blockchain Profissionais",
    heading:   "Bem-vindo ao Bitaigen!",
    intro:     "Obrigado por se inscrever. Você receberá:",
    cta:       "Visitar Bitaigen.com →",
    unsubNote: "Para cancelar a inscrição, responda a este e-mail com 'cancelar'.",
  },
};

const BULLET_ITEMS: Record<string, string[]> = {
  "zh-CN": ["比特币、以太坊实时行情分析", "加密货币市场深度报道", "交易所使用教程与安全指南", "DeFi 协议最新动态"],
  "zh-TW": ["比特幣、以太坊即時行情分析", "加密貨幣市場深度報導", "交易所使用教學與安全指南", "DeFi 協議最新動態"],
  "en":    ["Real-time Bitcoin & Ethereum price analysis", "In-depth crypto market reporting", "Exchange tutorials & wallet security guides", "Latest DeFi protocol news"],
  "es":    ["Análisis de precio de Bitcoin y Ethereum en tiempo real", "Informes de mercado cripto en profundidad", "Tutoriales de exchanges y guías de seguridad", "Últimas noticias de protocolos DeFi"],
  "pt":    ["Análise de preço de Bitcoin e Ethereum em tempo real", "Relatórios de mercado cripto aprofundados", "Tutoriais de exchanges e guias de segurança", "Últimas notícias de protocolos DeFi"],
};

function buildWelcomeHtml(lang: string, fromYear: number): string {
  const c = WELCOME_CONTENT[lang] ?? WELCOME_CONTENT["zh-CN"];
  const bullets = BULLET_ITEMS[lang] ?? BULLET_ITEMS["zh-CN"];
  const bulletHtml = bullets.map(b => `<li style="margin:4px 0;">${b}</li>`).join("\n");

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${c.subject}</title>
</head>
<body style="margin:0;padding:0;background:#f0f1f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation"
          style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e8e9ef;">
          <!-- Header -->
          <tr>
            <td style="background:#0d0e14;padding:24px 32px;text-align:center;">
              <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto;">
                <tr>
                  <td style="background:#f7931a;width:36px;height:36px;border-radius:8px;text-align:center;vertical-align:middle;">
                    <span style="font-size:18px;font-weight:900;color:#fff;line-height:36px;">₿</span>
                  </td>
                  <td style="padding-left:12px;vertical-align:middle;">
                    <span style="font-size:20px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;">Bitaigen</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 32px 28px;">
              <h1 style="font-size:22px;font-weight:800;color:#1a1a1a;margin:0 0 14px;line-height:1.3;">${c.heading}</h1>
              <p style="font-size:15px;color:#666677;line-height:1.7;margin:0 0 16px;">${c.intro}</p>
              <ul style="font-size:14px;color:#666677;line-height:1.9;padding-left:20px;margin:0 0 28px;">
                ${bulletHtml}
              </ul>
              <a href="https://bitaigen.com"
                style="display:inline-block;background:#f7931a;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:15px;font-weight:700;letter-spacing:0.01em;">
                ${c.cta}
              </a>
            </td>
          </tr>
          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #e8e9ef;margin:0;" /></td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;text-align:center;font-size:12px;color:#999aaa;line-height:1.7;">
              <p style="margin:0;">© ${fromYear} <a href="https://bitaigen.com" style="color:#f7931a;text-decoration:none;">Bitaigen.com</a> — Professional Blockchain Intelligence</p>
              <p style="margin:6px 0 0;font-size:11px;opacity:0.7;">${c.unsubNote}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export const POST: APIRoute = async ({ request }) => {
  const headers = { "Content-Type": "application/json" };

  // ── Parse body ────────────────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_body" }), { status: 400, headers });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const lang  = typeof body.lang  === "string" ? body.lang  : "zh-CN";

  // ── Validate email ────────────────────────────────────────
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: "invalid_email" }), { status: 400, headers });
  }

  // ── Check API key ─────────────────────────────────────────
  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[subscribe] RESEND_API_KEY not configured");
    return new Response(JSON.stringify({ error: "not_configured" }), { status: 500, headers });
  }

  const resendHeaders = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  try {
    // ── 1. Add contact to Resend Audience ─────────────────────
    const audienceId = import.meta.env.RESEND_AUDIENCE_ID;
    if (audienceId) {
      const audienceRes = await fetch(
        `https://api.resend.com/audiences/${audienceId}/contacts`,
        {
          method: "POST",
          headers: resendHeaders,
          body: JSON.stringify({ email, unsubscribe: false }),
          signal: AbortSignal.timeout(8000),
        }
      );
      if (!audienceRes.ok) {
        const err = await audienceRes.text().catch(() => "");
        console.warn("[subscribe] audience add failed:", err);
        // Non-fatal — continue to send welcome email
      }
    }

    // ── 2. Send welcome email (requires verified sender domain) ─
    const fromEmail = import.meta.env.RESEND_FROM_EMAIL;
    if (fromEmail) {
      const content = WELCOME_CONTENT[lang] ?? WELCOME_CONTENT["zh-CN"];
      const html = buildWelcomeHtml(lang, new Date().getFullYear());

      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: resendHeaders,
        body: JSON.stringify({
          from:    `Bitaigen <${fromEmail}>`,
          to:      [email],
          subject: content.subject,
          html,
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (!emailRes.ok) {
        const errText = await emailRes.text().catch(() => "");
        console.warn("[subscribe] welcome email failed:", errText);
        // Non-fatal — subscriber was already added to audience
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers });

  } catch (err) {
    console.error("[subscribe] unexpected error:", err);
    return new Response(JSON.stringify({ error: "server_error" }), { status: 500, headers });
  }
};
