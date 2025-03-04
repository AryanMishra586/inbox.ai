import config from "./src/config";
import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "./src/strategies";
import logger from "./src/utils/logger";
import routes from "./src/routes";
import emailWorker from "./src/worker";

const server = express();
const router = express.Router();
const PORT = config.port;

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(
  session({
    secret: config.session!,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
server.use(passport.initialize());
server.use(passport.session());
routes(router);
server.use("", router);

server.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.info(err);

  let status = err.status || 500;
  let message = err.message || "Something failed!";

  res.status(status).json({
    status,
    message,
    data: {},
  });
});

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

emailWorker.on("ready", () => {
  logger.info("Email worker is ready and processing jobs.");
});
