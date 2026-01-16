import { Event } from '../../entities/event.entity';
import { EventResponseDto } from './event.response.dto';

export class EventListResponseDto {
  events: EventResponseDto[];
  total: number;

  static fromEntities(events: Event[]): EventListResponseDto {
    const dto = new EventListResponseDto();
    dto.events = events.map(EventResponseDto.fromEntity);
    dto.total = events.length;
    return dto;
  }
}