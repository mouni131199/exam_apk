// middlewares/validateStudent.js

module.exports = function validateStudent(req, res, next) {
  const { rollNo, year, email, password, confirmPassword, otp } = req.body;

  if (!rollNo || !year || !email || !password || !confirmPassword || !otp) {
    req.flash("error", "All fields are required.");
    return res.redirect("/student/register");
  }

  if (!/^\d{6}$/.test(otp)) {
    req.flash("error", "OTP must be a 6-digit number.");
    return res.redirect("/student/register");
  }

  if (password !== confirmPassword) {
    req.flash("error", "Passwords do not match.");
    return res.redirect("/student/register");
  }

  // Continue if valid
  next();
};
