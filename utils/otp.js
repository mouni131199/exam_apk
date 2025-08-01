const nodemailer = require("nodemailer");

const otpStore = new Map(); // key: email, value: { otp, expiresAt }

function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log("🔢 Generated OTP:", otp); // Debug
  return otp;
}

async function sendOTP(email) {
  const otp = generateOTP();
  const expiresAt = Date.now() + 5 * 60 * 1000;

  console.log(`🔢 Generated OTP: ${otp}`);
  console.log(`📅 Expires at: ${new Date(expiresAt).toLocaleTimeString()}`);

  otpStore.set(email, { otp, expiresAt });
  console.log("📥 Stored OTP in memory for:", email);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Exam Portal - OTP Verification",
    text: `Your OTP is: ${otp}. It expires in 5 minutes.`,
  };

  const result = await transporter.sendMail(mailOptions);
  console.log("📧 Email sent successfully:", result.response);

  return otp;
}


function verifyOTP(email, inputOtp) {
  const record = otpStore.get(email);
  console.log("🔍 Verifying OTP for:", email); // Debug

  if (!record) {
    console.log("❌ No OTP record found for email");
    return false;
  }

  const { otp, expiresAt } = record;

  if (Date.now() > expiresAt) {
    console.log("⏰ OTP expired");
    otpStore.delete(email);
    return false;
  }

  const isMatch = otp === inputOtp;
  console.log("✅ OTP match:", isMatch);
  return isMatch;
}

module.exports = {
  sendOTP,
  verifyOTP,
};
