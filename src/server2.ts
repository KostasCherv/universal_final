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
  InterServerRequestSchema,
  ProductSchema,
  ApiResponseSchema
} from './types';
import { createServer2Tables, seedServer2Data } from './database/schema';
import { ProductRepository } from './database/productRepository';
import { validateRequest, validateResponse } from './middleware/validation';
import { z } from 'zod';

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

// Inter-server communication endpoint
app.post('/inter-server', 
  auth.validateApiKey, 
  validateRequest(InterServerRequestSchema),
  validateResponse(ApiResponseSchema(z.object({ products: z.array(ProductSchema) }))),
  async (req, res) => {
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
      console.log(`[${serverConfig.name}] Inter-server test: http://localhost:${serverConfig.port}/test-inter-server`);
    });

    // call the server1
    setInterval(async () => {
      try {
        const server1 = new HttpClient(serverConfig.url, serverConfig.apiKey, serverConfig.name);
        const response = await server1.sendInterServerRequest('server1');
        console.log(`[${serverConfig.name}] Received response from server1: ${JSON.stringify(response.data)}`);
      } catch (error) {
        console.error(`[${serverConfig.name}] Error calling server1:`, error);
      }
    }, 10000);
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
};

initializeServer();