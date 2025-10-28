import { OnQueueCompleted, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';

@Processor('sms')
export class SmsConsumer {
  private readonly logger = new Logger(SmsConsumer.name);

  @Process('send')
  async handleSendSms(job: Job<string>) {
    this.logger.log(`Sms sending`, job.data);
    await new Promise((res) => setTimeout(res, 3000));
    this.logger.log('Sms sended', job.data, job.id, job.name);
  }
  @OnQueueCompleted()
  complete() {
    this.logger.log('Sms completed');
  }
}
