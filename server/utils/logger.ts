import winston from 'winston';
import path from 'path';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to log based on environment
const level = () => {
  const env = process.env['NODE_ENV'] || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define format for logs (used by file transports)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(
    (info) => {
      const timestamp = info['timestamp'];
      const level = info.level.toUpperCase().padEnd(5);
      const message = info.message;

      // Handle structured logging with additional fields
      if (info['sessionId'] || info['agent'] || info['productsCount']) {
        const meta = [];
        if (info['sessionId']) meta.push(`[${info['sessionId']}]`);
        if (info['agent']) meta.push(`<${info['agent']}>`);
        if (info['intent']) meta.push(`🎯${info['intent']}`);
        if (info['productsCount'] !== undefined) meta.push(`📦${info['productsCount']}`);
        if (info['responseLength'] !== undefined) meta.push(`💬${info['responseLength']}`);

        return `${timestamp} ${level} ${meta.join(' ')} ${message}`;
      }

      return `${timestamp} ${level} ${message}`;
    },
  ),
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      winston.format.timestamp({ format: 'HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.printf(
        (info) => {
          const timestamp = info['timestamp'];
          const level = info.level.toUpperCase().padEnd(5);
          const message = info.message;

          // Handle structured logging with additional fields
          if (info['sessionId'] || info['agent'] || info['productsCount']) {
            const meta = [];
            if (info['sessionId']) meta.push(`[${info['sessionId']}]`);
            if (info['agent']) meta.push(`<${info['agent']}>`);
            if (info['intent']) meta.push(`🎯${info['intent']}`);
            if (info['productsCount'] !== undefined) meta.push(`📦${info['productsCount']}`);
            if (info['responseLength'] !== undefined) meta.push(`💬${info['responseLength']}`);

            return `${timestamp} ${level} ${meta.join(' ')} ${message}`;
          }

          return `${timestamp} ${level} ${message}`;
        },
      ),
    ),
  }),

  // File transport for errors
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
    format: fileFormat,
  }),

  // File transport for all logs
  new winston.transports.File({
    filename: path.join('logs', 'combined.log'),
    format: fileFormat,
  }),
];

// Create the logger
export const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
});

// Create a stream object for Morgan
export const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};
