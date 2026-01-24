import { DataSource } from 'typeorm';
import { User } from '../../modules/users/domain/entities/user.entity';
import { UserRole } from '../../modules/users/domain/enums/user-role.enum';

export interface SeededUser {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  fullName: string;
}

export async function seedUsers(dataSource: DataSource): Promise<SeededUser[]> {
  const userRepository = dataSource.getRepository(User);

  const usersData = [
    {
      email: 'admin@eventscheduler.com',
      password: 'Senha123',
      firstName: 'Admin',
      lastName: 'Sistema',
      role: UserRole.ADMIN,
    },
    {
      email: 'organizador@eventscheduler.com',
      password: 'Senha123',
      firstName: 'João',
      lastName: 'Silva',
      role: UserRole.ORGANIZER,
    },
    {
      email: 'participante1@eventscheduler.com',
      password: 'Senha123',
      firstName: 'Maria',
      lastName: 'Silva',
      role: UserRole.PARTICIPANT,
    }
  ];

  const seededUsers: SeededUser[] = [];

  for (const userData of usersData) {
    const existing = await userRepository
      .createQueryBuilder('user')
      .where('user._email = :email', { email: userData.email })
      .getOne();

    if (existing) {
      console.log(`User ${userData.email} já existe`);
      seededUsers.push({
        id: existing.id,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        fullName: `${userData.firstName} ${userData.lastName}`,
      });
      continue;
    }

    const user = await User.create(
      userData.email,
      userData.password,
      userData.firstName,
      userData.lastName,
    );

    if (userData.role !== UserRole.PARTICIPANT) {
      (user as any)._role = userData.role;
    }

    const saved = await userRepository.save(user);
    console.log(`User ${userData.email} criado (${userData.role})`);

    seededUsers.push({
      id: saved.id,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      fullName: `${userData.firstName} ${userData.lastName}`,
    });
  }

  return seededUsers;
}