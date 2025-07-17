import { queryServer2 } from './dbConnection';
import { Product } from '../types';

export class ProductRepository {
  async getAllProducts(): Promise<Product[]> {
    const result = await queryServer2('SELECT * FROM products ORDER BY created_at DESC');
    return result.rows.map(row => ({
      id: row.id.toString(),
      name: row.name,
      price: parseFloat(row.price),
      description: row.description,
      stock: row.stock
    }));
  }

  async getProductCount(): Promise<number> {
    const result = await queryServer2('SELECT COUNT(*) FROM products');
    return parseInt(result.rows[0].count);
  }
} 