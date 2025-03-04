import { createLogger, format, transports } from "winston";

const { combine, printf } = format;

const logFormat = printf(({ level, message }) => {
  return `${new Date().toString()} ${level}: ${JSON.stringify(message)}`;
});

const logger = createLogger({
  format: combine(format.json(), logFormat),
  transports: [new transports.Console()],
});

export default logger;
