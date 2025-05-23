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

  async generateAudio(text: string, voiceId?: string): Promise<Buffer> {
    const elevenLabsApiKey =
      this.configService.get<string>('ELEVENLABS_API_KEY'); // Récupérer la clé API

    if (!elevenLabsApiKey) {
      this.logger.error('ElevenLabs API key is not configured.');
      throw new InternalServerErrorException('ElevenLabs API key is missing.');
    }

    // Utiliser le voiceId fourni ou celui de la config
    const selectedVoiceId = voiceId || this.configService.get<string>('ELEVENLABS_VOICE_ID');
    const elevenLabsApiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`;

    const headers = {
      'Content-Type': 'application/json',
      'xi-api-key': elevenLabsApiKey,
      Accept: 'audio/wav', // Indique que nous attendons un fichier audio WAV
    };

    const body = {
      text: text,
      // Vous pouvez ajouter d'autres options ici si besoin (par exemple, model_id, voice_settings)
      // Voir la documentation ElevenLabs pour plus de détails: https://elevenlabs.io/docs/api-reference/text-to-speech
    };

    try {
      // Faire la requête POST à l'API ElevenLabs
      // responseType: 'arraybuffer' est important pour recevoir les données binaires de l'audio
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
              // Tenter de loguer plus de détails si possible
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

      // La réponse contient les données audio binaires
      return Buffer.from(response.data);
    } catch (error) {
      // Si l'erreur n'a pas déjà été transformée par catchError (peu probable ici mais bonne pratique)
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
