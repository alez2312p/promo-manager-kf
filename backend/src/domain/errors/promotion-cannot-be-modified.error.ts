import { DomainError } from './domain.error';

export class PromotionCannotBeModifiedError extends DomainError {
  public readonly statusCode = 422;
  public readonly errorCode = 'PROMOTION_CANNOT_BE_MODIFIED';

  constructor(message = 'Promotions in FINISHED status cannot be modified.') {
    super(message);
  }
}
