import { DataSource } from 'typeorm';
import { Event } from '../../modules/events/domain/entities/event.entity';
import { EventStatus } from '../../modules/events/domain/enums/event-status.enum';
import { SeededUser } from './users.seed';
import { sendBulkNotification } from './notification.seed';

export async function seedEvents(
  dataSource: DataSource,
  users: SeededUser[],
): Promise<void> {
  const eventRepository = dataSource.getRepository(Event);

  const organizers = users.filter(
    (u) => u.role === 'ORGANIZER' || u.role === 'ADMIN',
  );
  const participants = users.filter((u) => u.role === 'PARTICIPANT');

  if (organizers.length === 0) {
    console.log('Nenhum organizador encontrado');
    return;
  }

  const now = new Date();
  const eventsData = [
    {
      title: 'Workshop de NestJS',
      description: 'Aprenda NestJS do zero ao avançado com projetos práticos.',
      location: 'Online',
      startDate: addDays(now, 7),
      endDate: addDays(now, 20),
      maxParticipants: 50,
      organizerIndex: 1,
      status: EventStatus.PUBLISHED,
      notifyParticipants: true,
    },
    {
      title: 'Hackathon de Inovação',
      description: '48 horas de desenvolvimento intensivo com premiação.',
      location: 'Online',
      startDate: addDays(now, 5),
      endDate: addDays(now, 32),
      maxParticipants: 100,
      organizerIndex: 1,
      status: EventStatus.DRAFT,
      notifyParticipants: false,
    },
  ];

  for (const eventData of eventsData) {
    const existing = await eventRepository
      .createQueryBuilder('event')
      .where('event._title = :title', { title: eventData.title })
      .getOne();

    if (existing) {
      console.log(`Event "${eventData.title}" já existe`);
      continue;
    }

    const organizer = organizers[eventData.organizerIndex % organizers.length];

    const event = Event.create(
      eventData.title,
      eventData.startDate,
      eventData.endDate,
      organizer.id,
      eventData.description,
      eventData.location,
      eventData.maxParticipants,
    );

    (event as any)._status = eventData.status;

    const saved = await eventRepository.save(event);
    console.log(`Event "${eventData.title}" criado (${eventData.status})`);

    if (eventData.status === EventStatus.PUBLISHED && eventData.notifyParticipants) {
      const participantIds = participants.map((p) => p.id);
      
      await sendBulkNotification({
        userIds: participantIds,
        title: 'Novo Evento Disponível!',
        message: `O evento "${eventData.title}" foi publicado por ${organizer.fullName}. Inscreva-se!`,
        type: 'EVENT_PUBLISHED',
        metadata: { eventId: saved.id },
      });
    }
  }
}

function addDays(date: Date, days: number, hours: number = 0): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  result.setHours(10 + hours, 0, 0, 0);
  return result;
}