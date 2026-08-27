import { DomainError } from './domain.error';

export class InvalidDiscountValueError extends DomainError {
  public readonly statusCode = 400;
  public readonly errorCode = 'INVALID_DISCOUNT_VALUE';

  constructor(message = 'Percentage discount value must be between 1 and 100.') {
    super(message);
  }
}
