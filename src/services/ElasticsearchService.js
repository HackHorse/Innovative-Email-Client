const elasticsearchClient = require("../utils/elasticsearch");
const Email = require("../models/Email");

class ElasticsearchService {
  static async indexUser(user) {
    try {
      console.log("Indexing user:", user);
      await elasticsearchClient.createIndex("users", {
        properties: {
          id: { type: "keyword" },
          email: { type: "keyword" },
          accessToken: { type: "text" },
          refreshToken: { type: "text" },
        },
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
