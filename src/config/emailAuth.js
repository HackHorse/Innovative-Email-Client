const authenticate = (req, res, next) => {
    console.log("Session:", req.session); // Log session details for debugging
    console.log("User:", req.user); // Log user details for debugging
  
    if (req.isAuthenticated()) {
      return next();
    } else {
      console.log("Unauthorized access attempt:", req.originalUrl); // Log unauthorized access attempt
      return res.status(401).json({ error: "Unauthorized" });
    }
  };
  
  module.exports = authenticate;