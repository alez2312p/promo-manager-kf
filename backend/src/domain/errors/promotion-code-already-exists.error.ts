import { DomainError } from './domain.error';

export class PromotionCodeAlreadyExistsError extends DomainError {
  public readonly statusCode = 409;
  public readonly errorCode = 'PROMOTION_CODE_ALREADY_EXISTS';

  constructor(code: string) {
    super(`A promotion with code '${code}' already exists.`);
  }
}
