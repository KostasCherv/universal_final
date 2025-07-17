import { queryServer1, queryServer2 } from './dbConnection';

export const createServer1Tables = async () => {
  try {
    // Create users table in server1 database
    await queryServer1(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create tasks table in server1 database
    await queryServer1(`
      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(255) PRIMARY KEY,
        state VARCHAR(50) NOT NULL DEFAULT 'pending',
        result JSONB,
        error TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Server1 database tables created successfully');
  } catch (error) {
    console.error('Error creating server1 tables:', error);
    throw error;
  }
};

export const createServer2Tables = async () => {
  try {
    // Create products table in server2 database
    await queryServer2(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        description TEXT,
        stock INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Server2 database tables created successfully');
  } catch (error) {
    console.error('Error creating server2 tables:', error);
    throw error;
  }
};

export const seedServer1Data = async () => {
  try {
    // Check if users table is empty
    const userCount = await queryServer1('SELECT COUNT(*) FROM users');
    if (parseInt(userCount.rows[0].count) === 0) {
      await queryServer1(`
        INSERT INTO users (name, email) VALUES 
        ('John Doe', 'john@example.com'),
        ('Jane Smith', 'jane@example.com')
      `);
      console.log('Server1 users seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding server1 data:', error);
    throw error;
  }
};

export const seedServer2Data = async () => {
  try {
    // Check if products table is empty
    const productCount = await queryServer2('SELECT COUNT(*) FROM products');
    if (parseInt(productCount.rows[0].count) === 0) {
      await queryServer2(`
        INSERT INTO products (name, price, description, stock) VALUES 
        ('Laptop', 999.99, 'High-performance laptop', 10),
        ('Smartphone', 599.99, 'Latest smartphone model', 25),
        ('Headphones', 199.99, 'Wireless noise-canceling headphones', 50)
      `);
      console.log('Server2 products seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding server2 data:', error);
    throw error;
  }
}; 