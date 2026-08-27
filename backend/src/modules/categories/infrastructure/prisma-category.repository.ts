import { PrismaClient } from '@prisma/client';
import { ICategoryRepository } from '../domain/category.repository.interface';
import { Category } from '../domain/category.entity';

export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toDomain(raw: any): Category {
    return new Category({
      id: raw.id,
      name: raw.name,
      description: raw.description,
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
    });

    return this.toDomain(raw);
  }

  async findById(id: string): Promise<Category | null> {
    const raw = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!raw) return null;
    return this.toDomain(raw);
  }

  async findByName(name: string): Promise<Category | null> {
    const raw = await this.prisma.category.findUnique({
      where: { name },
    });

    if (!raw) return null;
    return this.toDomain(raw);
  }

  async findAll(): Promise<Category[]> {
    const list = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    return list.map((item) => this.toDomain(item));
  }
}
