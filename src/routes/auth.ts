import { Router } from "express";
import { googleAuthCallback, outlookAuthCallback } from "../controllers/auth";
import passport from "../strategies";

export default (router: Router): void => {
  router.route("/auth/google").get(passport.authenticate("google"));

  router
    .route("/auth/google/callback")
    .get(
      passport.authenticate("google", { failureRedirect: "/" }),
      googleAuthCallback
    );

  router
    .route("/auth/outlook")
    .get(passport.authenticate("azuread-openidconnect"));

  router
    .route("/auth/outlook/callback")
    .get(
      passport.authenticate("outlook", { failureRedirect: "/" }),
      outlookAuthCallback
    );
};
