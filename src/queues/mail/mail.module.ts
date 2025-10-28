import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailConsumer } from './mail.consumer';
import { SmsModule } from '../sms/sms.module';


@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'email',
        //1sn max 5 iş yapabilirsin
        //   limiter:{
        //     max:5,
        //     duration:1000
        //   },
        defaultJobOptions: {
          priority: 2,
          attempts: 6,
          backoff: {
            delay: 1000,
            type: 'exponential',
          },
        },
      },
    ),
    SmsModule
  ],
  providers: [MailService, MailConsumer],
  exports: [MailService],
})
export class MailModule {}
