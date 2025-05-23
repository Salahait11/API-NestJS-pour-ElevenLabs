import {
  Controller,
  Post, // Décorateur pour gérer les requêtes POST
  Body, // Décorateur pour accéder au corps de la requête
  HttpCode, // Décorateur pour définir le code de statut HTTP
  HttpStatus, // Pour utiliser les codes de statut HTTP
  Res, // Décorateur pour accéder à l'objet de réponse natif
  Header, // Décorateur pour définir un en-tête de réponse
  BadRequestException, // Pour gérer les erreurs spécifiques
  Get, // Décorateur pour gérer les requêtes GET
} from '@nestjs/common';
import { AudioService } from './audio.service'; // Importer le service
import { CreateAudioDto } from './dto/create-audio.dto'; // Importer le DTO
import { Response } from 'express'; // Importer le type Response d'express (NestJS utilise Express par défaut)

@Controller('audio') // Le préfixe de route est /audio
export class AudioController {
  constructor(private readonly audioService: AudioService) {} // Injecter le service

  @Get()
  getTestView(@Res() res: Response) {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test Audio API</title>
      </head>
      <body>
        <h1>Test Audio API</h1>
        <form id="audioForm">
          <label for="text">Texte à convertir en audio:</label><br>
          <input type="text" id="text" name="text" required><br>
          <button type="submit">Générer Audio</button>
        </form>
        <audio id="audioPlayer" controls style="display:none;"></audio>
        <script>
          document.getElementById('audioForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = document.getElementById('text').value;
            try {
              const response = await fetch('/audio/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
              });
              if (!response.ok) throw new Error('Erreur lors de la génération audio');
              const blob = await response.blob();
              const audioUrl = URL.createObjectURL(blob);
              const audioPlayer = document.getElementById('audioPlayer');
              audioPlayer.src = audioUrl;
              audioPlayer.style.display = 'block';
            } catch (error) {
              console.error('Erreur:', error);
              alert('Erreur lors de la génération audio');
            }
          });
        </script>
      </body>
      </html>
    `);
  }

  @Get('test')
  getTestInterface(@Res() res: Response) {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Interface de Test Audio API</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background-color: #f4f4f4; }
          h1 { color: #333; text-align: center; }
          .container { max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
          form { margin-bottom: 20px; }
          input[type="text"] { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ccc; border-radius: 4px; }
          select { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ccc; border-radius: 4px; }
          button { padding: 10px 15px; background-color: #4CAF50; color: white; border: none; cursor: pointer; border-radius: 4px; }
          button:hover { background-color: #45a049; }
          audio { width: 100%; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Test Audio API</h1>
          <form id="audioForm">
            <label for="text">Texte à convertir en audio:</label><br>
            <input type="text" id="text" name="text" required><br>
            <label for="voice">Choisir une voix :</label><br>
            <select id="voice" name="voice" required></select><br>
            <button type="submit">Générer Audio</button>
          </form>
          <audio id="audioPlayer" controls style="display:none;"></audio>
          <script>
            // Charger dynamiquement les voix
            async function loadVoices() {
              const select = document.getElementById('voice');
              try {
                const res = await fetch('/audio/voices');
                const data = await res.json();
                if (data && data.voices) {
                  data.voices.forEach(voice => {
                    const option = document.createElement('option');
                    option.value = voice.voice_id;
                    option.text = voice.name + (voice.labels && voice.labels.language ? ' (' + voice.labels.language + ')' : '');
                    select.appendChild(option);
                  });
                }
              } catch (e) {
                select.innerHTML = '<option disabled>Erreur chargement voix</option>';
              }
            }
            loadVoices();
            document.getElementById('audioForm').addEventListener('submit', async (e) => {
              e.preventDefault();
              const text = document.getElementById('text').value;
              const voice = document.getElementById('voice').value;
              try {
                const response = await fetch('/audio/generate', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ text, voiceId: voice })
                });
                if (!response.ok) throw new Error('Erreur lors de la génération audio');
                const blob = await response.blob();
                const audioUrl = URL.createObjectURL(blob);
                const audioPlayer = document.getElementById('audioPlayer');
                audioPlayer.src = audioUrl;
                audioPlayer.style.display = 'block';
              } catch (error) {
                console.error('Erreur:', error);
                alert('Erreur lors de la génération audio');
              }
            });
          </script>
        </div>
      </body>
      </html>
    `);
  }

  @Post('generate') // Définit une route POST à /audio/generate
  @HttpCode(HttpStatus.OK) // Définit le code de statut de succès à 200 (OK) au lieu de 201 (Created par défaut pour POST)
  @Header('Content-Type', 'audio/wav') // Définit l'en-tête Content-Type pour indiquer que la réponse est de l'audio WAV
  // @Header('Content-Disposition', 'attachment; filename="audio.wav"') // Optionnel: Force le téléchargement avec un nom de fichier
  async generateAudio(
    @Body() createAudioDto: CreateAudioDto, // Valide le corps de la requête avec CreateAudioDto
    @Res() res: Response, // Permet d'accéder à l'objet de réponse natif pour envoyer les données binaires
  ) {
    const { text, voiceId } = createAudioDto; // Extrait le texte et la voix du DTO validé

    if (!text) {
      // Bien que le DTO et le ValidationPipe gèrent cela, une vérification explicite ici est possible si nécessaire
      // Mais le ValidationPipe devrait intercepter cela avant d'arriver ici.
      throw new BadRequestException('Text content is required.');
    }

    try {
      // Appelle le service pour générer l'audio
      const audioBuffer = await this.audioService.generateAudio(text, voiceId);


      res.send(audioBuffer);
    } catch (error) {
      // Gérer les erreurs du service (InternalServerErrorException, etc.)
      // L'exception lancée par le service sera gérée par le système d'exception global de NestJS
      // qui la transformera en réponse HTTP appropriée.
      // Nous pouvons ajouter un log ici si on veut:
      // console.error('Error in controller:', error.message);
      throw error; // Relancer l'erreur pour que NestJS la gère
    }
  }

  @Get('voices')
  async getVoices(@Res() res: Response) {
    try {
      const voices = await this.audioService.getAllVoices();
      res.json(voices);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des voix.' });
    }
  }
}
