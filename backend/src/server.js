import https from "https";
import fs from "fs";
import app from "./app.js";
import { connect } from "./config/database.js";
import env from "./config/env.js";
import logger from "./utils/logger.js";
import mongoose from "mongoose";

let server;

const startServer = async () => {
  try {
    await connect();
    
    const hasSSL = env.HTTPS_KEY_PATH && env.HTTPS_CERT_PATH &&
                   fs.existsSync(env.HTTPS_KEY_PATH) && fs.existsSync(env.HTTPS_CERT_PATH);

    if (hasSSL) {
      const options = {
        key: fs.readFileSync(env.HTTPS_KEY_PATH),
        cert: fs.readFileSync(env.HTTPS_CERT_PATH),
      };
      server = https.createServer(options, app).listen(env.PORT, () => {
        logger.info(`🚀 Secure Server running on https://localhost:${env.PORT} in ${env.NODE_ENV} mode`);
      });
    } else {
      server = app.listen(env.PORT, () => {
        logger.info(`🚀 Server running on http://localhost:${env.PORT} in ${env.NODE_ENV} mode`);
      });
    }
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  if (server) {
    server.close(() => {
      logger.info("HTTP server closed.");
      mongoose.connection.close(false).then(() => {
        logger.info("MongoDB connection closed.");
        process.exit(0);
      }).catch((err) => {
        logger.error(`Error closing MongoDB connection: ${err.message}`);
        process.exit(1);
      });
    });

    // Force exit after 10 seconds
    setTimeout(() => {
      logger.error("Forced shutdown: connections did not close in time.");
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

process.on("uncaughtException", (error) => {
  logger.error(`Uncaught Exception: ${error.message}`, { stack: error.stack });
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error(`Unhandled Rejection: ${reason.message || reason}`, { stack: reason.stack });
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

startServer();
