import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AudioModule } from './audio/audio.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AudioModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
