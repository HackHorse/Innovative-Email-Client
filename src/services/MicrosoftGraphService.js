const axios = require("axios");

class MicrosoftGraphService {
  constructor(clientId, clientSecret) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.accessToken = null;
    this.refreshToken = null;
  }

  async authenticate(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  async fetchEmails(skip = 0, top = 10) {
    try {
      if (!this.accessToken) {
        throw new Error("Access token not provided or expired");
      }

      const url = `https://graph.microsoft.com/v1.0/me/messages?$skip=${skip}&$top=${top}&$orderby=receivedDateTime desc`;
      const options = {
        method: "GET",
        url: url,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          Accept: "application/json",
        },
      };

      const response = await axios(options);
      return response.data.value;
    } catch (error) {
      console.error(
        "Error fetching emails:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  }

  async refreshAccessToken() {
    try {
      const tokenEndpoint =
        "https://login.microsoftonline.com/common/oauth2/v2.0/token";
      const response = await axios.post(tokenEndpoint, null, {
        params: {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: "refresh_token",
          refresh_token: this.refreshToken,
        },
      });

      this.accessToken = response.data.access_token;
      console.log("Refreshed access token:", this.accessToken);
    } catch (error) {
      console.error(
        "Error refreshing access token:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  }
}

module.exports = MicrosoftGraphService;
