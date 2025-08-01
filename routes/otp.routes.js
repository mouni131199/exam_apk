
const express = require("express");
const router = express.Router();
const { sendOTP, verifyOTP } = require("../utils/otp");
const Student = require("../models/student.model"); // ✅ Import the model
// Trigger OTP to student email
// Send OTP route
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  console.log("📩 Received OTP request for:", email);

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  try {
    // ✅ Check if student already registered
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.json({
        success: false,
        message: "Email already registered. Please login.",
      });
    }

    // ✅ Only send OTP if student not found
    await sendOTP(email);
    return res.json({ success: true, message: "OTP sent successfully" });

  } catch (err) {
    console.error("❌ Error sending OTP:", err);
    return res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});
// Verify entered OTP
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const isValid = verifyOTP(email, otp);
  if (isValid) {
    res.json({ success: true, message: "OTP verified." });
  } else {
    res.json({ success: false, message: "Invalid OTP." });
  }
}); 

module.exports = router; 
