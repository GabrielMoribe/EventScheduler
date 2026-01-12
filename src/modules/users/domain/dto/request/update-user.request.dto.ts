import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserRequestDto {
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  @IsOptional()
  firstName?: string;

  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters' })
  @IsOptional()
  lastName?: string;
}