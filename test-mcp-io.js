const { spawn } = require('child_process');

// 测试MCP服务器的登录功能
async function testMcpLogin() {
  try {
    console.log('=== 测试MCP服务器登录功能 ===');
    
    // 启动MCP服务器
    const server = spawn('node', ['./dist/index.js'], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // 存储服务器输出
    let serverOutput = '';
    let serverReady = false;

    // 监听服务器输出
    server.stdout.on('data', (data) => {
      const output = data.toString();
      serverOutput += output;
      console.log('服务器输出:', output);
      
      // 检查服务器是否已准备好
      if (output.includes('MCP ABAP ADT API server running on stdio') && !serverReady) {
        serverReady = true;
        console.log('\n✅ MCP服务器已准备好，发送登录请求...');
        
        // 发送登录请求
        const loginRequest = {
          jsonrpc: '2.0',
          id: 1,
          method: 'callTool',
          params: {
            name: 'login',
            arguments: {}
          }
        };
        
        server.stdin.write(JSON.stringify(loginRequest) + '\n');
      }
      
      // 检查是否收到登录响应
      if (output.includes('"id":1')) {
        try {
          // 解析响应
          const response = JSON.parse(output.trim());
          console.log('\n✅ 收到登录响应:', response);
          
          // 发送登出请求
          const logoutRequest = {
            jsonrpc: '2.0',
            id: 2,
            method: 'callTool',
            params: {
              name: 'logout',
              arguments: {}
            }
          };
          
          console.log('\n发送登出请求...');
          server.stdin.write(JSON.stringify(logoutRequest) + '\n');
        } catch (e) {
          console.log('响应解析失败:', e.message);
        }
      }
      
      // 检查是否收到登出响应
      if (output.includes('"id":2')) {
        try {
          // 解析响应
          const response = JSON.parse(output.trim());
          console.log('\n✅ 收到登出响应:', response);
          
          // 测试完成
          console.log('\n🎉 测试完成！');
          server.kill();
        } catch (e) {
          console.log('响应解析失败:', e.message);
        }
      }
    });

    // 监听服务器错误
    server.stderr.on('data', (data) => {
      console.error('服务器错误:', data.toString());
    });

    // 监听服务器退出
    server.on('close', (code) => {
      console.log(`\n服务器进程已退出，退出码: ${code}`);
    });

    // 等待服务器启动
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('服务器启动超时'));
      }, 30000);

      server.stdout.on('data', (data) => {
        if (data.toString().includes('MCP ABAP ADT API server running on stdio')) {
          clearTimeout(timeout);
          resolve();
        }
      });
    });

  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

testMcpLogin();
