import fs from 'fs';
import path from 'path';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

// 日志级别优先级
const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

// 从环境变量获取日志级别
const getLogLevel = (): LogLevel => {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase() as LogLevel;
  return LOG_LEVELS[envLevel] !== undefined ? envLevel : 'info';
};

// 获取日志文件路径
const getLogFilePath = (): string => {
  const logDir = process.env.LOG_DIR || './logs';
  // 确保日志目录存在
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  return path.join(logDir, `mcp-abap-${new Date().toISOString().split('T')[0]}.log`);
};

// 当前日志级别
const currentLogLevel = getLogLevel();
// 日志文件路径
const logFilePath = getLogFilePath();

export function createLogger(name: string) {
  return {
    error: (message: string, meta?: Record<string, unknown>) => 
      log('error', name, message, meta),
    warn: (message: string, meta?: Record<string, unknown>) => 
      log('warn', name, message, meta),
    info: (message: string, meta?: Record<string, unknown>) => 
      log('info', name, message, meta),
    debug: (message: string, meta?: Record<string, unknown>) => 
      log('debug', name, message, meta)
  };
}

function log(level: LogLevel, name: string, message: string, meta?: Record<string, unknown>) {
  // 检查日志级别
  if (LOG_LEVELS[level] > LOG_LEVELS[currentLogLevel]) {
    return;
  }
  
  const timestamp = new Date().toISOString();
  const logParts = [`[${timestamp}] [${level}] [${name}] ${message}`];
  
  if (meta) {
    const metaString = Object.entries(meta)
      .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
      .join(' ');
    logParts.push(metaString);
  }
  
  const logString = logParts.join(' ') + '\n';
  
  // 将日志写入文件
  try {
    fs.appendFileSync(logFilePath, logString);
  } catch (error) {
    // 如果文件写入失败，降级到控制台输出
    console.error(JSON.stringify({
      message: 'Log Error: Failed to write to log file',
      error: error
    }));
    console.error(JSON.stringify({
      message: 'Failed log entry',
      logString: logString
    }));
  }
}

export type Logger = ReturnType<typeof createLogger>;
