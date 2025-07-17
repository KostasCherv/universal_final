import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { servers } from './config/servers';
import { ApiKeyAuth } from './middleware/auth';
import { HttpClient } from './utils/httpClient';
import "./config/index"
import { 
  ApiResponse, 
  Product, 
  ProductSchema,
  ApiResponseSchema
} from './types';
import { createServer2Tables, seedServer2Data } from './database/schema';
import { ProductRepository } from './database/productRepository';
import { validateResponse } from './middleware/validation';

const app = express();
const serverConfig = servers[1]!; // server2
const auth = new ApiKeyAuth(servers);
const productRepository = new ProductRepository();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      server: serverConfig.name,
      status: 'healthy',
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  });
});

// Products endpoint
app.get('/products', async (req, res) => {
  try {
    const products = await productRepository.getAllProducts();
    const response: ApiResponse<{ products: Product[] }> = {
      success: true,
      data: { products },
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database error',
      timestamp: new Date().toISOString()
    });
  }
});

// Inter-server communication endpoint - simplified
app.post('/inter-server', 
  auth.validateApiKey, 
  async (req, res) => {
    try {
      console.log(`[${serverConfig.name}] Received inter-server request`);
      
      // Simulate processing delay (1-50 seconds)
      const delay = Math.floor(Math.random() * 50000) + 1000;
      console.log(`[${serverConfig.name}] Processing request for ${delay}ms delay`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Get products from database
      const products = await productRepository.getAllProducts();
      
      const response: ApiResponse<{ products: Product[] }> = {
        success: true,
        data: { products },
        message: 'Products retrieved successfully',
        timestamp: new Date().toISOString()
      };
      
      console.log(`[${serverConfig.name}] Returning ${products.length} products after ${delay}ms delay`);
      res.json(response);
    } catch (error) {
      console.error(`[${serverConfig.name}] Error processing request:`, error);
      res.status(500).json({
        success: false,
        message: 'Database error',
        timestamp: new Date().toISOString()
      });
    }
  }
);

// Initialize database and start server
const initializeServer = async () => {
  try {
    await createServer2Tables();
    await seedServer2Data();
    
    app.listen(serverConfig.port, () => {
      console.log(`[${serverConfig.name}] Server running on port ${serverConfig.port}`);
      console.log(`[${serverConfig.name}] Health check: http://localhost:${serverConfig.port}/health`);
      console.log(`[${serverConfig.name}] Products API: http://localhost:${serverConfig.port}/products`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
};

initializeServer();