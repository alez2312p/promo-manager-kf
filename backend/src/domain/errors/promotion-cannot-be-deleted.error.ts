import { DomainError } from './domain.error';

export class PromotionCannotBeDeletedError extends DomainError {
  public readonly statusCode = 422;
  public readonly errorCode = 'PROMOTION_CANNOT_BE_DELETED';

  constructor(message = 'Only promotions in SCHEDULED status can be deleted.') {
    super(message);
  }
}
