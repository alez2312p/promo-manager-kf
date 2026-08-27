import {
  PrismaClient,
  Prisma,
  Promotion as PrismaPromotion,
} from '@prisma/client';
import {
  IPromotionRepository,
  PromotionFilters,
} from '../../domain/repositories/promotion.repository.interface';
import {
  Promotion,
  PromotionStatus,
} from '../../domain/entities/promotion.entity';

export class PrismaPromotionRepository implements IPromotionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toDomain(raw: PrismaPromotion): Promotion {
    return new Promotion({
      id: raw.id,
      code: raw.code,
      name: raw.name,
      description: raw.description,
      type: raw.type as 'PERCENTAGE' | 'FIXED_AMOUNT',
      value: raw.value,
      minSpend: raw.minSpend,
      maxDiscount: raw.maxDiscount,
      startDate: new Date(raw.startDate),
      endDate: new Date(raw.endDate),
      usageLimit: raw.usageLimit,
      usageCount: raw.usageCount,
      status: raw.status as PromotionStatus,
      categoryId: raw.categoryId,
      productId: raw.productId,
      createdAt: new Date(raw.createdAt),
      updatedAt: new Date(raw.updatedAt),
    });
  }

  async create(promotion: Promotion): Promise<Promotion> {
    const raw = await this.prisma.promotion.create({
      data: {
        id: promotion.id,
        code: promotion.code,
        name: promotion.name,
        description: promotion.description,
        type: promotion.type,
        value: promotion.value,
        minSpend: promotion.minSpend,
        maxDiscount: promotion.maxDiscount,
        startDate: promotion.startDate,
        endDate: promotion.endDate,
        usageLimit: promotion.usageLimit,
        usageCount: promotion.usageCount,
        status: promotion.status,
        categoryId: promotion.categoryId || null,
        productId: promotion.productId || null,
        createdAt: promotion.createdAt,
        updatedAt: promotion.updatedAt,
      },
      include: {
        category: true,
        product: true,
      },
    });

    return this.toDomain(raw);
  }

  async findById(id: string): Promise<Promotion | null> {
    const raw = await this.prisma.promotion.findUnique({
      where: { id },
      include: {
        category: true,
        product: true,
      },
    });

    if (!raw) return null;
    return this.toDomain(raw);
  }

  async findByCode(code: string): Promise<Promotion | null> {
    const raw = await this.prisma.promotion.findUnique({
      where: { code },
      include: {
        category: true,
        product: true,
      },
    });

    if (!raw) return null;
    return this.toDomain(raw);
  }

  async findAll(filters?: PromotionFilters): Promise<Promotion[]> {
    const where: Prisma.PromotionWhereInput = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { code: { contains: filters.search, mode: 'insensitive' } },
        { name: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const list = await this.prisma.promotion.findMany({
      where,
      include: {
        category: true,
        product: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return list.map((item) => this.toDomain(item));
  }

  async update(promotion: Promotion): Promise<Promotion> {
    const raw = await this.prisma.promotion.update({
      where: { id: promotion.id },
      data: {
        name: promotion.name,
        description: promotion.description,
        type: promotion.type,
        value: promotion.value,
        minSpend: promotion.minSpend,
        maxDiscount: promotion.maxDiscount,
        startDate: promotion.startDate,
        endDate: promotion.endDate,
        usageLimit: promotion.usageLimit,
        usageCount: promotion.usageCount,
        status: promotion.status,
        categoryId: promotion.categoryId || null,
        productId: promotion.productId || null,
        updatedAt: promotion.updatedAt,
      },
      include: {
        category: true,
        product: true,
      },
    });

    return this.toDomain(raw);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.promotion.delete({
      where: { id },
    });
  }

  async countByStatus(status: PromotionStatus): Promise<number> {
    return await this.prisma.promotion.count({
      where: { status },
    });
  }

  async findActiveBetweenDates(nowUTC: Date): Promise<Promotion[]> {
    const rawList = await this.prisma.promotion.findMany({
      where: {
        status: 'ACTIVE',
        startDate: { lte: nowUTC },
        endDate: { gte: nowUTC },
      },
      include: {
        category: true,
        product: true,
      },
    });

    return rawList.map((item) => this.toDomain(item));
  }
}
