import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import pino from 'pino';
import { pinoHttp } from 'pino-http';

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: isDevelopment ? 'debug' : 'info',

  redact: {
    paths: [
      'req.headers.authorization',
      'body.password',
      'body.token',
      'password',
      'token',
    ],
    censor: '[REDACTED]',
  },
});

export const httpLogger = pinoHttp({
  logger,

  genReqId: (_req: IncomingMessage, res: ServerResponse) => {
    const requestId = randomUUID();
    res.setHeader('X-Request-ID', requestId);
    return requestId;
  },

  customLogLevel: (_req: IncomingMessage, res: ServerResponse, err?: Error) => {
    if (err || res.statusCode >= 500) {
      return 'error';
    }

    if (res.statusCode >= 400) {
      return 'warn';
    }

    return 'info';
  },
});
