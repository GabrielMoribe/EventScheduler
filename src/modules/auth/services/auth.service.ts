import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/services/user.service';
import { User } from '../../users/domain/entities/user.entity';
import { LoginRequestDto } from '../dto/request/login.request.dto';
import { AuthResponseDto } from '../dto/response/auth.response.dto';
import { JwtPayload } from '../strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginRequestDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(dto.email, dto.password);
    return this.generateTokens(user);
  }

  async refresh(user: User): Promise<AuthResponseDto> {
    return this.generateTokens(user);
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
  }

  private async validateUser(email: string, password: string): Promise<User> {
    try {
      const user = await this.usersService.findByEmail(email);

      const isPasswordValid = await user.validateCredentials(password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      return user;
    } catch {
      throw new UnauthorizedException('Credenciais inválidas');
    }
  }

  private async generateTokens(user: User): Promise<AuthResponseDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.emailValue,
      role: user.role,
    };

    const secret = this.configService.getOrThrow<string>('jwt.secret');
    const refreshSecret = this.configService.getOrThrow<string>('jwt.refreshSecret');

    const expiresInSeconds = this.parseExpiresIn(
      this.configService.getOrThrow<string>('jwt.expiresIn'),
    );
    const refreshExpiresInSeconds = this.parseExpiresIn(
      this.configService.getOrThrow<string>('jwt.refreshExpiresIn'),
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret,
        expiresIn: expiresInSeconds,
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresInSeconds,
      }),
    ]);

    await this.usersService.updateRefreshToken(user.id, refreshToken);

    return AuthResponseDto.create(accessToken, refreshToken, expiresInSeconds, user);
  }

  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 900; 

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    return value * (multipliers[unit] || 60);
  }
}