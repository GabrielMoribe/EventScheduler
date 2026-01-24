import amqp, { ChannelModel, Channel } from 'amqplib';
import { config } from 'dotenv';

config();

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

export async function initRabbitMQ(): Promise<void> {
  const url = process.env.RABBITMQ_URL;

  if (!url) {
    console.log('RABBITMQ_URL não configurada, notificações serão ignoradas\n');
    return;
  }

  try {
    connection = await amqp.connect(url);
    channel = await connection.createChannel();
    await channel.assertQueue('notifications_queue', { durable: true });
    console.log('RabbitMQ conectado\n');
  } catch (error) {
    console.log('RabbitMQ não disponível, notificações serão ignoradas\n');
    console.error('Erro ao conectar RabbitMQ:', error);
    connection = null;
    channel = null;
  }
}

export async function closeRabbitMQ(): Promise<void> {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
  } catch (error) {
    console.error('Erro ao fechar conexão RabbitMQ:', error);
  }
}

export async function sendNotification(payload: {
  userId: string;
  title: string;
  message: string;
  type: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  if (!channel) return;

  // Formato esperado pelo NestJS microservices
  const message = {
    pattern: 'notification.send',
    data: payload,
    id: Date.now().toString(),
  };

  channel.sendToQueue(
    'notifications_queue',
    Buffer.from(JSON.stringify(message)),
    { persistent: true },
  );
}

export async function sendBulkNotification(payload: {
  userIds: string[];
  title: string;
  message: string;
  type: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  if (!channel || payload.userIds.length === 0) return;

  // Formato esperado pelo NestJS microservices
  const message = {
    pattern: 'notification.send.bulk',
    data: payload,
    id: Date.now().toString(),
  };

  channel.sendToQueue(
    'notifications_queue',
    Buffer.from(JSON.stringify(message)),
    { persistent: true },
  );

  console.log(`Notificação enviada para ${payload.userIds.length} usuários`);
}