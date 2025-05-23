import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AppController {
  @Get()
  getHomeView(@Res() res: Response) {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test Audio API</title>
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
}
