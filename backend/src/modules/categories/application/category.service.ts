import { ICategoryRepository } from '../domain/category.repository.interface';
import { Category } from '../domain/category.entity';
import {
  CategoryNameAlreadyExistsError,
  CategoryNotFoundError,
} from '../domain/errors/category.errors';
import { CreateCategoryDTO, UpdateCategoryDTO } from './category.dto';

export class CategoryService {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async createCategory(dto: CreateCategoryDTO): Promise<Category> {
    const trimmedName = dto.name.trim();

    // Check if category name already exists
    const existing = await this.categoryRepository.findByName(trimmedName);
    if (existing) {
      throw new CategoryNameAlreadyExistsError(trimmedName);
    }

    const category = new Category({
      id: crypto.randomUUID(),
      name: trimmedName,
      description: dto.description?.trim() || null,
      createdAt: new Date(),
    });

    return await this.categoryRepository.create(category);
  }

  async getAllCategories(): Promise<Category[]> {
    return await this.categoryRepository.findAll();
  }

  async getCategoryById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new CategoryNotFoundError(id);
    }
    return category;
  }

  async updateCategory(id: string, dto: UpdateCategoryDTO): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new CategoryNotFoundError(id);
    }

    let updatedName = category.name;
    if (dto.name && dto.name.trim() !== category.name) {
      const trimmedName = dto.name.trim();
      const existing = await this.categoryRepository.findByName(trimmedName);
      if (existing && existing.id !== id) {
        throw new CategoryNameAlreadyExistsError(trimmedName);
      }
      updatedName = trimmedName;
    }

    const updatedCategory = new Category({
      id: category.id,
      name: updatedName,
      description:
        dto.description !== undefined
          ? dto.description?.trim() || null
          : category.description,
      createdAt: category.createdAt,
    });

    return await this.categoryRepository.update(updatedCategory);
  }

  async deleteCategory(
    id: string,
    reassignToCategoryId?: string | null
  ): Promise<void> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new CategoryNotFoundError(id);
    }

    if (reassignToCategoryId) {
      if (reassignToCategoryId === id) {
        throw new Error('No puedes reasignar productos a la misma categoría que estás eliminando');
      }
      const targetCategory = await this.categoryRepository.findById(reassignToCategoryId);
      if (!targetCategory) {
        throw new CategoryNotFoundError(reassignToCategoryId);
      }
    }

    await this.categoryRepository.delete(id, reassignToCategoryId || null);
  }
}
