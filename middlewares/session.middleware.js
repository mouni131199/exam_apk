const session = require("express-session");
const flash = require("connect-flash");

module.exports = function (app) {
  app.use(session({
    secret: process.env.SESSION_SECRET || "default-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60, // 1 hour
      httpOnly: true,
      secure: false,
    },
  }));

  app.use(flash());
};
