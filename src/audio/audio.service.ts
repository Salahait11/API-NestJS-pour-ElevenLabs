import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'; // Ajouter Logger et InternalServerErrorException
import { HttpService } from '@nestjs/axios'; // Importer HttpService
import { ConfigService } from '@nestjs/config'; // Importer ConfigService
import { firstValueFrom, catchError } from 'rxjs'; // Importer firstValueFrom et catchError depuis rxjs
import { AxiosError } from 'axios'; // Importer AxiosError pour la gestion d'erreur

@Injectable()
export class AudioService {
  private readonly logger = new Logger(AudioService.name); // Initialiser un logger

  constructor(
    private readonly httpService: HttpService, // Injecter HttpService
    private readonly configService: ConfigService, // Injecter ConfigService
  ) {}

  async generateAudio(text: string, voiceId?: string, language?: string): Promise<Buffer> {
    const elevenLabsApiKey =
      this.configService.get<string>('ELEVENLABS_API_KEY');

    if (!elevenLabsApiKey) {
      this.logger.error('ElevenLabs API key is not configured.');
      throw new InternalServerErrorException('ElevenLabs API key is missing.');
    }

    // Sélectionner la voix en fonction de la langue si aucune voix n'est spécifiée
    let selectedVoiceId = voiceId;
    if (!selectedVoiceId) {
      try {
        const voicesData = await this.getAllVoices();
        if (voicesData && voicesData.voices && voicesData.voices.length > 0) {
          if (language) {
            // Filtrer les voix par langue
            const matchingVoices = voicesData.voices.filter(voice => {
              if (!voice.labels || !voice.labels.language) return false;
              
              // Normaliser les codes de langue
              const voiceLang = voice.labels.language.toLowerCase();
              const targetLang = language.toLowerCase();
              
              // Gérer les cas spéciaux de correspondance de langue
              const languageMap = {
                'fr': ['french', 'fr', 'français'],
                'en': ['english', 'en', 'anglais'],
                'es': ['spanish', 'es', 'espagnol'],
                'de': ['german', 'de', 'allemand'],
                'it': ['italian', 'it', 'italien'],
                'pt': ['portuguese', 'pt', 'portugais'],
                'pl': ['polish', 'pl', 'polonais'],
                'tr': ['turkish', 'tr', 'turc'],
                'ru': ['russian', 'ru', 'russe'],
                'ja': ['japanese', 'ja', 'japonais'],
                'ko': ['korean', 'ko', 'coréen'],
                'zh': ['chinese', 'zh', 'chinois']
              };

              // Vérifier si la langue de la voix correspond à la langue cible
              return languageMap[targetLang]?.includes(voiceLang) || voiceLang === targetLang;
            });
            
            if (matchingVoices.length > 0) {
              selectedVoiceId = matchingVoices[0].voice_id;
              this.logger.log(`Voix sélectionnée pour la langue ${language}: ${selectedVoiceId} (${matchingVoices[0].name})`);
            } else {
              selectedVoiceId = voicesData.voices[0].voice_id;
              this.logger.warn(`Aucune voix trouvée pour la langue ${language}, utilisation de la première voix disponible: ${selectedVoiceId} (${voicesData.voices[0].name})`);
            }
          } else {
            selectedVoiceId = voicesData.voices[0].voice_id;
            this.logger.warn(`Aucune langue spécifiée, utilisation de la première voix disponible: ${selectedVoiceId} (${voicesData.voices[0].name})`);
          }
        } else {
          this.logger.error('Aucune voix disponible sur ElevenLabs.');
          throw new InternalServerErrorException('Aucune voix disponible sur ElevenLabs.');
        }
      } catch (err) {
        this.logger.error('Impossible de récupérer la liste des voix ElevenLabs.', err);
        throw new InternalServerErrorException('Impossible de récupérer la liste des voix ElevenLabs.');
      }
    }

    const elevenLabsApiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`;

    const headers = {
      'Content-Type': 'application/json',
      'xi-api-key': elevenLabsApiKey,
      Accept: 'audio/wav',
    };

    const body = {
      text: text,
      model_id: 'eleven_multilingual_v2' // Utiliser le modèle multilingue
    };

    try {
      const response = await firstValueFrom(
        this.httpService
          .post(elevenLabsApiUrl, body, {
            headers,
            responseType: 'arraybuffer',
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(
                `Error calling ElevenLabs API: ${error.message}`,
                error.stack,
              );
              if (error.response) {
                this.logger.error(
                  `ElevenLabs API Response Status: ${error.response.status}`,
                );
                this.logger.error(
                  `ElevenLabs API Response Data: ${error.response.data ? error.response.data.toString() : 'No data'} `,
                );
              }
              throw new InternalServerErrorException(
                'Failed to generate audio from ElevenLabs.',
              );
            }),
          ),
      );

      return Buffer.from(response.data);
    } catch (error) {
      this.logger.error(
        `An unexpected error occurred during audio generation: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'An unexpected error occurred during audio generation.',
      );
    }
  }

  async getAllVoices(): Promise<any> {
    const elevenLabsApiKey = this.configService.get<string>('ELEVENLABS_API_KEY');
    if (!elevenLabsApiKey) {
      this.logger.error('ElevenLabs API key is not configured.');
      throw new InternalServerErrorException('ElevenLabs API key is missing.');
    }
    const url = 'https://api.elevenlabs.io/v1/voices';
    const headers = {
      'xi-api-key': elevenLabsApiKey,
    };
    try {
      const response = await firstValueFrom(
        this.httpService.get(url, { headers }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Error fetching voices: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Failed to fetch voices from ElevenLabs.');
          })
        )
      );
      return response.data;
    } catch (error) {
      this.logger.error(`An unexpected error occurred while fetching voices: ${error.message}`, error.stack);
      throw new InternalServerErrorException('An unexpected error occurred while fetching voices.');
    }
  }
}
