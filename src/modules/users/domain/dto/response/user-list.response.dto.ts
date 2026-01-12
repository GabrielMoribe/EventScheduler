import { User } from '../../entities/user.entity';
import { UserResponseDto } from './user.response.dto';

export class UserListResponseDto {
  data: UserResponseDto[];
  total: number;

  private constructor(users: User[]) {
    this.data = UserResponseDto.fromEntities(users);
    this.total = users.length;
  }

  static fromEntities(users: User[]): UserListResponseDto {
    return new UserListResponseDto(users);
  }
}