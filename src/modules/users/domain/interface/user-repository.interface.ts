import { User } from '../entities/user.entity';
import { Email } from '../value-objects/email.vo';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export abstract class IUserRepository {
  abstract create(user: User): Promise<User>;
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: Email): Promise<User | null>;
  abstract findAll(): Promise<User[]>;
  abstract update(user: User): Promise<User>;
  abstract delete(id: string): Promise<void>;
  abstract existsByEmail(email: Email): Promise<boolean>;
}