import nodemailer from "nodemailer";

export const sendOTPEmail = async (email, otp) => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpPort = process.env.SMTP_PORT || 587;

  console.log(`==========================================`);
  console.log(`📧 [EMAIL OTP GENERATED]`);
  console.log(`To: ${email}`);
  console.log(`OTP Code: ${otp}`);
  console.log(`==========================================`);

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log("ℹ️ SMTP credentials missing. OTP code printed to console above for testing.");
    return { success: true, mode: "console" };
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(smtpPort),
    secure: Number(smtpPort) === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });

  const mailOptions = {
    from: `"BuiltyOS" <${smtpUser}>`,
    to: email,
    subject: `Your BuiltyOS Verification Code: ${otp}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2563eb; text-align: center;">BuiltyOS Verification Code</h2>
        <p>Use the following 6-digit OTP code to log in to your account. This code is valid for <strong>10 minutes</strong>.</p>
        <div style="background-color: #f3f4f6; text-align: center; padding: 15px; border-radius: 6px; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #1e293b; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #64748b; font-size: 13px;">If you did not request this code, please ignore this email.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
  return { success: true, mode: "smtp" };
};
