import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import type { Queue } from 'bull';

//producer
@Injectable()
export class SmsService {
  constructor(@InjectQueue('sms') private smsQueue: Queue) {}

  async sendSms(payload: { phone: string; message: string }) {
    return this.smsQueue.add('send', payload, {
      priority: 1,
      attempts: 3,
      jobId: `sms-${Date.now()}-${Math.floor(Math.random() * 10000)}-${payload.phone}`,
    });
  }
}
