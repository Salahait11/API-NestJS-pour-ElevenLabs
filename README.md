# API NestJS pour ElevenLabs et Gemini

Un chatbot intelligent construit avec NestJS qui combine la puissance de Gemini pour le traitement du langage naturel et ElevenLabs pour la synthèse vocale, offrant une expérience de conversation naturelle et interactive.

## 🌟 Fonctionnalités

- 🤖 Chatbot intelligent basé sur Gemini
- 🎙️ Synthèse vocale avec ElevenLabs
- 💬 Interface de chat moderne et responsive
- 🌍 Support multilingue
- 💾 Sauvegarde locale des conversations
- 🎨 Interface utilisateur animée et interactive
- 📱 Design responsive pour mobile et desktop
- 🔒 Gestion sécurisée des clés API

## 🚀 Installation

1. Clonez le repository :
```bash
git clone https://github.com/Salahait11/API-NestJS-pour-ElevenLabs.git
cd API-NestJS-pour-ElevenLabs
```

2. Installez les dépendances :
```bash
npm install
```

3. Configurez les variables d'environnement :
Créez un fichier `.env` à la racine du projet :
```env
ELEVENLABS_API_KEY=votre_clé_api_elevenlabs
GEMINI_API_KEY=votre_clé_api_gemini
PORT=3000 # Optionnel, par défaut 3000
```

## 🛠️ Technologies utilisées

- **Backend** :
  - NestJS 11.x
  - TypeScript 5.x
  - Gemini API pour le traitement du langage
  - ElevenLabs API pour la synthèse vocale
  - Axios pour les requêtes HTTP
  - Class Validator pour la validation
  - Jest pour les tests

- **Frontend** :
  - HTML5
  - CSS3 avec animations modernes
  - JavaScript vanilla
  - LocalStorage pour la persistance des conversations

## 📱 Interface de Chat

L'interface de chat offre :
- Conversations fluides avec le chatbot Gemini
- Réponses vocales via ElevenLabs
- Historique des conversations
- Gestion des conversations (création, masquage)
- Interface responsive et intuitive

## 🔧 API Endpoints

### Chat
```http
POST /chat
Content-Type: application/json

{
    "message": "Votre message",
    "conversationId": "ID_DE_LA_CONVERSATION" // Optionnel
}
```

### Voix disponibles
```http
GET /audio/voices
```

## 🚀 Démarrage

1. Mode développement :
```bash
npm run start:dev
```

2. Mode production :
```bash
npm run build
npm run start:prod
```

3. Accédez à l'interface web :
```
http://localhost:3000
```

## 📝 Utilisation

1. **Nouvelle conversation** :
   - Cliquez sur le bouton "Nouvelle conversation"
   - L'interface affiche un message de bienvenue

2. **Envoi de messages** :
   - Tapez votre message dans la zone de texte
   - Appuyez sur Entrée ou cliquez sur l'icône d'envoi
   - Recevez une réponse textuelle de Gemini
   - Écoutez la réponse vocale via ElevenLabs

3. **Gestion des conversations** :
   - Les conversations sont automatiquement sauvegardées
   - Utilisez le bouton de masquage pour cacher une conversation
   - Les conversations masquées ne sont plus affichées

## 🛠️ Développement

### Structure du projet
```
src/
├── app.controller.ts    # Contrôleur principal avec l'interface web
├── app.module.ts        # Module principal de l'application
├── main.ts             # Point d'entrée de l'application
├── chat/               # Module de chat avec Gemini
│   ├── chat.controller.ts
│   ├── chat.service.ts
│   └── chat.module.ts
└── audio/              # Module audio avec ElevenLabs
    ├── audio.controller.ts
    ├── audio.service.ts
    └── audio.module.ts
```

### Scripts disponibles
- `npm run start:dev` : Démarre le serveur en mode développement
- `npm run build` : Compile le projet
- `npm run start:prod` : Démarre le serveur en mode production
- `npm run lint` : Vérifie le code avec ESLint
- `npm run test` : Lance les tests unitaires

## 🔍 Tests

Le projet inclut des tests unitaires et e2e :
```bash
# Tests unitaires
npm run test

# Tests avec couverture
npm run test:cov

# Tests e2e
npm run test:e2e
```

## 🐛 Dépannage

### Erreurs courantes

1. **Erreur de port déjà utilisé**
   - Solution : Changez le port dans le fichier `.env`

2. **Erreur d'API**
   - Vérifiez vos clés API dans `.env`
   - Assurez-vous que vos comptes sont actifs

3. **Erreur de compilation TypeScript**
   - Vérifiez la version de Node.js (14+ requise)
   - Réinstallez les dépendances : `npm install`

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Auteur

- **SALAH AIT HAMMOU**
  - GitHub: [@Salahait11](https://github.com/Salahait11)
  - Repository: [API-NestJS-pour-ElevenLabs](https://github.com/Salahait11/API-NestJS-pour-ElevenLabs.git)

## 🙏 Remerciements

- Google pour l'API Gemini
- ElevenLabs pour leur API de synthèse vocale
- La communauté NestJS
- Tous les contributeurs
