const elasticsearch = require("../utils/elasticsearch");
const User = require("../models/User");

class UserService {
  static async createUser(user) {
    try {
      await elasticsearch.indexData("users", user);
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  static async getUserById(userId) {
    try {
      return await elasticsearch.getData("users", userId);
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  }

  static async updateUser(user) {
    try {
      await elasticsearch.updateData("users", user.id, user);
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  static async deleteUser(userId) {
    try {
      await elasticsearch.deleteData("users", userId);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }
}

module.exports = UserService;
