require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("./config/passport");
const path = require("path");
const elasticsearchClient = require("./utils/elasticsearch");
const EmailService = require("./services/EmailService");

const app = express();

// Middleware
app.use(bodyParser.json());

// Configure express-session middleware
app.use(
  session({
    secret: "pQMAAqtunKoDz2+9c/t8gGUhh/SunQgeaQSOInQ5OX4=",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session()); // Used passport.session() middleware after session middleware

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Users Routes
const usersRoutes = require("../src/routes/userRoutes");
app.use("/api", usersRoutes);

// Email Routes
const emailRoutes = require("../src/routes/emailRoutes");
app.use("/api", emailRoutes);

// Auth Routes
const authRoutes = require("../src/routes/authRoutes");
app.use("/api", authRoutes);

app.get("/dashboard", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.redirect("/login");
    }

    const userId = req.user.id;
    const emails = await EmailService.getEmails(userId);

    res.render("dashboard", {
      userEmail: req.user.email,
      userEmails: emails,
    });
  } catch (error) {
    console.error("Error fetching emails:", error);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
});

// Logout route
app.post("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.clearCookie("connect.sid"); // Clear the session cookie
    res.redirect("/login");
  }); // Passport method to logout
});

// Fallback for any other routes
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Check Elasticsearch connection
elasticsearchClient
  .checkConnection()
  .then(() => {
    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to Elasticsearch:", error);
    process.exit(1);
  });

module.exports = app;
