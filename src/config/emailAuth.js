const authenticate = (req, res, next) => {
    console.log("Session:", req.session); // Logging session during debugging
    console.log("User:", req.user); // Logging user during debugging
  
    if (req.isAuthenticated()) {
      return next();
    } else {
      console.log("Unauthorized access attempt:", req.originalUrl); // Log unauthorized access attempt
      return res.status(401).json({ error: "Unauthorized" });
    }
  };
  
  module.exports = authenticate;