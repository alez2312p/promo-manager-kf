import { PrismaClient } from '@prisma/client';
import { IProductRepository } from '../domain/product.repository.interface';
import { Product } from '../domain/product.entity';

export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toDomain(raw: any): Product {
    return new Product({
      id: raw.id,
      name: raw.name,
      sku: raw.sku,
      price: raw.price,
      categoryId: raw.categoryId,
      category: raw.category
        ? {
            id: raw.category.id,
            name: raw.category.name,
            description: raw.category.description,
            createdAt: new Date(raw.category.createdAt),
          }
        : null,
      createdAt: new Date(raw.createdAt),
      updatedAt: new Date(raw.updatedAt),
    });
  }

  async create(product: Product): Promise<Product> {
    const raw = await this.prisma.product.create({
      data: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        categoryId: product.categoryId,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
      include: {
        category: true,
      },
    });

    return this.toDomain(raw);
  }

  async findById(id: string): Promise<Product | null> {
    const raw = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!raw) return null;
    return this.toDomain(raw);
  }

  async findBySku(sku: string): Promise<Product | null> {
    const raw = await this.prisma.product.findUnique({
      where: { sku },
      include: {
        category: true,
      },
    });

    if (!raw) return null;
    return this.toDomain(raw);
  }

  async findAll(): Promise<Product[]> {
    const list = await this.prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: { name: 'asc' },
    });

    return list.map((item) => this.toDomain(item));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({
      where: { id },
    });
  }
}
