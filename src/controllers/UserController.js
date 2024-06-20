// src/controllers/UserController.js
const User = require('../models/User');
const ElasticsearchService = require('../services/ElasticsearchService');
const passport = require('../config/passport');

class UserController {
  static async createUser(req, res) {
    const { localId, email } = req.body;

    try {
      // Generate OAuth URL for Outlook login
      const authUrl = '/api/auth/outlook'; // Replace with actual OAuth endpoint

      // Return the OAuth URL for the frontend to redirect
      res.status(200).json({ authUrl });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  }

  static async handleOAuthCallback(req, res) {
    try {
      // Handle successful OAuth callback
      const { id, email, accessToken, refreshToken } = req.user; // Assuming these are available from Passport

      // Save user details and tokens securely
      const user = new User(id, email, accessToken, refreshToken);
      await user.save();

      // Redirect to frontend or callback URL
      res.redirect('/'); // Redirect to home or callback URL
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
      res.status(500).json({ error: 'Failed to handle OAuth callback' });
    }
  }
}

module.exports = UserController;