import type { ToolDefinition } from "../types/tools";
import type { ADTClient } from "abap-adt-api";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { performance } from 'perf_hooks';
import { createLogger } from '../lib/logger';

enum CustomErrorCode {
  TooManyRequests = 429,
  InvalidParameters = 400
}

export abstract class BaseHandler {
  protected readonly adtclient: ADTClient;
  protected readonly logger = createLogger(this.constructor.name);
  private readonly rateLimiter = new Map<string, number>();
  private readonly metrics = {
    requestCount: 0,
    errorCount: 0,
    successCount: 0,
    totalTime: 0
  };

  constructor(adtclient: ADTClient) {
    this.adtclient = adtclient;
    // 包装ADT客户端方法以记录原始报文
    this.wrapAdtClientMethods();
  }

  private wrapAdtClientMethods(): void {
    // 获取ADT客户端的原型
    const prototype = Object.getPrototypeOf(this.adtclient);
    
    // 获取ADT客户端的所有方法名
    const methodNames = Object.getOwnPropertyNames(prototype)
      .filter(method => method !== 'constructor' && !method.startsWith('_') && method !== 'statelessClone');
    
    methodNames.forEach(methodName => {
      const method = methodName as keyof ADTClient;
      const originalMethod = this.adtclient[method];
      
      // 只包装函数类型的方法
      if (typeof originalMethod === 'function') {
        // 使用类型断言允许替换方法
        (this.adtclient as any)[method] = async (...args: any[]) => {
          try {
            // 记录请求参数
            this.logger.debug(`SAP ADT Request: ${methodName}`, {
              params: args
            });
            
            // 调用原始方法 - 使用类型断言确保TypeScript知道这是一个异步函数
            const result = await (originalMethod as (...args: any[]) => Promise<any>).apply(this.adtclient, args);
            
            // 记录响应结果
            this.logger.debug(`SAP ADT Response: ${methodName}`, {
              result: result
            });
            
            return result;
          } catch (error: any) {
            // 记录错误信息
            this.logger.error(`SAP ADT Error: ${methodName}`, {
              error: error.message,
              stack: error.stack,
              params: args
            });
            
            throw error;
          }
        };
      }
    });
  }

  protected trackRequest(startTime: number, success: boolean): void {
    const duration = performance.now() - startTime;
    this.metrics.requestCount++;
    this.metrics.totalTime += duration;
    
    if (success) {
      this.metrics.successCount++;
    } else {
      this.metrics.errorCount++;
    }

    this.logger.info('Request completed', {
      duration,
      success,
      metrics: this.getMetrics()
    });
  }

  protected checkRateLimit(ip: string): void {
    const now = Date.now();
    const lastRequest = this.rateLimiter.get(ip) || 0;
    
    if (now - lastRequest < 1000) { // 1 second rate limit
      this.logger.warn('Rate limit exceeded', { ip });
      throw new McpError(
        CustomErrorCode.TooManyRequests,
        'Rate limit exceeded. Please wait before making another request.'
      );
    }
    
    this.rateLimiter.set(ip, now);
  }

  protected getMetrics() {
    return {
      ...this.metrics,
      averageTime: this.metrics.requestCount > 0 
        ? this.metrics.totalTime / this.metrics.requestCount 
        : 0
    };
  }

  abstract getTools(): ToolDefinition[];
}
