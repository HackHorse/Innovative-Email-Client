// src/config/config.js
require('dotenv').config();

module.exports = {
  elasticsearch: {
    url: process.env.ELASTICSEARCH_URL,
  },
  outlook: {
    clientID: process.env.OUTLOOK_CLIENT_ID,
    clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
    callbackURL: process.env.OUTLOOK_CALLBACK_URL,
  },
};