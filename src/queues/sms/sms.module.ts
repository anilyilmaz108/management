import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { SmsService } from '../sms/sms.service';
import { SmsConsumer } from '../sms/sms.consumer';


@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'sms',
        defaultJobOptions: {
          priority: 1,
          attempts: 5,
        },
      },
    ),
  ],
  providers: [SmsService, SmsConsumer],
  exports: [SmsService],
})
export class SmsModule {}
