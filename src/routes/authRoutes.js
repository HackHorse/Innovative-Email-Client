const express = require('express');
const passport = require('../config/passport'); // Adjust path as needed
const AuthController = require('../controllers/AuthController');

const router = express.Router();

// Redirect user to Microsoft for authentication
router.get('/auth/microsoft', passport.authenticate('microsoft', { scope: ['offline_access', 'user.read', 'mail.read'] }));

// Handle Microsoft callback after successful authentication
router.get('/auth/microsoft/callback', passport.authenticate('microsoft', { failureRedirect: '/login' }), (req, res) => {
  console.log('Successful authentication:', req.user);
  // console.log("Session:", req.session); // Log session details for debugging

  // Render a simple page to set local storage
  res.send(`
    <script>
      localStorage.setItem('userEmail', '${req.user.email}');
      localStorage.setItem('userAccessToken', '${req.user.accessToken}');
      window.location.href = '/dashboard.html';
    </script>
  `);
});

// Optional: Get login URL
router.get('/login', AuthController.getLoginURL);

module.exports = router;