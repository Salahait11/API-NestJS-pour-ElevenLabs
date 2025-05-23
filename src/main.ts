import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // Importer ValidationPipe

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Ajouter la validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Supprime les propriétés qui ne sont pas définies dans le DTO
      // forbidNonWhitelisted: true, // Rejette la requête si elle contient des propriétés non définies
      transform: true, // Transforme automatiquement les types (par exemple, les chaînes en nombres si le DTO l'attend)
    }),
  );

  await app.listen(3000);
}
bootstrap();
