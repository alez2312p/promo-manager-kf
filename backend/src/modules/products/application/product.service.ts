import { IProductRepository } from '../domain/product.repository.interface';
import { ICategoryRepository } from '../../categories/domain/category.repository.interface';
import { Product } from '../domain/product.entity';
import {
  InvalidProductPriceError,
  ProductNotFoundError,
  ProductSkuAlreadyExistsError,
} from '../domain/errors/product.errors';
import { CategoryNotFoundError } from '../../categories/domain/errors/category.errors';
import { CreateProductDTO } from './product.dto';

export class ProductService {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly categoryRepository?: ICategoryRepository
  ) {}

  async createProduct(dto: CreateProductDTO): Promise<Product> {
    if (dto.price <= 0) {
      throw new InvalidProductPriceError();
    }

    const formattedSku = dto.sku.trim().toUpperCase();

    // Check SKU uniqueness
    const existingSku = await this.productRepository.findBySku(formattedSku);
    if (existingSku) {
      throw new ProductSkuAlreadyExistsError(formattedSku);
    }

    // Check Category existence if categoryRepository is provided
    if (this.categoryRepository) {
      const category = await this.categoryRepository.findById(dto.categoryId);
      if (!category) {
        throw new CategoryNotFoundError(dto.categoryId);
      }
    }

    const product = new Product({
      id: crypto.randomUUID(),
      name: dto.name.trim(),
      sku: formattedSku,
      price: dto.price,
      categoryId: dto.categoryId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await this.productRepository.create(product);
  }

  async getAllProducts(): Promise<Product[]> {
    return await this.productRepository.findAll();
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new ProductNotFoundError(id);
    }
    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new ProductNotFoundError(id);
    }
    await this.productRepository.delete(id);
  }
}
