import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateEventRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'Título é obrigatório' })
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  location?: string;

  @IsDateString({}, { message: 'Data de início inválida' })
  @IsNotEmpty({ message: 'Data de início é obrigatória' })
  startDate: string;

  @IsDateString({}, { message: 'Data de término inválida' })
  @IsNotEmpty({ message: 'Data de término é obrigatória' })
  endDate: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxParticipants?: number;
}