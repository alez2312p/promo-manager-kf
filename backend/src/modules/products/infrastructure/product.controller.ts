import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../application/product.service';

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const products = await this.productService.getAllProducts();
      res.status(200).json({
        data: products.map((p) => p.toJSON()),
        count: products.length,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.productService.createProduct(req.body);
      res.status(201).json({
        message: 'Product created successfully',
        data: product.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.productService.getProductById(req.params.id);
      res.status(200).json({
        data: product.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.productService.updateProduct(
        req.params.id,
        req.body
      );
      res.status(200).json({
        message: 'Product updated successfully',
        data: product.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.productService.deleteProduct(req.params.id);
      res.status(200).json({
        message: 'Product deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
