import pino from 'pino';

// Create a Pino logger instance
// In production, logs are output as structured JSON.
// In development, `pino-pretty` formats them for readability if available.
export const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    ...(process.env.NODE_ENV !== 'production' && {
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                ignore: 'pid,hostname',
                translateTime: 'SYS:standard',
            }
        }
    })
});
