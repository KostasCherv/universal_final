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
  ApiResponseSchema,
  Task,
  TaskSchema
} from './types';
import { z } from 'zod';
import { createServer1Tables, seedServer1Data } from './database/schema';
import { UserRepository } from './database/userRepository';
import { TaskRepository } from './database/taskRepository';
import { validateRequest, validateResponse } from './middleware/validation';

const app = express();
const serverConfig = servers[0]!; // server1
const auth = new ApiKeyAuth(servers);
const userRepository = new UserRepository();
const taskRepository = new TaskRepository();

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




// Task management endpoints
app.post('/tasks', 
  validateResponse(ApiResponseSchema(TaskSchema)),
  async (req, res) => {
    try {
      // Create task in database
      const task = await taskRepository.createTask();
      
      // Return task ID immediately
      const response: ApiResponse<Task> = {
        success: true,
        data: task,
        message: 'Task created successfully. Use task ID to check status.',
        timestamp: new Date().toISOString()
      };
      res.status(201).json(response);
      
      // Process task in background
      processTaskInBackground(task.id);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create task',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }); 
    }
  }
);

// Background task processing function
async function processTaskInBackground(taskId: string) {
  try {
    // Update task state to processing
    await taskRepository.updateTask(taskId, { state: 'processing' });
    
    // Send request to Server 2 for processing
    const server2 = new HttpClient(servers[1]!.url, servers[1]!.apiKey, servers[1]!.name);
    const serverResponse = await server2.post('/inter-server', { 
      from: serverConfig.name,
      to: 'server2'
    });
    
    // Update task based on Server 2 response
    if (serverResponse.success) {
      await taskRepository.updateTask(taskId, { 
        state: 'completed', 
        result: serverResponse.data
      });
      console.log(`[${serverConfig.name}] Task ${taskId} completed successfully`);
    } else {
      await taskRepository.updateTask(taskId, { 
        state: 'failed', 
        error: serverResponse.message 
      });
      console.log(`[${serverConfig.name}] Task ${taskId} failed: ${serverResponse.message}`);
    }
  } catch (error) {
    // If Server 2 is unavailable, mark task as failed
    await taskRepository.updateTask(taskId, { 
      state: 'failed', 
      error: 'Server 2 unavailable for processing' 
    });
    console.error(`[${serverConfig.name}] Task ${taskId} failed due to server error:`, error);
  }
}

app.get('/tasks/:id', 
  validateResponse(ApiResponseSchema(TaskSchema)),
  async (req, res) => {
    try {
      const task = await taskRepository.getTaskById(req.params.id!);

      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found',
          timestamp: new Date().toISOString()
        });
        return;
      }
      
      const response: ApiResponse<Task> = {
        success: true,
        data: task,
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Database error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);





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
    });

  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
};

initializeServer();