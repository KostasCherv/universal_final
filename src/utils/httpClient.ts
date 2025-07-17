import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ApiResponse, InterServerRequest } from '../types';

export class HttpClient {
  private client: AxiosInstance;
  private apiKey: string;
  private serverName: string;

  constructor(baseURL: string, apiKey: string, serverName: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'x-server-name': serverName
      }
    });

    this.apiKey = apiKey;
    this.serverName = serverName;

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[${this.serverName}] Making request to: ${config.url}`);
        return config;
      },
      (error) => {
        console.error(`[${this.serverName}] Request error:`, error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[${this.serverName}] Response from ${response.config.url}: ${response.status}`);
        return response;
      },
      (error) => {
        console.error(`[${this.serverName}] Response error from ${error.config?.url}:`, error.response?.status, error.response?.data);
        return Promise.reject(error);
      }
    );
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async sendInterServerRequest<T = any>(targetServer: string): Promise<ApiResponse<T>> {
    const request: InterServerRequest = {
      from: this.serverName,
      to: targetServer,
    };

    return this.post('/inter-server', request);
  }

  private handleError(error: any): Error {
    if (error.response) {
      const message = error.response.data?.message || `HTTP ${error.response.status}`;
      return new Error(`Request failed: ${message}`);
    } else if (error.request) {
      return new Error('No response received from server');
    } else {
      return new Error(`Request error: ${error.message}`);
    }
  }
} 