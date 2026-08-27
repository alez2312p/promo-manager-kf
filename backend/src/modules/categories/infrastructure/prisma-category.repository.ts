import {
  PrismaClient,
  Prisma,
  Category as PrismaCategory,
} from '@prisma/client';
import { ICategoryRepository } from '../domain/category.repository.interface';
import { Category } from '../domain/category.entity';

type CategoryWithCount = PrismaCategory & {
  _count?: { products: number };
};

export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toDomain(raw: CategoryWithCount): Category {
    return new Category({
      id: raw.id,
      name: raw.name,
      description: raw.description,
      productsCount: raw._count?.products ?? 0,
      createdAt: new Date(raw.createdAt),
    });
  }

  async create(category: Category): Promise<Category> {
    const raw = await this.prisma.category.create({
      data: {
        id: category.id,
        name: category.name,
        description: category.description,
        createdAt: category.createdAt,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return this.toDomain(raw);
  }

  async findById(id: string): Promise<Category | null> {
    const raw = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!raw) return null;
    return this.toDomain(raw);
  }

  async findByName(name: string): Promise<Category | null> {
    const raw = await this.prisma.category.findUnique({
      where: { name },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!raw) return null;
    return this.toDomain(raw);
  }

  async findAll(): Promise<Category[]> {
    const list = await this.prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return list.map((item) => this.toDomain(item));
  }

  async update(category: Category): Promise<Category> {
    const raw = await this.prisma.category.update({
      where: { id: category.id },
      data: {
        name: category.name,
        description: category.description,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return this.toDomain(raw);
  }

  async delete(id: string, reassignToCategoryId?: string | null): Promise<void> {
    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Reassign or unassign all products belonging to this category
      await tx.product.updateMany({
        where: { categoryId: id },
        data: {
          categoryId: reassignToCategoryId || null,
        },
      });

      // 2. Unassign any promotions targeting this category
      await tx.promotion.updateMany({
        where: { categoryId: id },
        data: {
          categoryId: null,
        },
      });

      // 3. Delete the category
      await tx.category.delete({
        where: { id },
      });
    });
  }
}
