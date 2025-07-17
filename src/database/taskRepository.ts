import { queryServer1 } from './dbConnection';
import { Task, UpdateTask } from '../types';

export class TaskRepository {
  async createTask(): Promise<Task> {
    const id = this.generateTaskId();
    const now = new Date().toISOString();
    
    const result = await queryServer1(
      `INSERT INTO tasks (id, state, created_at, updated_at) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, 'pending', now, now]
    );
    
    const row = result.rows[0];
    return {
      id: row.id,
      state: row.state,
      result: row.result,
      error: row.error,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async getTaskById(id: string): Promise<Task | null> {
    const result = await queryServer1('SELECT * FROM tasks WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      state: row.state,
      result: row.result,
      error: row.error,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async updateTask(id: string, update: UpdateTask): Promise<Task | null> {
    const now = new Date().toISOString();
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (update.state !== undefined) {
      updates.push(`state = $${paramCount++}`);
      values.push(update.state);
    }

    if (update.result !== undefined) {
      updates.push(`result = $${paramCount++}`);
      values.push(JSON.stringify(update.result));
    }

    if (update.error !== undefined) {
      updates.push(`error = $${paramCount++}`);
      values.push(update.error);
    }

    updates.push(`updated_at = $${paramCount++}`);
    values.push(now);

    values.push(id);

    const result = await queryServer1(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      state: row.state,
      result: row.result,
      error: row.error,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }


  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 