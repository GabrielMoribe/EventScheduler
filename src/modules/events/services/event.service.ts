import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Event } from '../domain/entities/event.entity';
import { EventStatus } from '../domain/enums/event-status.enum';
import {
  IEventRepository,
  EVENT_REPOSITORY,
  EventFilters,
} from '../domain/interface/event-repository.interface';
import { CreateEventRequestDto } from '../domain/dto/request/create-event.request.dto';
import { UpdateEventRequestDto } from '../domain/dto/request/update-event.request.dto';
import { UsersService } from '../../users/services/user.service';
import { UserRole } from '../../users/domain/enums/user-role.enum';

@Injectable()
export class EventsService {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: IEventRepository,
    private readonly usersService: UsersService,
  ) {}

  async create(dto: CreateEventRequestDto, organizerId: string): Promise<Event> {
    const event = Event.create(
      dto.title,
      new Date(dto.startDate),
      new Date(dto.endDate),
      organizerId,
      dto.description,
      dto.location,
      dto.maxParticipants,
    );

    const savedEvent = await this.eventRepository.create(event);
    return this.findById(savedEvent.id);
  }

async publish(id: string, userId: string, userRole: UserRole): Promise<Event> {
  const event = await this.findById(id);
  this.checkPermission(event, userId, userRole);
  
  event.publish();
  
  await this.eventRepository.update(event);
  return this.findById(id);
}

async cancel(id: string, userId: string, userRole: UserRole): Promise<Event> {
  const event = await this.findById(id);
  this.checkPermission(event, userId, userRole);
  
  event.cancel();
  
  await this.eventRepository.update(event);
  return this.findById(id);
}

async complete(id: string, userId: string, userRole: UserRole): Promise<Event> {
  const event = await this.findById(id);
  this.checkPermission(event, userId, userRole);
  
  event.complete();
  
  await this.eventRepository.update(event);
  return this.findById(id);
}

  async findById(id: string): Promise<Event> {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new NotFoundException('Evento não encontrado');
    }
    return event;
  }

  async findAll(filters?: EventFilters): Promise<Event[]> {
    return this.eventRepository.findAll(filters);
  }

  async findByOrganizer(organizerId: string): Promise<Event[]> {
    return this.eventRepository.findByOrganizer(organizerId);
  }

  async findMyEvents(userId: string): Promise<Event[]> {
    return this.eventRepository.findByParticipant(userId);
  }

  async update(
    id: string,
    dto: UpdateEventRequestDto,
    userId: string,
    userRole: UserRole,
  ): Promise<Event> {
    const event = await this.findById(id);

    this.checkPermission(event, userId, userRole);

    if (dto.title || dto.description !== undefined || dto.location !== undefined || dto.maxParticipants !== undefined) {
      event.updateDetails(
        dto.title,
        dto.description,
        dto.location,
        dto.maxParticipants,
      );
    }

    if (dto.startDate && dto.endDate) {
      event.updateDates(new Date(dto.startDate), new Date(dto.endDate));
    }

    if (dto.status) {
      this.updateStatus(event, dto.status);
    }

    await this.eventRepository.update(event);

    // Retorna o evento atualizado com relações
    return this.findById(id);
  }

  async delete(id: string, userId: string, userRole: UserRole): Promise<void> {
    const event = await this.findById(id);
    this.checkPermission(event, userId, userRole);
    await this.eventRepository.delete(id);
  }

  async join(eventId: string, userId: string): Promise<Event> {
    const event = await this.findById(eventId);
    const user = await this.usersService.findById(userId);

    event.addParticipant(user);

    await this.eventRepository.update(event);

    // Retorna o evento atualizado com relações
    return this.findById(eventId);
  }

  async leave(eventId: string, userId: string): Promise<Event> {
    const event = await this.findById(eventId);

    event.removeParticipant(userId);

    await this.eventRepository.update(event);

    // Retorna o evento atualizado com relações
    return this.findById(eventId);
  }

  private checkPermission(event: Event, userId: string, userRole: UserRole): void {
    if (userRole === UserRole.ADMIN) return;

    if (!event.isOrganizer(userId)) {
      throw new ForbiddenException('Apenas o organizador pode modificar o evento');
    }
  }

  private updateStatus(event: Event, status: EventStatus): void {
    switch (status) {
      case EventStatus.PUBLISHED:
        event.publish();
        break;
      case EventStatus.CANCELLED:
        event.cancel();
        break;
      case EventStatus.COMPLETED:
        event.complete();
        break;
    }
  }
}