# API NestJS pour ElevenLabs

Ce projet est une API NestJS qui permet de générer des fichiers audio à partir de texte en utilisant l'API ElevenLabs. Il offre une interface web simple pour tester la génération d'audio et la sélection des voix disponibles.

## Fonctionnalités

- Génération d'audio à partir de texte
- Sélection parmi toutes les voix disponibles d'ElevenLabs
- Interface web intuitive pour tester l'API
- Gestion des erreurs et validation des entrées
- Configuration via variables d'environnement

## Prérequis

- Node.js (version 14 ou supérieure)
- npm (généralement installé avec Node.js)
- Une clé API ElevenLabs valide

## Installation

1. Clonez le repository :
```bash
git clone https://github.com/Salahait11/API-NestJS-pour-ElevenLabs.git
cd nestjs-elevenlabs-api
```

2. Installez les dépendances :
```bash
npm install
```

3. Créez un fichier `.env` à la racine du projet avec les variables suivantes :
```env
ELEVENLABS_API_KEY=votre_clé_api_elevenlabs
```

## Configuration

Le projet utilise les variables d'environnement suivantes :

- `ELEVENLABS_API_KEY` : Votre clé API ElevenLabs (obligatoire)
- `PORT` : Le port sur lequel le serveur s'exécute (optionnel, par défaut 3000)

## Démarrage

Pour démarrer le serveur en mode développement :

```bash
npm run start:dev
```

Pour démarrer le serveur en mode production :

```bash
npm run build
npm run start:prod
```

## Utilisation

### Interface Web

Accédez à l'interface web à l'adresse : `http://localhost:3000`

L'interface permet de :
- Saisir le texte à convertir en audio
- Sélectionner une voix parmi celles disponibles
- Générer et écouter l'audio

### API Endpoints

#### Générer de l'audio
```http
POST /audio/generate
Content-Type: application/json

{
    "text": "Votre texte à convertir",
    "voiceId": "ID_DE_LA_VOIX" // Optionnel
}
```

#### Obtenir la liste des voix
```http
GET /audio/voices
```

## Structure du Projet

```
src/
├── app.controller.ts    # Contrôleur principal avec l'interface web
├── app.module.ts        # Module principal de l'application
├── main.ts             # Point d'entrée de l'application
└── audio/              # Module audio
    ├── audio.controller.ts
    ├── audio.service.ts
    ├── audio.module.ts
    └── dto/
        └── create-audio.dto.ts
```

## Développement

### Commandes disponibles

- `npm run start:dev` : Démarre le serveur en mode développement avec rechargement automatique
- `npm run build` : Compile le projet
- `npm run start:prod` : Démarre le serveur en mode production
- `npm run lint` : Vérifie le code avec ESLint
- `npm run test` : Lance les tests unitaires

## Dépannage

### Erreurs courantes

1. **Erreur de port déjà utilisé**
   - Solution : Changez le port dans le fichier `.env` ou arrêtez le processus qui utilise le port 3000

2. **Erreur d'API ElevenLabs**
   - Vérifiez que votre clé API est correcte dans le fichier `.env`
   - Assurez-vous que votre compte ElevenLabs est actif

3. **Erreur de compilation TypeScript**
   - Exécutez `npm install` pour vous assurer que toutes les dépendances sont installées
   - Vérifiez que vous utilisez la bonne version de Node.js

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## Auteur

Développé par **Salah Ait Hammou**

- GitHub: [@Salahait11](https://github.com/Salahait11)
- Repository: [API-NestJS-pour-ElevenLabs](https://github.com/Salahait11/API-NestJS-pour-ElevenLabs.git)

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
