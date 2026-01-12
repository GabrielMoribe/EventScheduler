import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Email } from '../value-objects/email.vo';
import { Password } from '../value-objects/password.vo';
import { UserRole } from '../enums/user-role.enum';
import { BadRequestException } from '@nestjs/common';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'email', unique: true, type: 'varchar', length: 255 })
  private _email: string;

  @Column({ name: 'password', type: 'varchar', length: 255 })
  private _password: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  private _firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  private _lastName: string;

  @Column({ name: 'role', type: 'enum', enum: UserRole, default: UserRole.PARTICIPANT })
  private _role: UserRole;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  private _isActive: boolean;

  @Column({ name: 'refresh_token', type: 'varchar', length: 500, nullable: true })
  private _refreshToken: string | null;

  @CreateDateColumn({ name: 'created_at' })
  private _createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  private _updatedAt: Date;

  private constructor() {}


  static async create(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: UserRole = UserRole.PARTICIPANT,
  ): Promise<User> {
    const user = new User();

    const emailVO = Email.create(email);
    const passwordVO = await Password.create(password);

    user._email = emailVO.value;
    user._password = passwordVO.hash;
    user._firstName = firstName.trim();
    user._lastName = lastName.trim();
    user._role = role;
    user._isActive = true;
    user._refreshToken = null;

    user.validateName();

    return user;
  }


  static fromPersistence(data: {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
    refreshToken: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    const user = new User();
    user.id = data.id;
    user._email = data.email;
    user._password = data.password;
    user._firstName = data.firstName;
    user._lastName = data.lastName;
    user._role = data.role;
    user._isActive = data.isActive;
    user._refreshToken = data.refreshToken;
    user._createdAt = data.createdAt;
    user._updatedAt = data.updatedAt;
    return user;
  }


  get email(): Email {
    return Email.fromPersistence(this._email);
  }
  get emailValue(): string {
    return this._email;
  }
  get password(): Password {
    return Password.fromPersistence(this._password);
  }
  get firstName(): string {
    return this._firstName;
  }
  get lastName(): string {
    return this._lastName;
  }
  get fullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }
  get role(): UserRole {
    return this._role;
  }
  get isActive(): boolean {
    return this._isActive;
  }
  get refreshToken(): string | null {
    return this._refreshToken;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }


  async validateCredentials(plainPassword: string): Promise<boolean> {
    if (!this._isActive) {
      return false;
    }
    return this.password.compare(plainPassword);
  }

  async changePassword(newPassword: string): Promise<void> {
    const passwordVO = await Password.create(newPassword);
    this._password = passwordVO.hash;
  }

  updateProfile(firstName: string, lastName: string): void {
    this._firstName = firstName.trim();
    this._lastName = lastName.trim();
    this.validateName();
  }

  changeRole(newRole: UserRole): void {
    this._role = newRole;
  }

  activate(): void {
    this._isActive = true;
  }

  deactivate(): void {
    this._isActive = false;
  }

  setRefreshToken(token: string | null): void {
    this._refreshToken = token;
  }

  hasRole(role: UserRole): boolean {
    return this._role === role;
  }

  isAdmin(): boolean {
    return this._role === UserRole.ADMIN;
  }

  canManageEvent(): boolean {
    return this._role === UserRole.ADMIN || this._role === UserRole.ORGANIZER;
  }

  private validateName(): void {
    if (!this._firstName || this._firstName.length < 2) {
      throw new BadRequestException('First name must be at least 2 characters');
    }
    if (!this._lastName || this._lastName.length < 2) {
      throw new BadRequestException('Last name must be at least 2 characters');
    }
  }


  toJSON() {
    return {
      id: this.id,
      email: this._email,
      firstName: this._firstName,
      lastName: this._lastName,
      fullName: this.fullName,
      role: this._role,
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}