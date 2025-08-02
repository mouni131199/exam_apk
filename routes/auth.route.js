const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const SuperAdmin = require("../models/superadmin.model");
const Admin = require("../models/admin.model");
const Student = require("../models/student.model");

// ✅ GET: Login Page
router.get("/login", (req, res) => {
  const rememberedEmail = req.cookies.rememberedEmail || "";
  res.render("login", { rememberedEmail }); // Flash messages handled globally
});

// ✅ GET: Register Page
router.get("/register", (req, res) => {
  res.render("register"); // Flash messages handled globally
});

// ✅ POST: Login Handler
router.post("/login", async (req, res) => {
  const { role, email, password, remember } = req.body;

  if (!role || !email || !password) {
    req.flash("error", "All fields are required.");
    return res.redirect("/auth/login");
  }

  try {
    let user;

    // 🔍 Find user based on role
    if (role === "superadmin") {
      user = await SuperAdmin.findOne({ email });
    } else if (role === "admin") {
      user = await Admin.findOne({ email });
    } else if (role === "student") {
      user = await Student.findOne({ email });
    } else {
      req.flash("error", "Invalid role selected.");
      return res.redirect("/auth/login");
    }

    if (!user) {
      console.log("❌ User not found:", role, email);
      req.flash("error", "Invalid email or password.");
      return res.redirect("/auth/login");
    }

    // ✅ Password check
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log("❌ Password mismatch for:", email);
      req.flash("error", "Invalid email or password.");
      return res.redirect("/auth/login");
    }

    // ✅ Set session
    req.session.user = {
      id: user._id,
      role,
      email: user.email,
       name: user.name,
    };

    // ✅ Remember me
    if (remember) {
      res.cookie("rememberedEmail", email, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
    } else {
      res.clearCookie("rememberedEmail");
    }

    // ✅ Save session before redirect
    req.session.save((err) => {
      if (err) {
        console.error("❌ Session save error:", err);
        req.flash("error", "Session failed.");
        return res.redirect("/auth/login");
      }
      return res.redirect(`/dashboards/${role}`);
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    req.flash("error", "Something went wrong.");
    return res.redirect("/auth/login");
  }
});

// ✅ GET: Logout
router.get("/logout", (req, res) => {
  if (req.session) {
    req.flash("success", "Logged out successfully.");
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).send("Logout failed.");
      }
      res.redirect("/");
    });
  } else {
    res.redirect("/");
  }
});

module.exports = router;
