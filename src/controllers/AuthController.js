const passport = require("../config/passport");

class AuthController {
  static callback(req, res) {
    // Successful authentication, redirect to frontend or dashboard
    res.redirect("/dashboard");
  }

  static getLoginURL(req, res) {
    const authUrl = `/auth/microsoft`;
    res.status(200).json({ authUrl });
  }
}

module.exports = AuthController;
