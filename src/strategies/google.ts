import {
  Strategy as GoogleStrategy,
  VerifyCallback,
} from "passport-google-oauth20";
import config from "../config";
import logger from "../utils/logger";

const initializeGoogleStrategy = (passport: any) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.google.clientId!,
        clientSecret: config.google.clientSecret!,
        callbackURL: config.google.redirectUri,
        scope: [
          "email",
          "profile",
          "https://www.googleapis.com/auth/gmail.readonly",
          "https://www.googleapis.com/auth/gmail.send",
          "https://www.googleapis.com/auth/gmail.modify",
        ],
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback
      ) => {
        try {
          const user = {
            accessToken,
            refreshToken,
            profile,
          };
          console.log("Google Auth Callback User:" + user.toString());
          done(null, user);
        } catch (error) {
          done(error, undefined);
        }
      }
    )
  );
  passport.serializeUser((user: any, done: any) => {
    console.log("Serializing user:" + user.toString());
    done(null, user);
  });
  passport.deserializeUser((user: any, done: any) => {
    console.log("deserializing user:" + user.toString());
    done(null, user);
  });
};

export default initializeGoogleStrategy;
