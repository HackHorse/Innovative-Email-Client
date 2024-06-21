require("dotenv").config();
const passport = require("passport");
const MicrosoftStrategy = require("passport-microsoft").Strategy;
const ElasticsearchService = require("../services/ElasticsearchService");
const EmailSyncService = require("../services/EmailSyncService");
const EmailService = require("../services/EmailService");
const User = require("../models/User");

passport.use(
  new MicrosoftStrategy(
    {
      clientID: process.env.OUTLOOK_CLIENT_ID,
      clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
      callbackURL: process.env.OUTLOOK_CALLBACK_URL,
      scope: ["offline_access", "user.read", "mail.read"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await ElasticsearchService.getUserById(profile.id);

        if (!user) {
          // Create a new user and index them
          user = new User(
            profile.id,
            profile.emails[0].value,
            accessToken,
            refreshToken
          );
          await ElasticsearchService.indexUser(user);
          console.log("Created and indexed new user:", user);
        } else {
          // Update access tokens if necessary
          if (
            user.accessToken !== accessToken ||
            user.refreshToken !== refreshToken
          ) {
            user.accessToken = accessToken;
            user.refreshToken = refreshToken;
            await ElasticsearchService.indexUser(user);
            await EmailSyncService.syncUserEmails(user);
            console.log("Updated tokens for existing user:", user);
          } else {
            console.log(
              "User tokens are already up-to-date. Skipping email sync."
            );
          }
        }

        done(null, user);
      } catch (error) {
        console.error("Error during authentication:", error);
        done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const userData = await ElasticsearchService.getUserById(id);
    if (userData) {
      const user = new User(
        userData.id,
        userData.email,
        userData.accessToken,
        userData.refreshToken
      );
      // const emails = await EmailService.getEmails(user.id);
      // user.email = emails;
      done(null, user);
    } else {
      done(null, null);
    }
  } catch (error) {
    console.error("Error deserializing user:", error);
    done(error);
  }
});

module.exports = passport;
