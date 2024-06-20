// src/models/User.js
const ElasticsearchService = require('../services/ElasticsearchService');

class User {
    constructor(id, email, accessToken, refreshToken) {
        this.id = id;
        this.email = email;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }

    async save() {
        try {
            await ElasticsearchService.indexUser(this);
            console.log('User saved successfully:', this);
        } catch (error) {
            console.error('Error saving user:', error);
            throw error;
        }
    }
}

module.exports = User;
