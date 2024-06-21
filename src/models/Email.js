// src/models/Email.js // Email class for Emails functions
class Email {
  constructor(
    userId,
    emailId,
    subject,
    sender,
    receivedDateTime,
    content,
    hasAttachments,
    importance,
    isRead
  ) {
    this.userId = userId;
    this.emailId = emailId;
    this.subject = subject;
    this.sender = sender;
    this.receivedDateTime = receivedDateTime;
    this.content = content;
    this.hasAttachments = hasAttachments;
    this.importance = importance;
    this.isRead = isRead;
  }
}

module.exports = Email;
