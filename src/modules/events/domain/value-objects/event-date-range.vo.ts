import { BadRequestException } from '@nestjs/common';

export class EventDateRange {
  private constructor(
    private readonly _startDate: Date,
    private readonly _endDate: Date,
  ) {}

  static create(startDate: Date, endDate: Date): EventDateRange {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Datas inválidas');
    }

    if (start < new Date()) {
      throw new BadRequestException('Data de início não pode ser no passado');
    }

    if (end <= start) {
      throw new BadRequestException('Data de término deve ser após a data de início');
    }

    return new EventDateRange(start, end);
  }

  get startDate(): Date {
    return this._startDate;
  }

  get endDate(): Date {
    return this._endDate;
  }

  get durationInHours(): number {
    const diffMs = this._endDate.getTime() - this._startDate.getTime();
    return Math.round(diffMs / (1000 * 60 * 60));
  }

  isOverlapping(other: EventDateRange): boolean {
    return this._startDate < other.endDate && this._endDate > other.startDate;
  }
}