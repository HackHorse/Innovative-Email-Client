// src/utils/elasticsearch.js
const { Client } = require("@elastic/elasticsearch");
const config = require("../config/config");

class ElasticsearchClient {
  constructor() {
    this.client = new Client({ node: config.elasticsearch.url });
  }

  async createIndex(indexName, mappings) {
    try {
      const exists = await this.client.indices.exists({ index: indexName });
      if (!exists) {
        await this.client.indices.create({
          index: indexName,
          body: { mappings },
        });
        console.log(`Created index ${indexName}`);
      } else {
        console.log(`Index ${indexName} already exists`);
      }
    } catch (error) {
      console.error("Error creating index:", error);
      throw error;
    }
  }

  async indexData(indexName, data) {
    console.log("Indexing data:", data);
    try {
      const response = await this.client.index({
        index: indexName,
        id: data.id,
        body: data,
      });
      console.log("Indexed data:", response);
      return response;
    } catch (error) {
      console.error("Error indexing data:", error);
      throw error;
    }
  }

  async search(indexName, query) {
    return this.client.search({
      index: indexName,
      query: query,
    });
  }

  async updateData(indexName, id, data) {
    try {
      const response = await this.client.update({
        index: indexName,
        id,
        body: { doc: data },
      });
      console.log("Updated data:", response);
      return response;
    } catch (error) {
      console.error("Error updating data:", error);
      throw error;
    }
  }

  async getLastSyncedEmailId(userId) {
    const result = await this.client.search({
      index: `emails_${userId}`,
      body: {
        sort: [{ receivedDateTime: { order: "desc" } }],
        size: 1,
        _source: ["emailId"],
      },
    });

    return result.hits.hits.length > 0
      ? result.hits.hits[0]._source.emailId
      : null;
  }

  async setLastSyncedEmailId(userId, emailId) {
    const indexName = `emails_${userId}_meta`;
    await this.client.index({
      index: indexName,
      id: "lastSyncedEmailId",
      body: { emailId },
    });
  }

  async checkConnection() {
    try {
      const result = await this.client.ping();
      console.log("Elasticsearch connection established:", result);
      return true;
    } catch (error) {
      console.error("Elasticsearch connection failed:", error);
      return false;
    }
  }

  async getData(indexName, id) {
    try {
      const result = await this.client.get({
        index: indexName,
        id: id,
      });

      if (!result) {
        console.log(`Document not found for id: ${id}`);
        return null;
      }

      const { _index, _id, _source } = result;
      console.log(`Retrieved document: ${_index}/${_id}`, _source);

      return _source; // Return the _source of the document
    } catch (error) {
      if (error.meta && error.meta.statusCode === 404) {
        console.log(`Document not found for id: ${id}`);
        return null;
      }
      console.error("Error getting data from Elasticsearch:", error);
      throw error;
    }
  }
}

const elasticsearchClient = new ElasticsearchClient();
module.exports = elasticsearchClient;
