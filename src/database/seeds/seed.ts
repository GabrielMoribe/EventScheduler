import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../../config/typeorm-cli.config';
import { seedUsers } from './users.seed';
import { seedEvents } from './events.seed';
import { initRabbitMQ, closeRabbitMQ } from './notification.seed';

async function runSeeds(): Promise<void> {
  console.log('Iniciando seeds...\n');

  const dataSource = new DataSource(dataSourceOptions);

  try {
    await dataSource.initialize();
    console.log('Conexão com banco estabelecida\n');

    // Conectar ao RabbitMQ
    await initRabbitMQ();

    // Seed Users
    console.log('Criando usuários...');
    const users = await seedUsers(dataSource);
    console.log(`Total: ${users.length} usuários\n`);

    // Seed Events
    console.log('Criando eventos...');
    await seedEvents(dataSource, users);
    console.log('');

    console.log('Seeds executados com sucesso!\n');

    // Exibir credenciais para teste
    console.log('Credenciais para teste:');
    console.log('─'.repeat(50));
    console.log('');
    console.log('ADMIN:');
    console.log('Email: admin@eventscheduler.com');
    console.log('Senha: Admin123!');
    console.log('');
    console.log('ORGANIZER:');
    console.log('Email: organizador@eventscheduler.com');
    console.log('Senha: Org123!');
    console.log('');
    console.log('PARTICIPANT:');
    console.log('Email: participante1@eventscheduler.com');
    console.log('Senha: Part123!');
    console.log('');
    console.log('─'.repeat(50));
  } catch (error) {
    console.error('Erro ao executar seeds:', error);
    process.exit(1);
  } finally {
    await closeRabbitMQ();
    await dataSource.destroy();
  }
}

runSeeds();