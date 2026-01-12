import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

export class Password {
  private readonly _hash: string;
  private static readonly SALT_ROUNDS = 12;
  private static readonly MIN_LENGTH = 8;

  private constructor(hash: string) {
    this._hash = hash;
  }

  static async create(plainPassword: string): Promise<Password> {
    Password.validate(plainPassword);
    const hash = await bcrypt.hash(plainPassword, Password.SALT_ROUNDS);
    return new Password(hash);
  }

  static fromPersistence(hash: string): Password {
    return new Password(hash);
  }

  private static validate(password: string): void {
    if (!password || password.length < Password.MIN_LENGTH) {
      throw new BadRequestException(
        `Password must be at least ${Password.MIN_LENGTH} characters`,
      );
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      throw new BadRequestException(
        'Password must contain uppercase, lowercase and numbers',
      );
    }
  }

  async compare(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this._hash);
  }

  get hash(): string {
    return this._hash;
  }
}