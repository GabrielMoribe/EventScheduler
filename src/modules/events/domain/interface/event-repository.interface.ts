import { Event } from '../entities/event.entity';
import { EventStatus } from '../enums/event-status.enum';

export const EVENT_REPOSITORY = Symbol('EVENT_REPOSITORY');

export abstract class IEventRepository {
  abstract create(event: Event): Promise<Event>;
  abstract findById(id: string): Promise<Event | null>;
  abstract findAll(filters?: EventFilters): Promise<Event[]>;
  abstract findByOrganizer(organizerId: string): Promise<Event[]>;
  abstract findByParticipant(userId: string): Promise<Event[]>;
  abstract update(event: Event): Promise<Event>;
  abstract delete(id: string): Promise<void>;
}

export interface EventFilters {
  status?: EventStatus;
  organizerId?: string;
  startDateFrom?: Date;
  startDateTo?: Date;
  search?: string;
}