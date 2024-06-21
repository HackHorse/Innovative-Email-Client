const elasticsearch = require("../utils/elasticsearch");

class EmailService {
  static async syncEmails(user, emails) {
    try {
      const indexName = `emails_${user.id}`;

      // Ensure index exists or create it
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

      // Fetch existing emails from Elasticsearch
      const existingEmailsResponse = await elasticsearch.search(indexName, {
        match_all: {},
      });
      const existingEmailIds = existingEmailsResponse.hits.hits.map(
        (hit) => hit._source.emailId
      );

      // Filter out emails that are already indexed
      const newEmails = emails.filter(
        (email) => !existingEmailIds.includes(email.id)
      );

      for (const email of newEmails) {
        const emailData = {
          userId: user.id,
          emailId: email.id,
          subject: email.subject,
          sender: email.sender?.emailAddress?.address || "Unknown",
          receivedDateTime: email.receivedDateTime,
          content: email.body?.content || "",
          hasAttachments: email.hasAttachments || false,
          importance: email.importance || "normal",
          isRead: email.isRead || false,
        };

        await elasticsearch.indexData(indexName, emailData);
        console.log(`Indexed email ${email.id} for user ${user.id}`);
      }

      console.log(`Synced ${newEmails.length} emails for user ${user.id}`);
    } catch (error) {
      console.error("Error syncing emails:", error);
      throw error;
    }
  }

  static async getEmails(userId) {
    try {
      const result = await elasticsearch.search(`emails_${userId}`, {
        match_all: {},
      });
      return result.hits.hits.map((hit) => hit._source);
    } catch (error) {
      console.error("Error fetching emails:", error);
      throw error;
    }
  }
}

module.exports = EmailService;