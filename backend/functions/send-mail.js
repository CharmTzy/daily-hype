const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "localhost",
  port: 5001,
  secure: true,
  service: "gmail",
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user: "dailyhypeteam2023@gmail.com",
    pass: "umyy tnqa mnkw xpqy",
  },
});

// Name: Wai Yan Aung

module.exports.sendEmailVerificationCode = async (IPAddress, code, email) => {
  const info = await transporter.sendMail({
    from: "dailyhypeteam2023@gmail.com",
    to: email,
    subject: `DailyHype Email Verfication Code`,
    html: `
          <div style="font-family: 'Arial', sans-serif; padding: 20px; max-width: 500px; margin: 12px auto; background-color: #f4f4f4;">
            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
              <h1 style="color: #333; text-align: center;">DailyHype</h1>
              <h2 style="color: #333; text-align: center;">Verification Code</h2>
              <p style="color: #333; text-align: center; font-size: 18px;">Enter the following verification code when prompted:</p>
              <div style="background-color: #007bff; max-width: 300px; margin: 0 auto; color: #fff; text-align: center; font-size: 32px; padding: 10px; border-radius: 4px;">
                ${code}
              </div>
              <p style="color: #333; text-align: center; font-size: 16px;">To protect your account, do not share this code.</p>
              <p style="color: #333; text-align: center; font-size: 16px;">Your IP Address: ${IPAddress}.
              This is computer generated email. Please don't reply to this.
              </p>
            </div>
          </div>
        `,
    text: `DailyHype - Verification Code: ${code}`,
  });
  console.log("Message sent: %s", info.messageId);
  return info;
};

// Name: Wai Yan Aung

// Name: Zay Yar Tun

module.exports.sendOrderConfirmation = async (orderID, product, email) => {
  const info = await transporter.sendMail({
    from: "dailyhypeteam2023@gmail.com",
    to: email,
    subject: `Order Confirmation #${orderID}`,
    html: `
          <div style="font-family: 'Arial', sans-serif; padding: 20px; max-width: 500px; margin: 12px auto; background-color: #f4f4f4;">
            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
              <h1 style="color: #333; text-align: center;">DailyHype</h1>
              <h2 style="color: #333; text-align: center;">Verification Code</h2>
              <p style="color: #333; text-align: center; font-size: 18px;">Enter the following verification code when prompted:</p>
              <div style="background-color: #007bff; max-width: 300px; margin: 0 auto; color: #fff; text-align: center; font-size: 32px; padding: 10px; border-radius: 4px;">
                ${code}
              </div>
              <p style="color: #333; text-align: center; font-size: 16px;">To protect your account, do not share this code.</p>
              <p style="color: #333; text-align: center; font-size: 16px;">Your IP Address: ${IPAddress}.
              This is computer generated email. Please don't reply to this.
              </p>
            </div>
          </div>
        `,
    text: `Order Confirmation #${orderID}`,
  });
  console.log("Message sent: %s", info.messageId);
  return info;
};

// Name: Zay Yar Tun
