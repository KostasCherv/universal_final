import { queryServer1 } from './dbConnection';
import { User } from '../types';

export class UserRepository {
  async getAllUsers(): Promise<User[]> {
    const result = await queryServer1('SELECT * FROM users ORDER BY created_at DESC');
    return result.rows.map(row => ({
      id: row.id.toString(),
      name: row.name,
      email: row.email,
      createdAt: row.created_at
    }));
  }
} 