import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../domain/entities/user.entity';
import { Email } from '../domain/value-objects/email.vo';
import { IUserRepository } from '../domain/interface/user-repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async create(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { _id: id } as any });
  }

  async findByEmail(email: Email): Promise<User | null> {
    return this.repository.findOne({ where: { _email: email.value } as any });
  }

  async findAll(): Promise<User[]> {
    return this.repository.find();
  }

  async update(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const count = await this.repository.count({
      where: { _email: email.value } as any,
    });
    return count > 0;
  }
}