import { UserResponseDto } from '../../../users/domain/dto/response/user.response.dto';
import { User } from '../../../users/domain/entities/user.entity';

export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserResponseDto;

  private constructor(
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    user: User,
  ) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiresIn = expiresIn;
    this.user = UserResponseDto.fromEntity(user);
  }

  static create(
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    user: User,
  ): AuthResponseDto {
    return new AuthResponseDto(accessToken, refreshToken, expiresIn, user);
  }
}