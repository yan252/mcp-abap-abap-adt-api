import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosResponseHeaders } from 'axios';
import https from 'https';
import type { HttpClient } from 'abap-adt-api';

// 创建一个允许自签名证书的HTTPS代理
const httpsAgent = new https.Agent({
  keepAlive: true,
  rejectUnauthorized: false
});

// 定义HttpClientOptions和HttpClientResponse类型，与abap-adt-api保持一致
export interface HttpClientOptions {
  method?: string;
  url: string;
  headers?: Record<string, string>;
  qs?: Record<string, any>;
  body?: string;
  baseURL?: string;
  timeout?: number;
  auth?: { username: string; password: string };
  adtRequestNumber?: number;
  adtStartTime?: Date;
}

export interface HttpClientResponse {
  body: string;
  status: number;
  statusText: string;
  headers: any;
  request?: any;
}

export class CustomHttpClient implements HttpClient {
  private axios: AxiosInstance;

  constructor(baseURL: string) {
    this.axios = axios.create({
      baseURL,
      httpsAgent,
      validateStatus: () => true
    });
  }

  async request(options: HttpClientOptions): Promise<HttpClientResponse> {
    try {
      const config: AxiosRequestConfig = {
        method: options.method || 'GET',
        url: options.url,
        headers: options.headers,
        params: options.qs,
        data: options.body,
        baseURL: options.baseURL,
        timeout: options.timeout,
        auth: options.auth,
        httpsAgent,
        validateStatus: () => true
      };

      // 禁用调试日志，避免与MCP JSON-RPC格式冲突
      // console.log(JSON.stringify({
      //   message: '发送请求',
      //   method: config.method,
      //   url: config.url,
      //   headers: config.headers
      // }));

      const response: AxiosResponse = await this.axios.request(config);

      // 禁用调试日志，避免与MCP JSON-RPC格式冲突
      // console.log(JSON.stringify({
      //   message: '收到响应',
      //   status: response.status,
      //   headers: response.headers
      // }));


      const body = response.data ? (typeof response.data === 'string' ? response.data : `${response.data}`) : '';
      
      return {
        body,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        request: response.request
      };
    } catch (error: any) {
      const errorData: Record<string, any> = {
        message: '请求错误',
        error: error.message,
        stack: error.stack
      };
      
      if (error.response) {
        errorData.response = {
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data
        };
      }
      
      console.error(JSON.stringify(errorData));
      throw error;
    }
  }
}