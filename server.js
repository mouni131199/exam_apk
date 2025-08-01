// ✅ Updated server.js with proper session and flash setup
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.route");
const dashboardRoutes = require("./routes/dashboard.route");
const adminRoutes = require("./routes/admin.route");
const examRoutes = require("./routes/exam.route");
const questionRoutes = require("./routes/question.route");
const otpRoutes = require("./routes/otp.routes");
const studentRoutes = require("./routes/student.route");

const setupSession = require("./middlewares/session.middleware"); // ✅ single correct import

dotenv.config();

const app = express();

// ✅ Connect to DB
const connectDB = require("./config/db");
connectDB();

// ✅ Core Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Setup session + flash
setupSession(app); // 👈 this includes both session & flash

// ✅ Make flash messages available in views (locals)
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// ✅ EJS view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ✅ Static files
app.use(express.static(path.join(__dirname, "public")));

// ✅ Routes
app.get("/", (req, res) => {
  res.render("home");
});
app.use("/auth", authRoutes);
app.use("/dashboards", dashboardRoutes);
app.use("/admin", adminRoutes);
app.use("/exam", examRoutes);
app.use("/question", questionRoutes);
app.use("/otp", otpRoutes);
app.use("/student", studentRoutes);

// ✅ Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
