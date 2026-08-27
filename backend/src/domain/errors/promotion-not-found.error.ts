import { DomainError } from './domain.error';

export class PromotionNotFoundError extends DomainError {
  public readonly statusCode = 404;
  public readonly errorCode = 'PROMOTION_NOT_FOUND';

  constructor(idOrCode: string) {
    super(`Promotion with identifier '${idOrCode}' was not found.`);
  }
}
