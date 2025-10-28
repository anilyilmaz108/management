import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import type { Queue } from 'bull';
export interface EmailJob {
  to: string;
  subject: string;
  text: string;
}
//producer
@Injectable()
export class MailService {
  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  async sendmail(emailData: EmailJob) {
    return this.emailQueue.add('send', emailData, {
      priority: 1,
      attempts: 3,
      jobId: `email-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      //   repeat:{
      //         cron:CronExpression.EVERY_WEEKEND,
      //         tz:'Europe/Istanbul'
      //   },
      // delay:5000 belirli bir zaman sonra bu işi yapsın
    });
  }

  async getPendinsJobs() {
    return this.emailQueue.getJobs(['waiting', 'active', 'delayed']);
  }

  async cleanQueue() {
    return this.emailQueue.clean(0, 'completed');
  }
}
