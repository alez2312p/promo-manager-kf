import { ICategoryRepository } from '../domain/category.repository.interface';
import { Category } from '../domain/category.entity';
import {
  CategoryNameAlreadyExistsError,
  CategoryNotFoundError,
} from '../domain/errors/category.errors';
import { CreateCategoryDTO } from './category.dto';

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
}
