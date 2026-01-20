const { ADTClient } = require('abap-adt-api');
const fs = require('fs');
const path = require('path');

// 读取.env文件
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    if (line.trim() && !line.trim().startsWith('#')) {
      const [key, value] = line.split('=').map(s => s.trim());
      if (key && value) {
        process.env[key] = value;
      }
    }
  });
}

// 强制禁用证书验证
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function testLogin() {
  try {
    console.log('正在连接到SAP系统...');
    console.log('URL:', process.env.SAP_URL);
    console.log('用户:', process.env.SAP_USER);
    console.log('客户端:', process.env.SAP_CLIENT);
    console.log('语言:', process.env.SAP_LANGUAGE);
    console.log('会话类型:', process.env.SAP_SESSION_TYPE);

    // 创建ADT客户端
    const client = new ADTClient(
      process.env.SAP_URL,
      process.env.SAP_USER,
      process.env.SAP_PASSWORD,
      process.env.SAP_CLIENT,
      process.env.SAP_LANGUAGE,
      {
        httpsAgent: {
          rejectUnauthorized: false
        }
      }
    );

    // 设置会话类型
    client.stateful = process.env.SAP_SESSION_TYPE === 'stateful' ? 'stateful' : 'stateless';

    console.log('正在登录...');
    await client.login();
    console.log('登录成功！');

    console.log('获取会话ID...');
    const sessionID = client.sessionID;
    console.log('会话ID:', sessionID);

    console.log('测试获取系统对象类型...');
    const objectTypes = await client.objectTypes();
    console.log('系统对象类型数量:', objectTypes.length);
    console.log('前5个对象类型:', objectTypes.slice(0, 5).map(t => t['adtcore:type']));

    console.log('正在登出...');
    await client.logout();
    console.log('登出成功！');

  } catch (error) {
    console.error('测试失败:', error);
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      response: error.response?.data,
      originalError: error.originalError
    });
  }
}

testLogin();
