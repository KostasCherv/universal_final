import { Pool, PoolConfig } from "pg";
import { baseConfig1, baseConfig2 } from "../config/databases";

class DatabaseConnection {
	private pools: Map<string, Pool> = new Map();
	private dbConfig: PoolConfig;

	constructor(dbConfig: PoolConfig) {
		this.dbConfig = dbConfig;
	}


  getPool(databaseName: string): Pool {
    if (!this.pools.has(databaseName)) {
      const config: PoolConfig = {
        ...this.dbConfig,
        database: databaseName,
      };
      
      const pool = new Pool(config);
      
      // Test the connection
      pool.on('connect', () => {
        console.log(`Connected to PostgreSQL database: ${databaseName}`);
      });

      pool.on('error', (err) => {
        console.error(`Unexpected error on idle client for ${databaseName}:`, err);
      });

      this.pools.set(databaseName, pool);
    }
    
    return this.pools.get(databaseName)!;
  }

  async query(databaseName: string,  text: string, params?: any[]) {
    const pool = this.getPool(databaseName);
    return pool.query(text, params);
  }

  async closeAll() {
    for (const [name, pool] of this.pools) {
      console.log(`Closing connection to ${name}`);
      await pool.end();
    }
    this.pools.clear();
  }
}

export const dbConnection1 = new DatabaseConnection(baseConfig1);
export const queryServer1 = (text: string, params?: any[]) => dbConnection1.query('postgres', text, params);

export const dbConnection2 = new DatabaseConnection(baseConfig2);
export const queryServer2 = (text: string, params?: any[]) => dbConnection2.query('postgres', text, params);