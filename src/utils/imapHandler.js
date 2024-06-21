// utils/imapHandler.js
const Imap = require("imap");

class IMAPHelper {
  constructor() {
    this.imap = new Imap({
      host: "outlook.office365.com",
      port: 993,
      tls: true,
    });
  }

  async fetchEmails(userEmail, accessToken) {
    return new Promise((resolve, reject) => {
      this.imap.once("ready", () => {
        this.imap.openBox("INBOX", true, (err, box) => {
          if (err) return reject(err);
          this.imap.search(["ALL"], (err, results) => {
            if (err) return reject(err);
            const fetch = this.imap.fetch(results, { bodies: "" });
            const emails = [];

            fetch.on("message", (msg) => {
              let email = {};
              msg.on("body", (stream, info) => {
                let buffer = "";
                stream.on("data", (chunk) => {
                  buffer += chunk.toString("utf8");
                });
                stream.once("end", () => {
                  email.body = buffer;
                });
              });
              msg.once("attributes", (attrs) => {
                email.id = attrs.uid;
                email.subject = attrs.envelope.subject;
                email.sender = attrs.envelope.from[0].address;
                // Add more attributes as needed
                emails.push(email);
              });
            });

            fetch.once("end", () => {
              this.imap.end();
              resolve(emails);
            });
          });
        });
      });

      this.imap.once("error", (err) => {
        reject(err);
      });

      this.imap.connect();
    });
  }
}

module.exports = new IMAPHelper();
