# API NestJS pour ElevenLabs et Gemini

Une interface de chat moderne et interactive qui utilise l'API ElevenLabs pour la synthèse vocale, construite avec NestJS et une interface utilisateur dynamique.

## 🌟 Fonctionnalités

- 💬 Interface de chat moderne et responsive
- 🎙️ Synthèse vocale avec ElevenLabs
- 🌍 Support multilingue
- 💾 Sauvegarde locale des conversations
- 🎨 Interface utilisateur animée et interactive
- 📱 Design responsive pour mobile et desktop
- 🔒 Gestion sécurisée des clés API

## 🚀 Installation

1. Clonez le repository :
```bash
git clone [URL_DU_REPO]
cd API-NestJS-pour-ElevenLabs
```

2. Installez les dépendances :
```bash
npm install
```

3. Configurez les variables d'environnement :
Créez un fichier `.env` à la racine du projet avec les variables suivantes :
```env
ELEVENLABS_API_KEY=votre_clé_api
```

## 🛠️ Technologies utilisées

- **Backend** :
  - NestJS
  - TypeScript
  - Axios pour les requêtes HTTP
  - Dotenv pour la gestion des variables d'environnement

- **Frontend** :
  - HTML5
  - CSS3 avec animations modernes
  - JavaScript vanilla
  - LocalStorage pour la persistance des données

## 📱 Fonctionnalités de l'interface

### Interface de chat
- Messages avec animations fluides
- Support du formatage Markdown
- Affichage du code avec coloration syntaxique
- Lecteur audio intégré pour les réponses vocales
- Indicateur de chargement animé

### Gestion des conversations
- Création de nouvelles conversations
- Sauvegarde automatique des conversations
- Masquage des conversations (suppression logique)
- Interface responsive pour mobile et desktop

### Formatage des messages
- Support du code avec coloration syntaxique
- Listes à puces
- Citations
- Texte en gras et italique
- Liens cliquables
- Images

## 🔧 Configuration

### Variables d'environnement
- `ELEVENLABS_API_KEY` : Votre clé API ElevenLabs

### Options de configuration
Le projet peut être configuré via le fichier `config.ts` :
- Port du serveur
- Options de l'API ElevenLabs
- Paramètres de l'interface utilisateur

## 🚀 Démarrage

1. Démarrez le serveur de développement :
```bash
npm run start:dev
```

2. Accédez à l'interface dans votre navigateur :
```
http://localhost:3000
```

## 📝 Utilisation

1. **Nouvelle conversation** :
   - Cliquez sur le bouton "Nouvelle conversation" pour démarrer
   - L'interface affiche un message de bienvenue

2. **Envoi de messages** :
   - Tapez votre message dans la zone de texte
   - Appuyez sur Entrée ou cliquez sur l'icône d'envoi
   - Attendez la réponse avec l'indicateur de chargement

3. **Gestion des conversations** :
   - Les conversations sont automatiquement sauvegardées
   - Utilisez le bouton de masquage pour cacher une conversation
   - Les conversations masquées ne sont plus affichées

4. **Fonctionnalités vocales** :
   - Les réponses peuvent être converties en audio
   - Utilisez le lecteur audio intégré pour écouter

## 🔒 Sécurité

- Les clés API sont stockées de manière sécurisée
- Validation des entrées utilisateur
- Protection contre les injections
- Gestion sécurisée des données sensibles

## 🛠️ Développement

### Structure du projet
```
├── src/
│   ├── controllers/
│   ├── services/
│   ├── config/
│   └── main.ts
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── .env
└── package.json
```

### Scripts disponibles
- `npm run start` : Démarre le serveur
- `npm run start:dev` : Démarre le serveur en mode développement
- `npm run build` : Compile le projet
- `npm run test` : Lance les tests

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Auteurs

- SALAH AIT HAMMOU - Développeur principal

## 🙏 Remerciements

- ElevenLabs pour leur API de synthèse vocale
- La communauté NestJS
- Tous les contributeurs
