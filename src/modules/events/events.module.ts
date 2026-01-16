import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './domain/entities/event.entity';
import { EventsController } from './controllers/event.controller';
import { EventsService } from './services/event.service';
import { EventRepository } from './repositories/event.repository';
import { EVENT_REPOSITORY } from './domain/interface/event-repository.interface';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Event]), UsersModule],
  controllers: [EventsController],
  providers: [
    EventsService,
    {
      provide: EVENT_REPOSITORY,
      useClass: EventRepository,
    },
  ],
  exports: [EventsService],
})
export class EventsModule {}