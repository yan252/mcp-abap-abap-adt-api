const { spawn } = require('child_process');

// 创建一个简单的测试，通过stdio与MCP服务器通信
async function testLogin() {
  console.log('=== 测试通过MCP登录ABAP ===');
  
  // 启动MCP服务器
  const server = spawn('node', ['./dist/index.js'], {
    cwd: __dirname,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // 监听服务器输出
  server.stdout.on('data', (data) => {
    const output = data.toString().trim();
    console.log('服务器:', output);
    
    // 检查是否有错误信息
    if (output.includes('error') || output.includes('Error')) {
      console.error('❌ 服务器出现错误:', output);
      server.kill();
      process.exit(1);
    }
  });

  // 监听服务器错误
  server.stderr.on('data', (data) => {
    console.error('服务器错误:', data.toString());
    server.kill();
    process.exit(1);
  });

  // 等待服务器启动
  await new Promise((resolve) => {
    setTimeout(resolve, 2000);
  });

  console.log('\n✅ MCP服务器已启动，发送登录请求...');
  
  // 发送登录请求
  const loginRequest = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'callTool',
    params: {
      name: 'login',
      arguments: {}
    }
  });
  
  console.log('发送请求:', loginRequest);
  server.stdin.write(loginRequest + '\n');
  
  // 等待响应
  await new Promise((resolve) => {
    setTimeout(resolve, 5000);
  });
  
  console.log('\n✅ 登录请求已发送，检查结果...');
  
  // 发送登出请求
  const logoutRequest = JSON.stringify({
    jsonrpc: '2.0',
    id: 2,
    method: 'callTool',
    params: {
      name: 'logout',
      arguments: {}
    }
  });
  
  console.log('发送登出请求:', logoutRequest);
  server.stdin.write(logoutRequest + '\n');
  
  // 等待响应
  await new Promise((resolve) => {
    setTimeout(resolve, 3000);
  });
  
  // 终止服务器
  server.kill();
  console.log('\n🎉 测试完成！');
}

testLogin().catch(console.error);
