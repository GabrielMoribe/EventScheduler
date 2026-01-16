import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { EventStatus } from '../enums/event-status.enum';
import { EventDateRange } from '../value-objects/event-date-range.vo';
import { User } from '../../../users/domain/entities/user.entity';
import { BadRequestException } from '@nestjs/common';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'title', type: 'varchar', length: 255 })
  private _title: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  private _description: string | null;

  @Column({ name: 'location', type: 'varchar', length: 255, nullable: true })
  private _location: string | null;

  @Column({ name: 'start_date', type: 'timestamp' })
  private _startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp' })
  private _endDate: Date;

  @Column({ name: 'max_participants', type: 'int', nullable: true })
  private _maxParticipants: number | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.DRAFT,
  })
  private _status: EventStatus;

  @Column({ name: 'organizer_id', type: 'uuid' })
  private _organizerId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'organizer_id' })
  private _organizer: User;

  @ManyToMany(() => User, { eager: true })
  @JoinTable({
    name: 'event_participants',
    joinColumn: { name: 'event_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  private _participants: User[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Getters
  get title(): string {
    return this._title;
  }

  get description(): string | null {
    return this._description;
  }

  get location(): string | null {
    return this._location;
  }

  get startDate(): Date {
    return this._startDate;
  }

  get endDate(): Date {
    return this._endDate;
  }

  get maxParticipants(): number | null {
    return this._maxParticipants;
  }

  get status(): EventStatus {
    return this._status;
  }

  get organizerId(): string {
    return this._organizerId;
  }

  get organizer(): User {
    return this._organizer;
  }

  get participants(): User[] {
    return this._participants || [];
  }

  get participantCount(): number {
    return this._participants?.length || 0;
  }

  get isFullyBooked(): boolean {
    if (!this._maxParticipants) return false;
    return this.participantCount >= this._maxParticipants;
  }

  get dateRange(): EventDateRange {
    return EventDateRange.create(this._startDate, this._endDate);
  }

  // Factory method
  static create(
    title: string,
    startDate: Date,
    endDate: Date,
    organizerId: string,
    description?: string,
    location?: string,
    maxParticipants?: number,
  ): Event {
    // Valida as datas usando o Value Object
    EventDateRange.create(startDate, endDate);

    const event = new Event();
    event._title = title;
    event._description = description || null;
    event._location = location || null;
    event._startDate = startDate;
    event._endDate = endDate;
    event._maxParticipants = maxParticipants || null;
    event._status = EventStatus.DRAFT;
    event._organizerId = organizerId;
    event._participants = [];

    return event;
  }

  // Domain methods
  updateDetails(
    title?: string,
    description?: string,
    location?: string,
    maxParticipants?: number,
  ): void {
    if (this._status === EventStatus.CANCELLED) {
      throw new BadRequestException('Não é possível atualizar evento cancelado');
    }

    if (title) this._title = title;
    if (description !== undefined) this._description = description;
    if (location !== undefined) this._location = location;
    if (maxParticipants !== undefined) {
      if (maxParticipants < this.participantCount) {
        throw new BadRequestException(
          'Limite de participantes não pode ser menor que o número atual',
        );
      }
      this._maxParticipants = maxParticipants;
    }
  }

  updateDates(startDate: Date, endDate: Date): void {
    if (this._status === EventStatus.CANCELLED) {
      throw new BadRequestException('Não é possível atualizar evento cancelado');
    }

    // Valida as novas datas
    EventDateRange.create(startDate, endDate);

    this._startDate = startDate;
    this._endDate = endDate;
  }

  publish(): void {
    if (this._status !== EventStatus.DRAFT) {
      throw new BadRequestException('Apenas eventos em rascunho podem ser publicados');
    }
    this._status = EventStatus.PUBLISHED;
  }

  cancel(): void {
    if (this._status === EventStatus.COMPLETED) {
      throw new BadRequestException('Não é possível cancelar evento finalizado');
    }
    if (this._status === EventStatus.CANCELLED) {
      throw new BadRequestException('Evento já está cancelado');
    }
    this._status = EventStatus.CANCELLED;
  }

  complete(): void {
    if (this._status !== EventStatus.PUBLISHED) {
      throw new BadRequestException('Apenas eventos publicados podem ser finalizados');
    }
    this._status = EventStatus.COMPLETED;
  }

  addParticipant(user: User): void {
    if (this._status !== EventStatus.PUBLISHED) {
      throw new BadRequestException('Só é possível participar de eventos publicados');
    }

    if (this.isFullyBooked) {
      throw new BadRequestException('Evento lotado');
    }

    if (this._participants.some((p) => p.id === user.id)) {
      throw new BadRequestException('Usuário já é participante');
    }

    if (this._organizerId === user.id) {
      throw new BadRequestException('Organizador não pode ser participante');
    }

    this._participants.push(user);
  }

  removeParticipant(userId: string): void {
    if (this._status === EventStatus.COMPLETED) {
      throw new BadRequestException('Não é possível sair de evento finalizado');
    }

    const index = this._participants.findIndex((p) => p.id === userId);
    if (index === -1) {
      throw new BadRequestException('Usuário não é participante');
    }

    this._participants.splice(index, 1);
  }

  isOrganizer(userId: string): boolean {
    return this._organizerId === userId;
  }

  isParticipant(userId: string): boolean {
    return this._participants.some((p) => p.id === userId);
  }
}