import { Request, Response, NextFunction } from 'express';
import { ServerConfig } from '../types';

export class ApiKeyAuth {
  private validApiKeys: Map<string, string> = new Map();

  constructor(servers: ServerConfig[]) {
    servers.forEach(server => {
      this.validApiKeys.set(server.name, server.apiKey);
    });
  }

  validateApiKey = (req: Request, res: Response, next: NextFunction): void => {
    const apiKey = req.headers['x-api-key'] as string;
    const serverName = req.headers['x-server-name'] as string;

    if (!apiKey || !serverName) {
      res.status(401).json({
        success: false,
        message: 'Missing API key or server name',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const expectedApiKey = this.validApiKeys.get(serverName);
    
    if (!expectedApiKey || apiKey !== expectedApiKey) {
      res.status(401).json({
        success: false,
        message: 'Invalid API key',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Add server info to request for logging/debugging
    (req as any).sourceServer = serverName;
    next();
  };

  getApiKeyForServer = (serverName: string): string | undefined => {
    return this.validApiKeys.get(serverName);
  };
} 