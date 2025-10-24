import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { LogstashTransport } from 'winston-logstash-transport';

@Injectable()
export class WinstonLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [
        new winston.transports.Console({ level: 'info' }),
        new winston.transports.Console({ level: 'error' }),
        new winston.transports.Console({
          forceConsole: true,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            winston.format.colorize(),
            winston.format.printf(
              ({
                timestamp,
                level,
                message,
                context,
                ms,
              }: winston.Logform.TransformableInfo) => {
                return `${timestamp} [${level}] [${context}] ${message} ${ms}`;
              },
            ),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 31457280, // 30MB (30 * 1024 * 1024 bytes)
          maxFiles: 30,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
            winston.format.ms(),
          ),
        }),
        // Tüm loglar için dosya kaydı
        /**new winston.transports.File({
          filename: 'logs/all.log',
          maxsize: 31457280, // 30MB
          maxFiles: 30,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
            winston.format.ms(),
          ),
        }), */
        new LogstashTransport({
          host: process.env.LOGSTASH_HOST || 'logstash_management',
          port: Number(process.env.LOGSTASH_PORT) || 5044,
          appName: 'nest-management-api',
          mode: 'tcp',
        }),
      ],
    });
  }

  log(message: any, context?: string) {
    this.logger.info({ message, context, level: 'info' });
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error({ message, trace, context, level: 'error' });
  }

  warn(message: any, context?: string) {
    this.logger.warn({ message, context, level: 'warn' });
  }

  debug(message: any, context?: string) {
    this.logger.debug({ message, context, level: 'debug' });
  }

  verbose(message: any, context?: string) {
    this.logger.verbose({ message, context, level: 'verbose' });
  }
}
