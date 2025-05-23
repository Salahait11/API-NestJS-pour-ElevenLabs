import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async sendMessage(message: string) {
    const geminiApiKey = this.configService.get<string>('GEMINI_API_KEY');
    
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
          {
            contents: [
              {
                parts: [{ 
                  text: message
                }]
              }
            ]
          }
        )
      );

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      this.logger.error(`Error in chat service: ${error.message}`);
      throw error;
    }
  }

  async detectLanguage(text: string): Promise<string> {
    const geminiApiKey = this.configService.get<string>('GEMINI_API_KEY');
    
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
          {
            contents: [
              {
                parts: [
                  {
                    text: `Détecte la langue du texte suivant et réponds uniquement avec le code ISO de la langue (fr, en, es, de, it, pt, etc.) : "${text}"`
                  }
                ]
              }
            ]
          }
        )
      );

      return response.data.candidates[0].content.parts[0].text.trim().toLowerCase();
    } catch (error) {
      this.logger.error(`Error detecting language: ${error.message}`);
      return 'en'; // Langue par défaut en cas d'erreur
    }
  }
} 