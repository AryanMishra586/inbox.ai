import { Queue } from "bullmq";
import axios from "axios";
import { connection } from "../db/redis";
import logger from "../utils/logger";
import GroqService from "./groq";
import User from "../types/user";

class OutlookService {
  private outlookClient: string;
  private emailQueue: Queue;
  private groqService: GroqService;
  private user: User;

  constructor(user: User, groqService: GroqService) {
    this.user = user;
    this.groqService = groqService;
    this.emailQueue = new Queue("emailQueue", { connection });
    this.outlookClient = `https://graph.microsoft.com/v1.0`;
    this.scheduleCheckUnreadEmails();
  }

  private async scheduleCheckUnreadEmails() {
    const jobId = `checkUnreadEmails:${this.user.id}`;
    await this.emailQueue.add(
      "checkUnreadOutlookEmails",
      { userId: this.user.id },
      {
        repeat: { every: 60000 },
        jobId,
      }
    );
    logger.info(
      `Scheduled 'checkUnreadOutlookEmails' job for user: ${this.user.id}`
    );
  }

  private async fetchAccessToken() {
    return this.user.accessToken;
  }

  async checkUnreadEmails() {
    try {
      const token = await this.fetchAccessToken();
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(`${this.outlookClient}/me/messages`, {
        headers,
        params: { filter: "isRead eq false" },
      });

      const messages = response.data.value || [];
      logger.info(`User ${this.user.id} has ${messages.length} unread emails.`);

      for (const message of messages) {
        await this.emailQueue.add("processOulookEmail", {
          userId: this.user.id,
          messageId: message.id,
        });
      }
    } catch (error) {
      logger.error(
        `Error checking unread emails for user ${this.user.id}: ${error}`
      );
      throw error;
    }
  }

  async getMessage(messageId: string) {
    try {
      const token = await this.fetchAccessToken();
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(
        `${this.outlookClient}/me/messages/${messageId}`,
        { headers }
      );
      const message = response.data;

      const subject = message.subject || "No Subject";
      const from = message.from?.emailAddress?.address || "";
      const to =
        message.toRecipients
          ?.map((rec: any) => rec.emailAddress.address)
          .join(", ") || "";
      const emailContent = message.body?.content || "";

      return { from, to, subject, emailContent };
    } catch (error) {
      logger.error(
        `Error fetching email data for messageId ${messageId}: ${error}`
      );
      throw error;
    }
  }

  private async assignCategoryToEmail(messageId: string, category: string) {
    try {
      const token = await this.fetchAccessToken();
      const headers = { Authorization: `Bearer ${token}` };

      await axios.patch(
        `${this.outlookClient}/me/messages/${messageId}`,
        { categories: [category] },
        { headers }
      );
      logger.info(`Category '${category}' assigned to email: ${messageId}`);
    } catch (error) {
      logger.error(`Error assigning category to email ${messageId}: ${error}`);
    }
  }

  async markAsRead(messageId: string): Promise<void> {
    try {
      const token = await this.fetchAccessToken();
      const headers = { Authorization: `Bearer ${token}` };

      await axios.patch(
        `${this.outlookClient}/me/messages/${messageId}`,
        { isRead: true },
        { headers }
      );
      logger.info(`Marked email ${messageId} as read for user ${this.user.id}`);
    } catch (error) {
      logger.error(
        `Error marking email as read for messageId ${messageId}: ${error}`
      );
    }
  }

  private createReplyMessage(
    from: string,
    to: string,
    subject: string,
    text: string
  ): any {
    return {
      message: {
        subject: `Re: ${subject}`,
        body: { contentType: "Text", content: text },
        toRecipients: [{ emailAddress: { address: from } }],
      },
      saveToSentItems: true,
    };
  }

  async sendReplyEmail(
    messageId: string,
    emailData: { from: string; to: string; subject: string; text: string }
  ) {
    try {
      const token = await this.fetchAccessToken();
      const headers = { Authorization: `Bearer ${token}` };

      const replyMessage = this.createReplyMessage(
        emailData.from,
        emailData.to,
        emailData.subject,
        emailData.text
      );

      await axios.post(
        `${this.outlookClient}/me/messages/${messageId}/reply`,
        replyMessage,
        { headers }
      );
      logger.info(`Reply sent to: ${emailData.from}, message ID: ${messageId}`);
    } catch (error) {
      logger.error(
        `Error sending reply email for messageId ${messageId}: ${error}`
      );
    }
  }

  async processIncomingEmail(messageId: string) {
    try {
      const emailData = await this.getMessage(messageId);
      const summary = await this.groqService.analyzeEmailContext(
        emailData.emailContent
      );
      logger.info(`Email summary: ${summary}`);

      const category = await this.groqService.categorizeEmailContent(
        emailData.emailContent
      );
      logger.info(`Email category: ${category}`);

      if (category) {
        await this.assignCategoryToEmail(messageId, category);
      } else {
        logger.warn(`No category found for email: ${messageId}`);
      }

      const reply = await this.groqService.generateEmailReply(
        emailData.emailContent
      );
      logger.info(`Email reply: ${reply}`);

      await this.sendReplyEmail(messageId, {
        from: emailData.from,
        to: emailData.to,
        subject: emailData.subject,
        text: reply,
      });

      await this.markAsRead(messageId);
      logger.info(
        `Email processed for messageId ${messageId}: Summary - ${summary}, Category - ${category}`
      );
    } catch (error) {
      logger.error(
        `Error processing email ${messageId} for user ${this.user.id}: ${error}`
      );
      throw error;
    }
  }
}

export default OutlookService;
