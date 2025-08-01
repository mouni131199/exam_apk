const Student = require("../models/student.model");
const bcrypt = require("bcryptjs");
const { sendOTP, verifyOTP } = require("../utils/otp");
const Admin = require("../models/admin.model");
const SuperAdmin = require("../models/superadmin.model");

// ✅ Register Student
exports.registerStudent = async (req, res) => {
  const { name, rollNo, year, email, password, confirmPassword, otp } = req.body;

  try {
    const isOtpValid = verifyOTP(email, otp);
    if (!isOtpValid) {
      req.flash("error", "Invalid or expired OTP.");
      return res.redirect("/student/register");
    }

    const existing = await Student.findOne({ email });
    if (existing) {
      req.flash("error", "Student already registered with this email.");
      return res.redirect("/student/register");
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      req.flash("error", "Password must be at least 8 characters long and include uppercase, lowercase, and a digit.");
      return res.redirect("/student/register");
    }

    if (password !== confirmPassword) {
      req.flash("error", "Passwords do not match.");
      return res.redirect("/student/register");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = new Student({
      name,
      rollNo,
      year,
      email,
      password: hashedPassword,
      verified: true,
    });

    await newStudent.save();

    req.flash("success", "Registration successful! You can now login.");
    res.redirect("/auth/login");
  } catch (err) {
    console.error("❌ Registration Error:", err);
    req.flash("error", "Something went wrong during registration.");
    res.redirect("/student/register");
  }
};

// ✅ Forgot Password: Step 1 - Send OTP
exports.sendForgotPasswordOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const isAdmin = await Admin.findOne({ email });
    const isSuperAdmin = await SuperAdmin.findOne({ email });

    if (isAdmin || isSuperAdmin) {
      req.flash("error", "Admins/SuperAdmins cannot reset password here.");
      return res.redirect("/student/forgot-password");
    }

    const student = await Student.findOne({ email });
    if (!student) {
      req.flash("error", "No student found with this email.");
      return res.redirect("/student/forgot-password");
    }

    await sendOTP(email);
    req.flash("success", "OTP sent to your email.");
    return res.redirect("/student/forgot-password");
  } catch (err) {
    console.error("❌ OTP Send Error:", err);
    req.flash("error", "Something went wrong while sending OTP.");
    return res.redirect("/student/forgot-password");
  }
};

// ✅ Forgot Password: Step 2 - Verify OTP
exports.verifyForgotPasswordOTP = (req, res) => {
  const { email, otp } = req.body;

  try {
    const isValid = verifyOTP(email, otp);
    if (!isValid) {
      req.flash("error", "Invalid or expired OTP.");
      return res.redirect("/student/forgot-password");
    }

    req.session.resetEmail = email;
    return res.redirect("/student/reset-password");
  } catch (err) {
    console.error("❌ OTP Verification Error:", err);
    req.flash("error", "Something went wrong.");
    res.redirect("/student/forgot-password");
  }
};

// ✅ Step 3: Reset Password
exports.resetPassword = async (req, res) => {
  const { password, confirmPassword } = req.body;
  const email = req.session.resetEmail;

  if (!email) {
    req.flash("error", "Session expired. Please try again.");
    return res.redirect("/student/forgot-password");
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(password)) {
    req.flash("error", "Password must be 8+ chars, include uppercase, lowercase, and a digit.");
    return res.redirect("/student/reset-password");
  }

  if (password !== confirmPassword) {
    req.flash("error", "Passwords do not match.");
    return res.redirect("/student/reset-password");
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    await Student.updateOne({ email }, { password: hashed });

    req.session.resetEmail = null;
    req.flash("success", "Password updated! You can now login.");
    res.redirect("/auth/login");
  } catch (err) {
    console.error("❌ Password Reset Error:", err);
    req.flash("error", "Failed to reset password.");
    res.redirect("/student/reset-password");
  }
};
