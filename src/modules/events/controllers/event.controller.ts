import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Put,
  Patch,k
  Post,
  Query,
} from '@nestjs/common';
import { EventsService } from '../services/event.service';
import { CreateEventRequestDto } from '../domain/dto/request/create-event.request.dto';
import { UpdateEventRequestDto } from '../domain/dto/request/update-event.request.dto';
import { EventResponseDto } from '../domain/dto/response/event.response.dto';
import { EventListResponseDto } from '../domain/dto/response/event-list.response.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { User } from '../../users/domain/entities/user.entity';
import { UserRole } from '../../users/domain/enums/user-role.enum';
import { EventStatus } from '../domain/enums/event-status.enum';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateEventRequestDto,
    @CurrentUser() user: User,
  ): Promise<EventResponseDto> {
    const event = await this.eventsService.create(dto, user.id);
    return EventResponseDto.fromEntity(event);
  }

  @Patch(':id/publish')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @HttpCode(HttpStatus.OK)
  async publish(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<EventResponseDto> {
    const event = await this.eventsService.publish(id, user.id, user.role);
    return EventResponseDto.fromEntity(event);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @HttpCode(HttpStatus.OK)
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<EventResponseDto> {
    const event = await this.eventsService.cancel(id, user.id, user.role);
    return EventResponseDto.fromEntity(event);
  }

  @Patch(':id/complete')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @HttpCode(HttpStatus.OK)
  async complete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<EventResponseDto> {
    const event = await this.eventsService.complete(id, user.id, user.role);
    return EventResponseDto.fromEntity(event);
  }

  @Get()
  async findAll(
    @Query('status') status?: EventStatus,
    @Query('search') search?: string,
  ): Promise<EventListResponseDto> {
    const events = await this.eventsService.findAll({ status, search });
    return EventListResponseDto.fromEntities(events);
  }

  @Get('my-events')
  async findMyEvents(@CurrentUser() user: User): Promise<EventListResponseDto> {
    const events = await this.eventsService.findMyEvents(user.id);
    return EventListResponseDto.fromEntities(events);
  }

  @Get('organized')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  async findOrganized(@CurrentUser() user: User): Promise<EventListResponseDto> {
    const events = await this.eventsService.findByOrganizer(user.id);
    return EventListResponseDto.fromEntities(events);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<EventResponseDto> {
    const event = await this.eventsService.findById(id);
    return EventResponseDto.fromEntity(event);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEventRequestDto,
    @CurrentUser() user: User,
  ): Promise<EventResponseDto> {
    const event = await this.eventsService.update(id, dto, user.id, user.role);
    return EventResponseDto.fromEntity(event);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    await this.eventsService.delete(id, user.id, user.role);
  }

  @Post(':id/join')
  @HttpCode(HttpStatus.OK)
  async join(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<EventResponseDto> {
    const event = await this.eventsService.join(id, user.id);
    return EventResponseDto.fromEntity(event);
  }

  @Post(':id/leave')
  @HttpCode(HttpStatus.OK)
  async leave(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<EventResponseDto> {
    const event = await this.eventsService.leave(id, user.id);
    return EventResponseDto.fromEntity(event);
  }
}