import {
  IsString,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { EventStatus } from '../../enums/event-status.enum';

export class UpdateEventRequestDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  location?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxParticipants?: number;

  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;
}