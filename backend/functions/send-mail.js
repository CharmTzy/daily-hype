const nodemailer = require("nodemailer");

const fromAddress = process.env.MAIL_FROM || process.env.SMTP_USER || "no-reply@dailyhype.local";
const hasSmtpConfig =
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS;

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      service: process.env.SMTP_SERVICE || undefined,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

const sendMail = async ({ to, subject, html, text }) => {
  if (!transporter) {
    console.log(`[mail disabled] ${subject} -> ${to}`);
    return {
      accepted: [to],
      messageId: "mail-disabled",
    };
  }

  return transporter.sendMail({
    from: fromAddress,
    to,
    subject,
    html,
    text,
  });
};

module.exports.sendEmailVerificationCode = async (IPAddress, code, email) => {
  const info = await sendMail({
    to: email,
    subject: "DailyHype Email Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 12px auto; background-color: #f4f4f4;">
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px;">
          <h1 style="color: #333; text-align: center;">DailyHype</h1>
          <h2 style="color: #333; text-align: center;">Verification Code</h2>
          <p style="color: #333; text-align: center; font-size: 18px;">Enter the following verification code when prompted:</p>
          <div style="background-color: #007bff; max-width: 300px; margin: 0 auto; color: #fff; text-align: center; font-size: 32px; padding: 10px; border-radius: 4px;">
            ${code}
          </div>
          <p style="color: #333; text-align: center; font-size: 16px;">To protect your account, do not share this code.</p>
          <p style="color: #333; text-align: center; font-size: 16px;">Request IP: ${IPAddress}</p>
        </div>
      </div>
    `,
    text: `DailyHype verification code: ${code}`,
  });

  console.log("Verification message sent:", info.messageId);
  return info;
};

module.exports.sendOrderConfirmation = async (orderID, product, email) => {
  const itemsHtml = Array.isArray(product)
    ? product
        .map(
          (item) =>
            `<li>${item.productname || item.name || "Item"} x${item.qty || item.quantity || 1}</li>`,
        )
        .join("")
    : "";

  const info = await sendMail({
    to: email,
    subject: `Order Confirmation #${orderID}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 12px auto; background-color: #f4f4f4;">
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px;">
          <h1 style="color: #333; text-align: center;">DailyHype</h1>
          <h2 style="color: #333; text-align: center;">Order Confirmation</h2>
          <p style="color: #333; font-size: 16px;">Your order <strong>#${orderID}</strong> has been received.</p>
          ${itemsHtml ? `<ul>${itemsHtml}</ul>` : ""}
        </div>
      </div>
    `,
    text: `DailyHype order confirmation #${orderID}`,
  });

  console.log("Order confirmation sent:", info.messageId);
  return info;
};
