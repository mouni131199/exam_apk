function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  req.flash("error", "Please log in to continue.");
  return res.redirect("/auth/login");
}
function authorizeRole(...allowedRoles) {
  return (req, res, next) => {
    const user = req.session.user;

    if (!user) {
      req.flash("error", "Please log in to continue.");
      return res.redirect("/auth/login");
    }

    if (!allowedRoles.includes(user.role)) {
      // 🚫 Flash error but DON'T redirect to login
      req.flash("error", `Access denied: ${user.role} is not allowed to perform this action.`);
      return res.redirect("back"); // or redirect to a safe page like /exam/list
    }

    return next();
  };
}


module.exports = { ensureAuthenticated, authorizeRole };
