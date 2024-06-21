const EmailSyncService = require("../services/EmailSyncService");
const EmailService = require("../services/EmailService");
const ElasticsearchService = require("../services/ElasticsearchService");

class EmailController {
  static async syncEmails(req, res) {
    try {
      const user = req.user; // Assuming user object is available after OAuth authentication
      const emailsSynced = await EmailSyncService.syncUserEmails(user);
      res
        .status(200)
        .json({ message: `Synced ${emailsSynced} emails successfully` });
    } catch (error) {
      console.error("Error syncing emails:", error);
      res.status(500).json({ error: "Failed to sync emails" });
    }
  }

  static async getEmails(req, res) {
    try {
      const userId = req.user.id;
      const emails = await EmailService.getEmails(userId);
      res.json(emails);
    } catch (error) {
      console.error("Error fetching emails:", error);
      res.status(500).json({ error: "Failed to fetch emails" });
    }
  }

  static async updateEmail(req, res) {
    try {
      const { userId, email } = req.body;
      await ElasticsearchService.updateEmail(userId, email);
      res.status(200).json({ message: "Email updated successfully" });
    } catch (error) {
      console.error("Error updating email:", error);
      res.status(500).json({ error: "Failed to update email" });
    }
  }

  static async deleteEmail(req, res) {
    try {
      const { userId, emailId } = req.params;
      await ElasticsearchService.deleteEmail(userId, emailId);
      res.status(200).json({ message: "Email deleted successfully" });
    } catch (error) {
      console.error("Error deleting email:", error);
      res.status(500).json({ error: "Failed to delete email" });
    }
  }
}

module.exports = EmailController;
