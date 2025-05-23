import { Controller, Post, Body, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AudioService } from '../audio/audio.service';
import * as fs from 'fs';
import * as path from 'path';

@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly audioService: AudioService,
  ) {}

  @Post()
  async chat(@Body() body: { message: string }) {
    try {
      if (!body.message) {
        throw new HttpException('Le message est requis', HttpStatus.BAD_REQUEST);
      }

      this.logger.log(`Traitement du message: ${body.message}`);

      const text = await this.chatService.sendMessage(body.message);
      this.logger.log(`Réponse générée: ${text}`);

      const detectedLanguage = await this.chatService.detectLanguage(text);
      this.logger.log(`Langue détectée: ${detectedLanguage}`);

      const audioBuffer = await this.audioService.generateAudio(text, undefined, detectedLanguage);
      this.logger.log('Audio généré avec succès');

      // Créer le dossier audio s'il n'existe pas
      const audioDir = path.join(process.cwd(), 'public', 'audio');
      if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
      }

      // Sauvegarder l'audio
      const audioFileName = `audio_${Date.now()}.mp3`;
      const audioPath = path.join(audioDir, audioFileName);
      fs.writeFileSync(audioPath, audioBuffer);

      return {
        text,
        audioUrl: `/audio/${audioFileName}`,
        language: detectedLanguage
      };
    } catch (error) {
      this.logger.error(`Erreur lors du traitement du message: ${error.message}`, error.stack);
      
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        `Erreur: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 