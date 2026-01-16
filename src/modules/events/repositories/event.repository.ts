import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, FindOptionsWhere } from 'typeorm';
import { Event } from '../domain/entities/event.entity';
import {
  IEventRepository,
  EventFilters,
} from '../domain/interface/event-repository.interface';

@Injectable()
export class EventRepository implements IEventRepository {
  constructor(
    @InjectRepository(Event)
    private readonly repository: Repository<Event>,
  ) {}

  async create(event: Event): Promise<Event> {
    return this.repository.save(event);
  }

  async findById(id: string): Promise<Event | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findAll(filters?: EventFilters): Promise<Event[]> {
    const where: FindOptionsWhere<Event> = {};

    if (filters?.status) {
      (where as any)._status = filters.status;
    }

    if (filters?.organizerId) {
      (where as any)._organizerId = filters.organizerId;
    }

    if (filters?.startDateFrom && filters?.startDateTo) {
      (where as any)._startDate = Between(filters.startDateFrom, filters.startDateTo);
    }

    if (filters?.search) {
      (where as any)._title = Like(`%${filters.search}%`);
    }

    return this.repository.find({
      where,
      order: { _startDate: 'ASC' } as any,
    });
  }

  async findByOrganizer(organizerId: string): Promise<Event[]> {
    return this.repository.find({
      where: { _organizerId: organizerId } as any,
      order: { _startDate: 'ASC' } as any,
    });
  }

  async findByParticipant(userId: string): Promise<Event[]> {
    return this.repository
      .createQueryBuilder('event')
      .innerJoin('event._participants', 'participant')
      .where('participant.id = :userId', { userId })
      .orderBy('event._startDate', 'ASC')
      .getMany();
  }

  async update(event: Event): Promise<Event> {
    return this.repository.save(event);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}