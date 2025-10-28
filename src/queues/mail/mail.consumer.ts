import {
  OnQueueActive,
  OnQueueCleaned,
  OnQueueCompleted,
  OnQueueDrained,
  OnQueueError,
  OnQueueFailed,
  OnQueuePaused,
  OnQueueProgress,
  OnQueueRemoved,
  OnQueueResumed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { EmailJob, MailService } from './mail.service';

@Processor('email')
export class MailConsumer {
  private readonly logger = new Logger(MailConsumer.name);
  constructor(private mailService: MailService) {}

  @Process({ name: 'send' }) //concurrency: 5
  async handleSendEmail(job: Job<EmailJob>) {
    // this.logger.warn(`Eposta gönderme işi başladı`, job.id);
    // this.logger.warn('veri', JSON.stringify(job.data));
    return 'Email sended';
  }

  @OnQueueActive()
  onActive(job: Job) {
    // this.logger.warn('işlenmeye başladı', job.id, job.name);
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    // this.logger.warn('iş tamamlandı', job.id, job.name);
    // this.mailService.cleanQueue()
  }

  @OnQueueFailed()
  onFailed(job: Job, err) {
    //db kayıt et elk kullan
    // this.logger.warn('iş bitemedi', job.id, job.name);
    // this.logger.warn(err.message);
  }
  @OnQueueError()
  onError(error: Error) {
    // this.logger.error(`hata`, error.message);
  }
  @OnQueueProgress()
  onprogress() {}
  @OnQueuePaused()
  onpause() {}
  @OnQueueResumed()
  resume() {}

  @OnQueueCleaned()
  onClean(jobs: Job[], type: string) {
    // this.logger.debug(
    //   `kuyruk temizlendi ${jobs.length} ${type} işi kaldırıldı`,
    // );
  }

  @OnQueueDrained()
  ondrained() {}

  @OnQueueRemoved()
  onRemoved(job: Job) {
    // this.logger.debug(`iş kaldırıldı ${job.id}`);
  }
}
