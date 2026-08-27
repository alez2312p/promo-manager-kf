import { DomainError } from '../../../../domain/errors/domain.error';

export class CategoryNotFoundError extends DomainError {
  public readonly statusCode = 404;
  public readonly errorCode = 'CATEGORY_NOT_FOUND';

  constructor(idOrName: string) {
    super(`Category '${idOrName}' was not found.`);
  }
}

export class CategoryNameAlreadyExistsError extends DomainError {
  public readonly statusCode = 409;
  public readonly errorCode = 'CATEGORY_NAME_ALREADY_EXISTS';

  constructor(name: string) {
    super(`A category with name '${name}' already exists.`);
  }
}
