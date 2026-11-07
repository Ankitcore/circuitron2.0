// Vercel Serverless Function: /api/contact
// Handles contact inquiries and sends emails via Resend (https://resend.com)

const rateLimitMap = new Map();

// Helper: Sanitize inputs against HTML/XSS injection
function sanitize(str = "", maxLen = 1000) {
  if (typeof str !== "string") return "";
  return str
    .replace(/<[^>]*>?/gm, "")
    .replace(/javascript:/gi, "")
    .trim()
    .slice(0, maxLen);
}

export default async function handler(req, res) {
  // CORS Headers (allow requests from the frontend)
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method Not Allowed. Only POST requests are permitted.",
    });
  }

  try {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      "unknown-ip";

    // Rate Limiting: Max 5 submissions per IP every 10 minutes
    const now = Date.now();
    const windowMs = 10 * 60 * 1000;
    const ipHistory = rateLimitMap.get(ip) || [];
    const recentSubmissions = ipHistory.filter((time) => now - time < windowMs);

    if (recentSubmissions.length >= 5) {
      return res.status(429).json({
        success: false,
        error: "Too many messages sent. Please wait a few minutes before trying again.",
      });
    }

    const { name, email, subject, message, hp } = req.body || {};

    // Honeypot spam check: hidden field should always be empty
    if (hp) {
      return res.status(200).json({ success: true, message: "Message received." });
    }

    const cleanName = sanitize(name, 100);
    const cleanEmail = sanitize(email, 120);
    const cleanSubject = sanitize(subject, 150) || `TechXpo 2.O Inquiry from ${cleanName}`;
    const cleanMessage = sanitize(message, 2500);

    // Validation checks
    if (!cleanName || cleanName.length < 2) {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid name (at least 2 characters).",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid email address.",
      });
    }

    if (!cleanMessage || cleanMessage.length < 10) {
      return res.status(400).json({
        success: false,
        error: "Please write a message with at least 10 characters.",
      });
    }

    // Check for Resend API Key in environment variables
    const apiKey = process.env.RESEND_API_KEY;
    const receiverConfig = process.env.CONTACT_RECEIVER_EMAIL || "www.aku121@gmail.com";
    const receiverEmails = receiverConfig.split(",").map((e) => e.trim()).filter(Boolean);
    const senderEmail = process.env.RESEND_FROM_EMAIL || "TechXpo Portal <onboarding@resend.dev>";

    if (!apiKey) {
      // Return helpful configuration status
      console.warn("RESEND_API_KEY is not configured in Vercel environment variables.");
      return res.status(503).json({
        success: false,
        error:
          "Email service pending configuration. Please add RESEND_API_KEY in your Vercel Project Settings > Environment Variables.",
        debugInfo: { cleanName, cleanEmail, subject: cleanSubject },
      });
    }

    // Cyberpunk themed HTML email template for Circuitron
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #050816; color: #ffffff; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #0b1329; border: 1px solid #00f0ff33; border-radius: 16px; padding: 32px; box-shadow: 0 0 30px rgba(0, 240, 255, 0.1); }
            .header { border-bottom: 1px solid #00f0ff22; padding-bottom: 20px; margin-bottom: 24px; }
            .badge { display: inline-block; background: rgba(0, 240, 255, 0.1); border: 1px solid #00f0ff; color: #00f0ff; font-family: monospace; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; }
            h2 { font-size: 24px; font-weight: 800; color: #ffffff; margin: 12px 0 4px 0; }
            p { color: #d1d5db; line-height: 1.6; font-size: 14px; }
            .meta-box { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 16px; margin: 20px 0; }
            .meta-item { margin-bottom: 8px; font-size: 13px; }
            .meta-label { color: #9ca3af; font-family: monospace; }
            .meta-value { color: #00f0ff; font-weight: 600; }
            .message-box { background: #060b18; border-left: 3px solid #00f0ff; padding: 16px; border-radius: 0 12px 12px 0; margin-top: 20px; }
            .message-title { font-size: 12px; font-family: monospace; color: #9ca3af; text-transform: uppercase; margin-bottom: 8px; }
            .message-text { color: #ffffff; font-size: 15px; white-space: pre-wrap; line-height: 1.7; }
            .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.08); font-size: 12px; color: #6b7280; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <span class="badge">Official TechXpo 2.O Portal</span>
              <h2>New Direct Message Received</h2>
              <p>A participant or visitor submitted an inquiry through the TechXpo 2.O website.</p>
            </div>

            <div class="meta-box">
              <div class="meta-item">
                <span class="meta-label">Sender Name:</span> <strong style="color: #ffffff;">${cleanName}</strong>
              </div>
              <div class="meta-item">
                <span class="meta-label">Reply Email:</span> <a href="mailto:${cleanEmail}" style="color: #00f0ff; text-decoration: none;">${cleanEmail}</a>
              </div>
              <div class="meta-item">
                <span class="meta-label">Subject:</span> <span style="color: #ffffff;">${cleanSubject}</span>
              </div>
              <div class="meta-item" style="margin-bottom: 0;">
                <span class="meta-label">Timestamp:</span> <span style="color: #9ca3af;">${new Date().toUTCString()}</span>
              </div>
            </div>

            <div class="message-box">
              <div class="message-title">Message Contents</div>
              <div class="message-text">${cleanMessage}</div>
            </div>

            <div style="margin-top: 24px; text-align: center;">
              <a href="mailto:${cleanEmail}?subject=Re:%20${encodeURIComponent(cleanSubject)}" style="display: inline-block; background: #00f0ff; color: #050816; font-weight: bold; font-size: 13px; padding: 10px 24px; border-radius: 8px; text-decoration: none;">
                Reply Directly to ${cleanName}
              </a>
            </div>

            <div class="footer">
              TechXpo 2.O &bull; Circuitron (IoT &amp; Embedded Systems Club) &bull; RVSCET Jamshedpur
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email via Resend REST API
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: senderEmail,
        to: receiverEmails,
        reply_to: cleanEmail,
        subject: `[TechXpo 2.O Inquiry] ${cleanSubject}`,
        html: emailHtml,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", data);
      return res.status(response.status).json({
        success: false,
        error: data.message || "Failed to transmit message via email provider.",
      });
    }

    // Update rate limit on successful send
    recentSubmissions.push(now);
    rateLimitMap.set(ip, recentSubmissions);

    return res.status(200).json({
      success: true,
      message: "Message successfully transmitted to the TechXpo secretariat.",
      id: data.id,
    });
  } catch (error) {
    console.error("Serverless contact handler error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error while processing your inquiry.",
    });
  }
}
