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

        new LogstashTransport({
          host: process.env.LOGSTASH_HOST,
          port: Number(process.env.LOGSTASH_PORT),
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
