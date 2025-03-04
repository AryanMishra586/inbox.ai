import Groq from "groq-sdk";
import config from "../config";

class GroqService {
  private groq: Groq;

  constructor() {
    this.groq = new Groq({
      apiKey: config.groq.apiKey,
    });
  }

  async analyzeEmailContext(emailContent: string): Promise<string> {
    try {
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "Analyze the following email and give a summary.",
          },
          { role: "user", content: emailContent },
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 1,
        max_completion_tokens: 150,
        top_p: 1,
        stream: false,
        stop: null,
      });

      return chatCompletion.choices?.[0]?.message?.content?.trim() || "";
    } catch (error) {
      console.error("Error analyzing email context:", error);
      throw error;
    }
  }

  async categorizeEmailContent(emailContent: string): Promise<string> {
    try {
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "Categorize this email content into one of the following categories: Interested, Not interested, More information. Please answer using only these exact words.",
          },
          { role: "user", content: emailContent },
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 1,
        max_completion_tokens: 20,
        top_p: 1,
        stream: false,
        stop: null,
      });

      return chatCompletion.choices?.[0]?.message?.content?.trim() || "";
    } catch (error) {
      console.error("Error categorizing email content:", error);
      throw error;
    }
  }

  async generateEmailReply(emailContent: string): Promise<string> {
    try {
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "Generate an appropriate reply for the following email content. If the recipient's name is provided, use it; otherwise, do not include a placeholder for the name. Return only the reply message.",
          },
          { role: "user", content: emailContent },
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 1,
        max_completion_tokens: 150,
        top_p: 1,
        stream: false,
        stop: null,
      });

      return chatCompletion.choices?.[0]?.message?.content?.trim() || "";
    } catch (error) {
      console.error("Error generating email reply:", error);
      throw error;
    }
  }
}

export default GroqService;
