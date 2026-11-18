import 'dotenv/config';

import app from './app.js';
import { logger } from './infrastructure/logger.js';

const port = Number(process.env.PORT ?? 3000);
const nodeEnv = process.env.NODE_ENV ?? 'development';

const server = app.listen(port, () => {
  logger.info(`Server running on port ${port} in ${nodeEnv} mode`);
});

let isShuttingDown = false;

const gracefulShutdown = (signal: string): void => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  server.close((err?: Error) => {
    if (err) {
      logger.error({ err }, 'Error while closing HTTP server');
      process.exitCode = 1;
      return;
    }

    logger.info('HTTP server closed.');
    process.exitCode = 0;
  });

  const forceShutdownTimer = setTimeout(() => {
    logger.error('Forceful shutdown executed due to timeout');
    process.exit(1);
  }, 10_000);
  forceShutdownTimer.unref();
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('unhandledRejection', (err: unknown) => {
  logger.error({ err }, 'Unhandled Rejection');
  gracefulShutdown('unhandledRejection');
});

process.on('uncaughtException', (err: unknown) => {
  logger.error({ err }, 'Uncaught Exception');
  process.exit(1);
});
