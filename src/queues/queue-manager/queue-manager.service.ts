import { InjectQueue } from '@nestjs/bull';
import { Injectable, NotFoundException } from '@nestjs/common';
import type { Queue } from 'bull';

@Injectable()
export class QueueManagerService {
  constructor(
    @InjectQueue('email') private emailQueue: Queue,
    @InjectQueue('sms') private smsQueue: Queue,
  ) {}

  private getQueue(qname: string) {
    if (qname === 'email') return this.emailQueue;
    if (qname === 'sms') return this.smsQueue;
    throw new NotFoundException(`Unknown queue: ${qname}`);
  }

  async pause(qname: string) {
    await this.getQueue(qname).pause();
    return { message: `${qname} queue paused` };
  }

  async resume(qname: string) {
    await this.getQueue(qname).resume();
    return { message: `${qname} queue resumed` };
  }

  async clean(qname: string) {
    await this.getQueue(qname).clean(0, 'completed');
    await this.getQueue(qname).clean(0, 'failed');
    return { message: `${qname} queue cleaned` };
  }

  async removeJob(qname: string, jobId: string) {
    const job = await this.getQueue(qname).getJob(jobId);
    if (!job) throw new NotFoundException('Job not found');
    await job.remove();
    return { success: true };
  }

  async getStats(qname: string) {
    const queue = this.getQueue(qname);
    return {
      waiting: await queue.getWaitingCount(),
      active: await queue.getActiveCount(),
      delayed: await queue.getDelayedCount(),
      completed: await queue.getCompletedCount(),
      failed: await queue.getFailedCount(),
    };
  }

  async getAllJobs(qname: string) {
    const queue = this.getQueue(qname);
    return queue.getJobs([
      'waiting',
      'active',
      'delayed',
      'completed',
      'paused',
      'failed',
    ]);
  }
}
