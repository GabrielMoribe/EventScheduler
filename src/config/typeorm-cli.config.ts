import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { User } from '../modules/users/domain/entities/user.entity';

config();

function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Variavel de ambiente ausente: ${key}`);
  }
  return value;
}

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: getEnvOrThrow('POSTGRES_HOST'),
  port: parseInt(getEnvOrThrow('POSTGRES_PORT'), 10),
  username: getEnvOrThrow('POSTGRES_USER'),
  password: getEnvOrThrow('POSTGRES_PASSWORD'),
  database: getEnvOrThrow('POSTGRES_DB'),
  logging: true,
  entities: [User],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;