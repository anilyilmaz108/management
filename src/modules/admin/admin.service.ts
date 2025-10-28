import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/user/entity/user.entity';
import { RedisService } from 'src/common/redis/redis.service';
import { MailService } from 'src/queues/mail/mail.service';
import { SmsService } from 'src/queues/sms/sms.service';
import { SendBulkMailDto } from './dto/send-bulk-mail';
import { SendBulkSmsDto } from './dto/send-bulk-sms';
import { QueueManagerService } from 'src/queues/queue-manager/queue-manager.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  private readonly usersCacheKey = 'management:admin:users:emails';

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly redisService: RedisService,
    private readonly mailService: MailService,
    private readonly smsService: SmsService,
    private queueManager: QueueManagerService,
  ) {}

  private async fetchUsersEmails(useCache: boolean, limit?: number) {
    if (useCache) {
      const cached = await this.redisService.get<string[]>(this.usersCacheKey);
      if (cached && cached.length) {
        this.logger.log(`Using cached users list (${cached.length})`);
        return limit ? cached.slice(0, limit) : cached;
      }
    }

    const users = await this.userRepo.find({
      select: ['id', 'email'],
      where: { isActive: true },
    });
    const emails = users.map((u) => u.email).filter(Boolean);

    // store simplified list in cache (emails + phones combined structure could be stored depending needs)
    await this.redisService.set(this.usersCacheKey, emails);

    return limit ? emails.slice(0, limit) : emails;
  }

  async sendBulkMail(dto: SendBulkMailDto) {
    const targets = await this.fetchUsersEmails(
      dto.useCache ?? true,
      dto.limit,
    );
    if (!targets.length) {
      this.logger.warn('No target emails found for bulk mail');
      return { queued: 0 };
    }

    let queued = 0;
    for (const to of targets) {
      // enqueue demo mail job (MailService.enqueueMail or sendMail based on your implementation)
      await this.mailService.sendmail({
        subject: dto.subject,
        text: dto.message,
        to,
      });
      queued++;
    }

    this.logger.log(`Enqueued ${queued} mail jobs (bulk)`);
    return { queued };
  }

  private async fetchUsersPhones(useCache: boolean, limit?: number) {
    // read phone numbers from users; caching could be separate key
    const cacheKey = 'management:admin:users:phones';
    if (useCache) {
      const cached = await this.redisService.get<string[]>(cacheKey);
      if (cached && cached.length) {
        this.logger.log(`Using cached users phone list (${cached.length})`);
        return limit ? cached.slice(0, limit) : cached;
      }
    }

    const users = await this.userRepo.find({
      select: ['id', 'phone', 'email'],
      where: { isActive: true },
    });
    const phones = users.map((u) => u.phone).filter(Boolean);
    await this.redisService.set(cacheKey, phones);
    return limit ? phones.slice(0, limit) : phones;
  }

  private randomPhone(): string {
    // Demo random TR phone generator (not production-grade)
    const random = () =>
      Math.floor(1000000 + Math.random() * 9000000).toString();
    return `+90${Math.floor(500 + Math.random() * 499)}${random()}`;
  }

  async sendBulkSms(dto: SendBulkSmsDto) {
    const phones = dto.useRandomPhone
      ? Array.from({ length: dto.limit ?? 50 }).map(() => this.randomPhone())
      : await this.fetchUsersPhones(dto.useCache ?? true, dto.limit);

    if (!phones || phones.length === 0) {
      this.logger.warn('No target phones found for bulk sms');
      return { queued: 0 };
    }

    let queued = 0;
    for (const phone of phones) {
      await this.smsService.sendSms({
        phone,
        message: dto.message,
      });
      queued++;
    }

    this.logger.log(`Enqueued ${queued} SMS jobs (bulk)`);
    return { queued };
  }

  pauseQueue(queueName: string) {
    return this.queueManager.pause(queueName);
  }

  resumeQueue(queueName: string) {
    return this.queueManager.resume(queueName);
  }

  cleanQueue(queueName: string) {
    return this.queueManager.clean(queueName);
  }

  removeJob(queueName: string, jobId: string) {
    return this.queueManager.removeJob(queueName, jobId);
  }

  getQueueStats(queueName: string) {
    return this.queueManager.getStats(queueName);
  }

  getAllJobs(queueName: string) {
    return this.queueManager.getAllJobs(queueName);
  }
}
