const express = require("express");
const router = express.Router();
const studentController = require("../controllers/student.controller");
const validateStudent = require("../middlewares/validateStudent.middleware");

// ✅ Register Page
router.get("/register", (req, res) => {
  res.render("register"); // Flash messages handled by res.locals
});

// ✅ Register Student (POST)
router.post("/register", validateStudent, studentController.registerStudent);

// ✅ Forgot Password - Step 1: Show Form
router.get("/forgot-password", (req, res) => {
  res.render("forgot-password"); // Flash messages handled by res.locals
});

// ✅ Forgot Password - Step 2: Send OTP
router.post("/send-otp-forgot-password", studentController.sendForgotPasswordOTP);

// ✅ Forgot Password - Step 3: Verify OTP
router.post("/forgot-password", studentController.verifyForgotPasswordOTP);

// ✅ Forgot Password - Step 4: Show Reset Password Page
router.get("/reset-password", (req, res) => {
  if (!req.session.resetEmail) {
    req.flash("error", "Unauthorized access to reset form.");
    return res.redirect("/student/forgot-password");
  }

  res.render("reset-password"); // Flash messages handled by res.locals
});

// ✅ Forgot Password - Step 5: Submit New Password
router.post("/reset-password", studentController.resetPassword);

module.exports = router;
