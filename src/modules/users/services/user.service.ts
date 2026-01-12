import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../domain/entities/user.entity';
import { Email } from '../domain/value-objects/email.vo';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../domain/interface/user-repository.interface';
import { CreateUserRequestDto } from '../domain/dto/request/create-user.request.dto';
import { UpdateUserRequestDto } from '../domain/dto/request/update-user.request.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async create(dto: CreateUserRequestDto): Promise<User> {
    const email = Email.create(dto.email);

    const exists = await this.userRepository.existsByEmail(email);
    if (exists) {
      throw new ConflictException('Email already registered');
    }

    const user = await User.create(
      dto.email,
      dto.password,
      dto.firstName,
      dto.lastName,
      dto.role,
    );

    return this.userRepository.create(user);
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(emailStr: string): Promise<User> {
    const email = Email.create(emailStr);
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async update(id: string, dto: UpdateUserRequestDto): Promise<User> {
    const user = await this.findById(id);

    if (dto.firstName || dto.lastName) {
      user.updateProfile(
        dto.firstName || user.firstName,
        dto.lastName || user.lastName,
      );
    }

    return this.userRepository.update(user);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.userRepository.delete(id);
  }

  async updateRefreshToken(id: string, token: string | null): Promise<void> {
    const user = await this.findById(id);
    user.setRefreshToken(token);
    await this.userRepository.update(user);
  }
}