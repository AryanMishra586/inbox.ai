import { Worker, Job, Queue } from "bullmq";
import logger from "../utils/logger";
import GroqService from "../services/groq";
import EmailService from "../services/email";
import redisClient, { connection } from "../db/redis";
import User from "../types/user";
import userStore from "../utils/userStore";
import OutlookService from "../services/outlook";

const groqService = new GroqService();
const emailQueue = new Queue("emailQueue", { connection });

const emailWorker = new Worker(
  "emailQueue",
  async (job: Job) => {
    const { userId, messageId } = job.data;
    const user: User | null = await userStore.getUser(userId);

    if (!user) {
      logger.error(`User with ID ${userId} not found.`);
      return;
    }

    const emailService = new EmailService(user, groqService);
    const outlookServices = new OutlookService(user, groqService);

    switch (job.name) {
      case "checkUnreadEmails":
        try {
          await emailService.checkUnreadEmails();
        } catch (error) {
          logger.error(
            `Error checking unread emails for user ${userId}:`,
            error
          );
        }
        break;

      case "checkUnreadOutlookEmails":
        try {
          await outlookServices.checkUnreadEmails();
        } catch (error) {
          logger.error(
            `Error checking unread emails for user ${userId}:`,
            error
          );
        }
        break;

      case "processEmail":
        if (!messageId) {
          logger.error("No messageId provided for processEmail job.");
          return;
        }
        try {
          logger.info(`Processing email: ${messageId} for user: ${userId}`);
          const emailData = await emailService.getEmailData(messageId);
          if (emailData) {
            await emailService.processIncomingEmail(messageId, emailData);
          }
        } catch (error) {
          logger.error(
            `Error processing email ${messageId} for user ${userId}:`,
            error
          );
        }
        break;

      case "processOutlookEmail":
        if (!messageId) {
          logger.error("No messageId provided for processEmail job.");
          return;
        }
        try {
          logger.info(`Processing email: ${messageId} for user: ${userId}`);
          const emailData = await outlookServices.getMessage(messageId);
          if (emailData) {
            await emailService.processIncomingEmail(messageId, emailData);
          }
        } catch (error) {
          logger.error(
            `Error processing email ${messageId} for user ${userId}:`,
            error
          );
        }
        break;

      default:
        logger.warn(`Unknown job name: ${job.name}`);
    }
  },
  {
    connection,
    concurrency: 5,
  }
);

emailWorker.on("failed", (job, err) => {
  logger.error(`Job ${job?.id} of type ${job?.name} failed: ${err.message}`);
});

emailWorker.on("completed", (job) => {
  logger.info(`Job ${job.id} of type ${job.name} has completed.`);
});

export default emailWorker;
