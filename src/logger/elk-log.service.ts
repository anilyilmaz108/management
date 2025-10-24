import { Injectable } from '@nestjs/common';
import { createConnection } from 'net';
export enum LOGLEVELS {
  INFO = 'INFO',
  ERROR = 'ERROR',
  WARN = 'WARN',
  DEBUG = 'DEBUG',
  VERBOSE = 'VERBOSE',
}
@Injectable()
export class ElkLogService {
  private readonly host = 'localhost';
  private readonly port = 5044;

  log(message: string, context: string, level: LOGLEVELS) {
    const client = createConnection(
      { host: this.host, port: this.port },

      () => {
        const logData = JSON.stringify({
          timestamp: new Date().toISOString(),
          level: level,
          message,
          context,
        });
        client.write(logData);
        client.end();
      },
    );

    client.on('error', (err) => {
      console.log('log error', err);
    });
  }
}
