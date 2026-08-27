import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PromotionService } from '../../src/application/services/promotion.service';
import {
  IPromotionRepository,
  PromotionFilters,
} from '../../src/domain/repositories/promotion.repository.interface';
import {
  Promotion,
  PromotionStatus,
} from '../../src/domain/entities/promotion.entity';
import {
  InvalidDateRangeError,
  InvalidDiscountValueError,
  PromotionCannotBeDeletedError,
  PromotionCannotBeModifiedError,
  PromotionCodeAlreadyExistsError,
  PromotionNotFoundError,
} from '../../src/domain/errors';

/**
 * In-Memory Mock Implementation of IPromotionRepository for Unit Tests
 */
class InMemoryPromotionRepository implements IPromotionRepository {
  public promotions: Map<string, Promotion> = new Map();

  async create(promotion: Promotion): Promise<Promotion> {
    this.promotions.set(promotion.id, promotion);
    return promotion;
  }

  async findById(id: string): Promise<Promotion | null> {
    return this.promotions.get(id) ?? null;
  }

  async findByCode(code: string): Promise<Promotion | null> {
    for (const promo of this.promotions.values()) {
      if (promo.code === code) {
        return promo;
      }
    }
    return null;
  }

  async findAll(filters?: PromotionFilters): Promise<Promotion[]> {
    let result = Array.from(this.promotions.values());
    if (filters?.status) {
      result = result.filter((p) => p.status === filters.status);
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(
        (p) => p.code.toLowerCase().includes(s) || p.name.toLowerCase().includes(s)
      );
    }
    return result;
  }

  async update(promotion: Promotion): Promise<Promotion> {
    this.promotions.set(promotion.id, promotion);
    return promotion;
  }

  async delete(id: string): Promise<void> {
    this.promotions.delete(id);
  }

  async countByStatus(status: PromotionStatus): Promise<number> {
    return Array.from(this.promotions.values()).filter(
      (p) => p.status === status
    ).length;
  }

  async findActiveBetweenDates(nowUTC: Date): Promise<Promotion[]> {
    const time = nowUTC.getTime();
    return Array.from(this.promotions.values()).filter(
      (p) =>
        p.status === 'ACTIVE' &&
        p.startDate.getTime() <= time &&
        p.endDate.getTime() >= time
    );
  }
}

