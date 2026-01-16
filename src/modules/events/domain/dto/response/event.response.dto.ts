import { Event } from '../../entities/event.entity';
import { EventStatus } from '../../enums/event-status.enum';
import { UserResponseDto } from '../../../../users/domain/dto/response/user.response.dto';

export class EventResponseDto {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startDate: Date;
  endDate: Date;
  maxParticipants: number | null;
  status: EventStatus;
  participantCount: number;
  isFullyBooked: boolean;
  organizer: UserResponseDto;
  participants: UserResponseDto[];
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(event: Event): EventResponseDto {
    const dto = new EventResponseDto();
    dto.id = event.id;
    dto.title = event.title;
    dto.description = event.description;
    dto.location = event.location;
    dto.startDate = event.startDate;
    dto.endDate = event.endDate;
    dto.maxParticipants = event.maxParticipants;
    dto.status = event.status;
    dto.participantCount = event.participantCount;
    dto.isFullyBooked = event.isFullyBooked;
    dto.organizer = UserResponseDto.fromEntity(event.organizer);
    dto.participants = event.participants.map(UserResponseDto.fromEntity);
    dto.createdAt = event.createdAt;
    dto.updatedAt = event.updatedAt;
    return dto;
  }
}