import { Module, forwardRef } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { WspModule } from 'src/wsp/wsp.module';

@Module({
  providers: [NotificationService],
  exports: [NotificationService],
  controllers: [NotificationController],
  imports: [forwardRef(() => WspModule)]
})
export class NotificationModule {}
