import { DomainError } from './domain.error';

export class InvalidDateRangeError extends DomainError {
  public readonly statusCode = 400;
  public readonly errorCode = 'INVALID_DATE_RANGE';

  constructor(message = 'The promotion end date must be strictly after the start date.') {
    super(message);
  }
}
