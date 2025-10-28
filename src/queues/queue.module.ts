import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'email' },
      { name: 'sms' },
    ),
  ],
  exports: [
    BullModule.registerQueue(
      { name: 'email' },
      { name: 'sms' },
    ),
  ],
})
export class QueueModule {}

