import { Controller, Post, Body, Get, Res, Injectable, OnModuleInit, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
@Controller()
export class AppController implements OnModuleInit {
  private geminiApiKey: string;
  private elevenLabsApiKey: string;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const geminiApiKey = this.configService.get<string>('GEMINI_API_KEY');
    const elevenLabsApiKey = this.configService.get<string>('ELEVENLABS_API_KEY');

    if (!geminiApiKey || !elevenLabsApiKey) {
      throw new Error('Les clés API GEMINI_API_KEY et ELEVENLABS_API_KEY sont requises');
    }

    this.geminiApiKey = geminiApiKey;
    this.elevenLabsApiKey = elevenLabsApiKey;
  }

  private async detectLanguage(text: string): Promise<string> {
    try {
      const response = await axios({
        method: 'POST',
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.geminiApiKey}`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
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
      });

      const detectedLanguage = response.data.candidates[0].content.parts[0].text.trim().toLowerCase();
      return detectedLanguage;
    } catch (error) {
      console.error('Erreur lors de la détection de la langue:', error);
      return 'en'; // Langue par défaut en cas d'erreur
    }
  }

  private async getVoiceIdForLanguage(language: string): Promise<string> {
    // Mapping des langues vers les voix d'ElevenLabs
    const voiceMap: { [key: string]: string } = {
      'fr': '21m00Tcm4TlvDq8ikWAM', // Voix française
      'en': 'EXAVITQu4vr4xnSDxMaL', // Voix anglaise
      'es': 'ErXwobaYiN019PkySvjV', // Voix espagnole
      'de': 'MF3mGyEYCl7XYWbV9V6O', // Voix allemande
      'it': 'AZnzlk1XvdvUeBnXmlld', // Voix italienne
      'pt': 'VR6AewLTigWG4xSOukaG', // Voix portugaise
      // Ajoutez d'autres langues selon vos besoins
    };

    return voiceMap[language] || 'EXAVITQu4vr4xnSDxMaL'; // Retourne la voix anglaise par défaut
  }

  @Post('api/chat')
  async chat(@Body() body: { message: string }, @Res() res: Response) {
    try {
      if (!body.message) {
        throw new HttpException('Le message est requis', HttpStatus.BAD_REQUEST);
      }

      // Générer la réponse avec Gemini
      const geminiResponse = await axios({
        method: 'POST',
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.geminiApiKey}`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          contents: [
            {
              parts: [
                {
                  text: body.message
                }
              ]
            }
          ]
        }
      });

      const text = geminiResponse.data.candidates[0].content.parts[0].text;

      if (!text) {
        throw new HttpException('Erreur lors de la génération de la réponse', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // Détecter la langue de la réponse
      const detectedLanguage = await this.detectLanguage(text);
      const voiceId = await this.getVoiceIdForLanguage(detectedLanguage);

      // Générer l'audio avec ElevenLabs
      const audioResponse = await axios({
        method: 'POST',
        url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.elevenLabsApiKey,
        },
        data: {
          text: text,
          model_id: 'eleven_multilingual_v2', // Utilisation du modèle multilingue
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          },
        },
        responseType: 'arraybuffer',
      });

      // Créer le dossier audio s'il n'existe pas
      const audioDir = path.join(process.cwd(), 'public', 'audio');
      if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
      }

      // Sauvegarder l'audio
      const audioFileName = `audio_${Date.now()}.mp3`;
      const audioPath = path.join(audioDir, audioFileName);
      fs.writeFileSync(audioPath, audioResponse.data);

      // Retourner la réponse
      res.json({
        text: text,
        audioUrl: `/audio/${audioFileName}`,
        language: detectedLanguage
      });
    } catch (error) {
      console.error('Erreur détaillée:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }

      if (error.response) {
        // Erreur de l'API
        throw new HttpException(
          `Erreur API: ${error.response.status} - ${error.response.statusText}`,
          error.response.status
        );
      }

      throw new HttpException(
        'Une erreur est survenue lors du traitement de votre demande',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  getHello(): string {
    return 'API is running';
  }
}