describe('PromotionService (Unit Tests)', () => {
  let repository: InMemoryPromotionRepository;
  let service: PromotionService;

  beforeEach(() => {
    repository = new InMemoryPromotionRepository();
    service = new PromotionService(repository);
  });

  describe('1. Create Promotion (Domain Rules)', () => {
    it('should successfully create a valid percentage promotion with SCHEDULED status', async () => {
      const startDate = new Date(Date.now() + 1000 * 60 * 60); // In 1 hour
      const endDate = new Date(Date.now() + 1000 * 60 * 60 * 24); // In 24 hours

      const result = await service.createPromotion({
        code: 'SUMMER2026',
        name: 'Summer Promo',
        type: 'PERCENTAGE',
        value: 20,
        startDate,
        endDate,
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.code).toBe('SUMMER2026');
      expect(result.status).toBe('SCHEDULED');
      expect(result.value).toBe(20);
    });

    it('should throw InvalidDateRangeError if endDate is equal to or before startDate', async () => {
      const now = new Date();
      const earlier = new Date(now.getTime() - 10000);

      await expect(
        service.createPromotion({
          code: 'BAD_DATES',
          name: 'Invalid Dates Promo',
          type: 'PERCENTAGE',
          value: 10,
          startDate: now,
          endDate: earlier,
        })
      ).rejects.toThrow(InvalidDateRangeError);
    });

    it('should throw InvalidDiscountValueError if PERCENTAGE value is less than 1', async () => {
      const startDate = new Date();
      const endDate = new Date(Date.now() + 100000);

      await expect(
        service.createPromotion({
          code: 'ZERO_PCT',
          name: 'Zero Percent Promo',
          type: 'PERCENTAGE',
          value: 0,
          startDate,
          endDate,
        })
      ).rejects.toThrow(InvalidDiscountValueError);
    });

    it('should throw InvalidDiscountValueError if PERCENTAGE value is greater than 100', async () => {
      const startDate = new Date();
      const endDate = new Date(Date.now() + 100000);

      await expect(
        service.createPromotion({
          code: 'OVER_PCT',
          name: 'Over 100 Percent Promo',
          type: 'PERCENTAGE',
          value: 105,
          startDate,
          endDate,
        })
      ).rejects.toThrow(InvalidDiscountValueError);
    });

    it('should throw InvalidDiscountValueError if FIXED_AMOUNT value is <= 0', async () => {
      const startDate = new Date();
      const endDate = new Date(Date.now() + 100000);

      await expect(
        service.createPromotion({
          code: 'ZERO_FIXED',
          name: 'Zero Fixed Promo',
          type: 'FIXED_AMOUNT',
          value: 0,
          startDate,
          endDate,
        })
      ).rejects.toThrow(InvalidDiscountValueError);
    });

    it('should throw PromotionCodeAlreadyExistsError when attempting to register a duplicate code', async () => {
      const startDate = new Date();
      const endDate = new Date(Date.now() + 100000);

      await service.createPromotion({
        code: 'DUPLICATE_CODE',
        name: 'First Promo',
        type: 'PERCENTAGE',
        value: 15,
        startDate,
        endDate,
      });

      await expect(
        service.createPromotion({
          code: 'duplicate_code', // should normalize to upper case
          name: 'Second Promo',
          type: 'PERCENTAGE',
          value: 25,
          startDate,
          endDate,
        })
      ).rejects.toThrow(PromotionCodeAlreadyExistsError);
    });
  });

  describe('2. Update Promotion Status (SCHEDULED -> ACTIVE -> FINISHED)', () => {
    it('should allow updating status from SCHEDULED to ACTIVE and then to FINISHED', async () => {
      const promo = await service.createPromotion({
        code: 'STATUS_TEST',
        name: 'Status Workflow Test',
        type: 'PERCENTAGE',
        value: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 100000),
      });

      // SCHEDULED -> ACTIVE
      const activePromo = await service.updatePromotionStatus(promo.id, {
        status: 'ACTIVE',
      });
      expect(activePromo.status).toBe('ACTIVE');

      // ACTIVE -> FINISHED
      const finishedPromo = await service.updatePromotionStatus(promo.id, {
        status: 'FINISHED',
      });
      expect(finishedPromo.status).toBe('FINISHED');
    });

    it('should throw PromotionCannotBeModifiedError if trying to change status when already FINISHED', async () => {
      const promo = await service.createPromotion({
        code: 'FINISHED_TEST',
        name: 'Finished Test',
        type: 'PERCENTAGE',
        value: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 100000),
      });

      // Move to FINISHED
      await service.updatePromotionStatus(promo.id, { status: 'FINISHED' });

      // Attempt to modify after finished
      await expect(
        service.updatePromotionStatus(promo.id, { status: 'ACTIVE' })
      ).rejects.toThrow(PromotionCannotBeModifiedError);
    });

    it('should throw PromotionNotFoundError when updating status of non-existing promotion', async () => {
      await expect(
        service.updatePromotionStatus('non-existent-id', { status: 'ACTIVE' })
      ).rejects.toThrow(PromotionNotFoundError);
    });
  });

  describe('3. Update Promotion Fields', () => {
    it('should allow modifying fields when promotion is not in FINISHED status', async () => {
      const promo = await service.createPromotion({
        code: 'UPDATE_TEST',
        name: 'Original Name',
        type: 'PERCENTAGE',
        value: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 100000),
      });

      const updated = await service.updatePromotion(promo.id, {
        name: 'Updated Name',
        value: 30,
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.value).toBe(30);
    });

    it('should throw PromotionCannotBeModifiedError if modifying fields of a FINISHED promotion', async () => {
      const promo = await service.createPromotion({
        code: 'FINISHED_UPDATE',
        name: 'Finished Promo',
        type: 'PERCENTAGE',
        value: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 100000),
      });

      await service.updatePromotionStatus(promo.id, { status: 'FINISHED' });

      await expect(
        service.updatePromotion(promo.id, { name: 'New Name' })
      ).rejects.toThrow(PromotionCannotBeModifiedError);
    });
  });

  describe('4. Delete Promotion Rules', () => {
    it('should delete a promotion successfully if status is SCHEDULED', async () => {
      const promo = await service.createPromotion({
        code: 'DELETE_OK',
        name: 'To Delete',
        type: 'PERCENTAGE',
        value: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 100000),
      });

      expect(promo.status).toBe('SCHEDULED');
      await service.deletePromotion(promo.id);

      await expect(service.getPromotionById(promo.id)).rejects.toThrow(
        PromotionNotFoundError
      );
    });

    it('should throw PromotionCannotBeDeletedError if status is ACTIVE', async () => {
      const promo = await service.createPromotion({
        code: 'ACTIVE_NO_DELETE',
        name: 'Active Promo',
        type: 'PERCENTAGE',
        value: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 100000),
      });

      await service.updatePromotionStatus(promo.id, { status: 'ACTIVE' });

      await expect(service.deletePromotion(promo.id)).rejects.toThrow(
        PromotionCannotBeDeletedError
      );
    });

    it('should throw PromotionCannotBeDeletedError if status is FINISHED', async () => {
      const promo = await service.createPromotion({
        code: 'FINISHED_NO_DELETE',
        name: 'Finished Promo',
        type: 'PERCENTAGE',
        value: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 100000),
      });

      await service.updatePromotionStatus(promo.id, { status: 'FINISHED' });

      await expect(service.deletePromotion(promo.id)).rejects.toThrow(
        PromotionCannotBeDeletedError
      );
    });
  });

  describe('5. Metrics (Status counters & activeToday in UTC)', () => {
    it('should calculate counts by status and activeToday accurately', async () => {
      const now = new Date();
      const past = new Date(now.getTime() - 1000 * 60 * 60 * 48); // 2 days ago
      const future = new Date(now.getTime() + 1000 * 60 * 60 * 48); // In 2 days

      // 1. Scheduled promotion
      await service.createPromotion({
        code: 'PROMO_SCHED',
        name: 'Scheduled Promo',
        type: 'PERCENTAGE',
        value: 10,
        startDate: new Date(now.getTime() + 1000 * 60 * 60),
        endDate: future,
      });

      // 2. Active promotion running today
      const p2 = await service.createPromotion({
        code: 'PROMO_ACT1',
        name: 'Active Promo 1',
        type: 'PERCENTAGE',
        value: 15,
        startDate: new Date(now.getTime() - 1000 * 60 * 10),
        endDate: future,
      });
      await service.updatePromotionStatus(p2.id, { status: 'ACTIVE' });

      // 3. Active promotion that is already in the past (out of date window)
      const p3 = await service.createPromotion({
        code: 'PROMO_ACT_PAST',
        name: 'Active Promo Past',
        type: 'PERCENTAGE',
        value: 20,
        startDate: new Date(past.getTime() - 100000),
        endDate: past,
      });
      await service.updatePromotionStatus(p3.id, { status: 'ACTIVE' });

      // 4. Finished promotion
      const p4 = await service.createPromotion({
        code: 'PROMO_FIN',
        name: 'Finished Promo',
        type: 'PERCENTAGE',
        value: 25,
        startDate: past,
        endDate: future,
      });
      await service.updatePromotionStatus(p4.id, { status: 'FINISHED' });

      const metrics = await service.getMetrics();

      expect(metrics.totalByStatus.SCHEDULED).toBe(1);
      expect(metrics.totalByStatus.ACTIVE).toBe(2);
      expect(metrics.totalByStatus.FINISHED).toBe(1);
      expect(metrics.activeToday).toBe(1); // Only p2 is active and has valid UTC date range today
    });
  });
});
