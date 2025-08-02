// routes/dashboard.route.js

const express = require("express");
const Exam = require("../models/exam.model");
const Attempt = require("../models/attempt.model");
const Student = require("../models/student.model");
const Admin = require("../models/admin.model");
const { ensureAuthenticated, authorizeRole } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/superadmin", ensureAuthenticated, authorizeRole("superadmin"), async (req, res) => {
  try {
    const admins = await Admin.find({});
    res.render("dashboards/superadmin", { admins });
  } catch (err) {
    console.error("❌ Error loading superadmin dashboard:", err);
    res.status(500).send("Failed to load admin data.");
  }
});

router.get("/admin", ensureAuthenticated, authorizeRole("admin"), (req, res) => {
  console.log("✅ Accessing Admin Dashboard with Session:", req.session.user);
  res.render("dashboards/admin", {
    user: req.session.user,
    messages: req.flash(), // ✅ Add this to make flash available in admin view too
  });
});

router.get("/student", ensureAuthenticated, authorizeRole("student"), async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.session.user.email });

    const activeExams = await Exam.find({ isActive: true });
    const attempts = await Attempt.find({ studentId: student._id }).populate("examId");

    res.render("dashboards/student", {
      user: student,
      activeExams,
      messages: req.flash(), // ✅ Flash messages passed to EJS
      attempts,
    });
  } catch (err) {
    console.error("❌ Error rendering student dashboard:", err);
    res.status(500).send("Something went wrong.");
  }
});

module.exports = router;
