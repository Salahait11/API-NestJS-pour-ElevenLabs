import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class CreateAudioDto {
  @IsString() // Assure que la valeur est une chaîne de caractères
  @IsNotEmpty() // Assure que la chaîne n'est pas vide
  @MinLength(1) // Assure qu'il y a au moins 1 caractère (redondant avec IsNotEmpty, mais bonne pratique)
  text: string; // Le champ attendu dans le corps de la requête

  @IsString()
  @IsOptional()
  voiceId?: string;

  @IsString()
  @IsOptional()
  language?: string;
}
