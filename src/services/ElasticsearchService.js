const elasticsearchClient = require("../utils/elasticsearch");
const Email = require("../models/Email");

class ElasticsearchService {
  static async indexUser(user) {
    try {
      console.log("Indexing user:", user);
      await elasticsearchClient.createIndex("users", {
        properties: {
          id: { type: 'keyword' },
          email: { type: 'keyword' },
          accessToken: { type: 'text' },
          refreshToken: { type: 'text' },
        }
      });

      const result = await elasticsearchClient.indexData("users", {
        id: user.id,
        email: user.email,
        accessToken: user.accessToken,
        refreshToken: user.refreshToken,
      });
      console.log("User indexed:", result);
      user.id = result._id; // Update the user object with the indexed id if it was generated
    } catch (error) {
      console.error("Error indexing user:", error);
      throw error;
    }
  }

  static async getUserById(userId) {
    try {
      if (!userId) {
        console.log("No userId provided to getUserById");
        return null;
      }

      console.log("Fetching user by id:", userId);
      const user = await elasticsearchClient.getData(
        "users",
        userId.toString()
      );
      if (user) {
        console.log("Fetched user:", user);
        return user;
      } else {
        console.log("User not found with id:", userId);
        return null;
      }
    } catch (error) {
      if (error.meta && error.meta.statusCode === 404) {
        console.log("User not found in Elasticsearch:", userId);
        return null;
      } else {
        console.error("Error getting user by id:", error);
        throw error;
      }
    }
  }

  static async indexEmail(userId, email) {
    try {
      await elasticsearchClient.createIndex(`emails_${userId}`, {
        properties: {
          userId: { type: 'keyword' },
          emailId: { type: 'keyword' },
          subject: { type: 'text' },
          sender: { type: 'keyword' },
          receivedDateTime: { type: 'date' },
          content: { type: 'text' },
          hasAttachments: { type: 'boolean' },
          importance: { type: 'keyword' },
          isRead: { type: 'boolean' },
        }
      });

      const emailData = new Email(
        userId,
        email.id,
        email.subject,
        email.sender.emailAddress.address,
        email.receivedDateTime,
        email.body.content,
        email.hasAttachments,
        email.importance,
        email.isRead,
      );

      await elasticsearchClient.indexData(`emails_${userId}`, emailData);
      console.log("Email indexed:", emailData);
    } catch (error) {
      console.error("Error indexing email:", error);
      throw error;
    }
  }


  static async updateEmail(userId, email) {
    try {
      const emailData = new Email(
        user.id,
        email.id,
        email.subject,
        email.sender.emailAddress.address,
        email.toRecipients
          .map((recipient) => recipient.emailAddress.address)
          .join(", "),
        email.receivedDateTime,
        email.body.content,
        email.hasAttachments,
        email.importance,
        email.isRead,
        email.internetMessageId,
        email.webLink
      );

      await elasticsearchClient.updateData(
        `emails_${userId}`,
        email.id,
        emailData
      );
      console.log("Email updated:", emailData);
    } catch (error) {
      console.error("Error updating email:", error);
      throw error;
    }
  }

  static async deleteEmail(userId, emailId) {
    try {
      await elasticsearchClient.deleteData(`emails_${userId}`, emailId);
      console.log("Email deleted:", emailId);
    } catch (error) {
      console.error("Error deleting email:", error);
      throw error;
    }
  }

  static async indexMailboxDetails(userId, mailboxDetails) {
    try {
      const { body } = await elasticsearchClient.indexData(
        `mailboxes_${userId}`,
        {
          id: "details",
          totalEmails: mailboxDetails.totalEmails,
          unreadCount: mailboxDetails.unreadCount,
          lastSyncDate: mailboxDetails.lastSyncDate,
        }
      );
      console.log("Mailbox details indexed:", body);
    } catch (error) {
      console.error("Error indexing mailbox details:", error);
      throw error;
    }
  }
}

module.exports = ElasticsearchService;
