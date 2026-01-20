const { Client } = require('@modelcontextprotocol/sdk/client');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio');
const { spawn } = require('child_process');

async function testMcpLogin() {
  try {
    console.log('正在启动MCP服务器...');
    
    // 启动MCP服务器
    const serverProcess = spawn('node', ['./dist/index.js'], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe', 'ipc']
    });

    // 等待服务器启动
    await new Promise((resolve) => {
      serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('服务器输出:', output);
        if (output.includes('MCP ABAP ADT API server running on stdio')) {
          resolve();
        }
      });
    });

    console.log('MCP服务器已启动，正在创建客户端连接...');

    // 创建MCP客户端
    const client = new Client(new StdioClientTransport(serverProcess.stdin, serverProcess.stdout));

    // 连接到服务器
    await client.connect();
    console.log('MCP客户端已连接到服务器');

    // 获取工具列表
    const tools = await client.listTools();
    console.log('可用工具数量:', tools.tools.length);
    console.log('登录相关工具:', tools.tools.filter(t => ['login', 'logout', 'dropSession'].includes(t.name)));

    // 调用登录工具
    console.log('正在调用登录工具...');
    const loginResult = await client.callTool('login', {});
    console.log('登录结果:', loginResult);

    // 调用登出工具
    console.log('正在调用登出工具...');
    const logoutResult = await client.callTool('logout', {});
    console.log('登出结果:', logoutResult);

    // 断开连接
    await client.disconnect();
    
    // 终止服务器进程
    serverProcess.kill();
    console.log('测试完成！');

  } catch (error) {
    console.error('测试失败:', error);
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
  }
}

testMcpLogin();
