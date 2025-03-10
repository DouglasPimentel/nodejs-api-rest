import dotenv from "dotenv";
import pino, { type Logger, type LoggerOptions } from "pino";

dotenv.config({ path: ".env.local" });

const options: LoggerOptions = {
  level:
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === "production" ? "info" : "debug"),
  transport:
    process.env.NODE_ENV !== "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,
  base: undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
};

const logger: Logger = pino(options);

export default logger;
