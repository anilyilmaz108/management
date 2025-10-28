import { Module } from '@nestjs/common';
import { QueueManagerService } from './queue-manager.service';
import { BullModule } from '@nestjs/bull';
import { MailModule } from '../mail/mail.module';
import { SmsModule } from '../sms/sms.module';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'email',
      },
      {
        name: 'sms',
      },
    ),
    MailModule,
    SmsModule
  ],
  providers: [QueueManagerService],
  exports: [QueueManagerService],
})
export class QueueManagerModule {}
