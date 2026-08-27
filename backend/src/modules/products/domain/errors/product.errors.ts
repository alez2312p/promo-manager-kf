import { DomainError } from '../../../../domain/errors/domain.error';

export class ProductNotFoundError extends DomainError {
  public readonly statusCode = 404;
  public readonly errorCode = 'PRODUCT_NOT_FOUND';

  constructor(idOrSku: string) {
    super(`Product '${idOrSku}' was not found.`);
  }
}

export class ProductSkuAlreadyExistsError extends DomainError {
  public readonly statusCode = 409;
  public readonly errorCode = 'PRODUCT_SKU_ALREADY_EXISTS';

  constructor(sku: string) {
    super(`A product with SKU '${sku}' already exists.`);
  }
}

export class InvalidProductPriceError extends DomainError {
  public readonly statusCode = 400;
  public readonly errorCode = 'INVALID_PRODUCT_PRICE';

  constructor(message = 'Product price must be greater than 0.') {
    super(message);
  }
}
