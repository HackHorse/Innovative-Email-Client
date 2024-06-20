const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const EmailController = require('../controllers/EmailController');
const authenticate = require('../config/emailAuth');
const EmailService = require('../services/EmailService');
const EmailSyncService = require('../services/EmailSyncService');

// // Route to sync emails
// router.post('/emails/sync', EmailController.syncEmails);

// POST /api/sync - Sync emails for the authenticated user
router.post('emails/sync', async (req, res) => {
    try {
      // Assuming you have middleware to verify and decode JWT token
      const userId = req.user.id; // Extract user ID from authenticated request
  
      // Fetch user details (accessToken, refreshToken) from your database or session storage
      const user = await getUserById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Sync user emails
      const syncedEmailCount = await EmailSyncService.syncUserEmails(user);
  
      res.status(200).json({ message: `Synced ${syncedEmailCount} emails` });
    } catch (error) {
      console.error('Error syncing emails:', error);
      res.status(500).json({ message: 'Failed to sync emails' });
    }
  });

// Route to fetch emails for a user
router.get('/emails',authenticate, async (req, res) => {
    try {
      const userId = req.user.id;
      const emails = await EmailService.getEmails(userId);
      res.json(emails);
    } catch (error) {
      console.error('Error fetching emails:', error);
      res.status(500).json({ error: 'Failed to fetch emails' });
    }
  });

// Route to update an email
router.put('/emails/update', authenticate, EmailController.updateEmail);

// Route to delete an email
router.delete('/emails/:userId/:emailId', authenticate, EmailController.deleteEmail);

module.exports = router;