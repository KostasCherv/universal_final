import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { servers } from './config/servers';
import { ApiKeyAuth } from './middleware/auth';
import { HttpClient } from './utils/httpClient';
import "./config/index"
import { 
  ApiResponse, 
  User, 
  InterServerRequestSchema,
  UserSchema,
  ApiResponseSchema
} from './types';
import { z } from 'zod';
import { createServer1Tables, seedServer1Data } from './database/schema';
import { UserRepository } from './database/userRepository';
import { validateRequest, validateResponse } from './middleware/validation';

const app = express();
const serverConfig = servers[0]!; // server1
const auth = new ApiKeyAuth(servers);
const userRepository = new UserRepository();

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
  validateResponse(ApiResponseSchema(z.object({ users: z.array(UserSchema) }))),
  async (req, res) => {
    try {
      const users = await userRepository.getAllUsers();
      const response: ApiResponse<{ users: User[] }> = {
        success: true,
        data: { users },
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
    await createServer1Tables();
    await seedServer1Data();
    
    app.listen(serverConfig.port, () => {
      console.log(`[${serverConfig.name}] Server running on port ${serverConfig.port}`);
      console.log(`[${serverConfig.name}] Health check: http://localhost:${serverConfig.port}/health`);
      console.log(`[${serverConfig.name}] Users API: http://localhost:${serverConfig.port}/users`);
      console.log(`[${serverConfig.name}] Inter-server test: http://localhost:${serverConfig.port}/test-inter-server`);
    });

    // call the server2
    setInterval(async () => {
      try {
        const server2 = new HttpClient(serverConfig.url, serverConfig.apiKey, serverConfig.name);
        const response = await server2.sendInterServerRequest('server2');
        console.log(`[${serverConfig.name}] Received response from server2: ${JSON.stringify(response.data)}`);
      } catch (error) {
        console.error(`[${serverConfig.name}] Error calling server2:`, error);
      }
    }, 10000);
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
};

initializeServer();