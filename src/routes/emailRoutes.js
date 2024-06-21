const express = require("express");
const router = express.Router();
const authenticate = require("../config/emailAuth");
const EmailService = require("../services/EmailService");
const EmailSyncService = require("../services/EmailSyncService");
const ElasticsearchService = require("../services/ElasticsearchService");
const elasticsearch = require("../utils/elasticsearch");



// POST /api/emails/sync - Sync emails for the authenticated user
router.post("/emails/sync", authenticate, async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from authenticated request

    // Fetch user details (accessToken, refreshToken) using getUserById function
    const user = await ElasticsearchService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let { skip, top } = req.body; // Get skip and top values from request body

    // If skip and top are not provided, default to fetching next 10 emails
    skip = skip || 0;
    top = top || 10;

    // Log user ID and pagination parameters
    console.log(`Syncing emails for user ID: ${userId}, skip: ${skip}, top: ${top}`);

    // Sync user emails with pagination using EmailSyncService
    const syncedEmailCount = await EmailSyncService.syncUserEmails(user, skip, top);

    res.status(200).json({ message: `Synced ${syncedEmailCount} emails` });
  } catch (error) {
    console.error("Error syncing emails:", error);
    res.status(500).json({ message: "Failed to sync emails" });
  }
});

// Route to fetch emails for a user
router.get("/emails", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    // Calculate skip value based on page and limit
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const top = parseInt(limit);

    // Log user ID and pagination parameters
    console.log(`Fetching emails for user ID: ${userId}, skip: ${skip}, top: ${top}`);

    // Fetch emails with pagination using EmailService
    const { emails, hasNextPage } = await EmailService.getEmails(userId, skip, top);

    // Construct next page link if there are more emails
    const nextLink = hasNextPage ? `/api/emails?page=${parseInt(page) + 1}&limit=${limit}` : null;

    res.json({ emails, nextLink });
  } catch (error) {
    console.error("Error fetching emails:", error);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
});


module.exports = router;