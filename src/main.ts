import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // Importer ValidationPipe
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Ajouter la validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Supprime les propriétés qui ne sont pas définies dans le DTO
      // forbidNonWhitelisted: true, // Rejette la requête si elle contient des propriétés non définies
      transform: true, // Transforme automatiquement les types (par exemple, les chaînes en nombres si le DTO l'attend)
    }),
  );

  // Servir les fichiers statiques
  app.useStaticAssets(join(__dirname, '..', 'public'));
  
  // Configurer CORS
  app.enableCors();

  await app.listen(3000);
}
bootstrap();
