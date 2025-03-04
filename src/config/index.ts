import "dotenv/config";

export const config = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri:
      process.env.GOOGLE_REDIRECT_URI ||
      "http://localhost:3000/auth/google/callback",
    scope: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.send",
    ],
  },
  outlook: {
    clientId: process.env.OUTLOOK_CLIENT_ID,
    clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
    redirectUri:
      process.env.OUTLOOK_REDIRECT_URI ||
      "http://localhost:3000/auth/outlook/callback",
    scope: [
      "openid",
      "offline_access",
      "https://outlook.office.com/Mail.Read",
      "https://outlook.office.com/Mail.Send",
    ],
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY,
  },
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT || "6379"),
  },
  port: Number(process.env.PORT || "3000"),
  session: process.env.SESSION_SECRET,
};

export default config;
