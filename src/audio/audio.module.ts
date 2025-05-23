import { Module } from '@nestjs/common';
import { AudioService } from './audio.service';
import { AudioController } from './audio.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [AudioService],
  controllers: [AudioController]
})
export class AudioModule {}
