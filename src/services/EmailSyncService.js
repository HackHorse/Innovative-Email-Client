require("dotenv").config();
const EmailService = require("../services/EmailService");
const MicrosoftGraphService = require("../services/MicrosoftGraphService");
const elasticsearch = require("../utils/elasticsearch");
const ElasticsearchService = require("../services/ElasticsearchService");

class EmailSyncService {
  static async syncUserEmails(user) {
    try {
      const msGraphService = new MicrosoftGraphService(
        process.env.OUTLOOK_CLIENT_ID,
        process.env.OUTLOOK_CLIENT_SECRET
      );

      // Authenticate using user's access token and refresh token
      await msGraphService.authenticate(user.accessToken, user.refreshToken);

      // Ensure email index exists or create it
      const indexName = `emails_${user.id}`;
      await elasticsearch.createIndex(indexName, {
        properties: {
          userId: { type: "keyword" },
          emailId: { type: "keyword" },
          subject: { type: "text" },
          sender: { type: "keyword" },
          receivedDateTime: { type: "date" },
          content: { type: "text" },
          hasAttachments: { type: "boolean" },
          importance: { type: "keyword" },
          isRead: { type: "boolean" },
        },
      });

      // Fetch last synced email ID from Elasticsearch
      const lastSyncedEmailId = await elasticsearch.getLastSyncedEmailId(user.id);

      // Fetch emails from Microsoft Graph API with pagination
      let emails = [];
      let nextLink = null;
      let hasMoreEmails = true;

      while (hasMoreEmails) {
        const response = await msGraphService.fetchEmails(nextLink);
        const fetchedEmails = response.value;

        // Filter out emails that have already been indexed
        const newEmails = lastSyncedEmailId
          ? fetchedEmails.filter((email) => new Date(email.receivedDateTime) > new Date(lastSyncedEmailId))
          : fetchedEmails;

        emails.push(...newEmails);

        // Check for pagination link
        nextLink = response['@odata.nextLink'];
        hasMoreEmails = nextLink != null;
      }

      // Sync new emails into Elasticsearch
      await EmailService.syncEmails(user, emails);

      // Update last synced email ID in Elasticsearch
      if (emails.length > 0) {
        const lastEmail = emails[emails.length - 1];
        await elasticsearch.setLastSyncedEmailId(user.id, lastEmail.receivedDateTime);
      }

      // Update mailbox details in Elasticsearch
      const mailboxDetails = {
        totalEmails: emails.length,
        lastSyncDate: new Date(),
      };
      await ElasticsearchService.indexMailboxDetails(user.id, mailboxDetails);

      return emails.length;
    } catch (error) {
      console.error("Error syncing emails:", error);
      throw error;
    }
  }

  static async monitorChanges(user) {
    try {
      const msGraphService = new MicrosoftGraphService(
        process.env.OUTLOOK_CLIENT_ID,
        process.env.OUTLOOK_CLIENT_SECRET
      );

      // Authenticate using user's access token and refresh token
      await msGraphService.authenticate(user.accessToken, user.refreshToken);

      // Monitor changes by fetching recent changes using Microsoft Graph API
      const changes = await msGraphService.fetchChanges();

      // Process changes and update local Elasticsearch data accordingly
      await EmailSyncService.processChanges(user, changes);
    } catch (error) {
      console.error("Error monitoring email changes:", error);
      throw error;
    }
  }

  static async processChanges(user, changes) {
    for (const change of changes) {
      if (change.operation === "deleted") {
        await EmailService.deleteEmail(user, change.emailId);
      } else if (change.operation === "updated") {
        await EmailService.updateEmail(user, change.email);
      } else if (change.operation === "added") {
        await EmailService.syncEmails(user, [change.email]);
      }
    }
  }
}

module.exports = EmailSyncService;