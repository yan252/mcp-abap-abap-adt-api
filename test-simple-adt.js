const { ADTClient } = require('abap-adt-api');
const https = require('https');
const axios = require('axios');

// 配置axios全局设置
axios.defaults.httpsAgent = new https.Agent({
  keepAlive: true,
  rejectUnauthorized: false
});

// 配置环境变量
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// 创建ADT客户端
async function testADTLogin() {
  try {
    console.log('正在创建ADT客户端...');
    
    const adtClient = new ADTClient(
      'https://133.200.63.192:60275',
      'ji201',
      '1qaz!QAZ',
      '900',
      'ZH'
    );
    
    console.log('ADT客户端已创建，正在尝试登录...');
    
    const loginResult = await adtClient.login();
    
    console.log('登录成功！');
    console.log('登录结果:', loginResult);
    
    return loginResult;
  } catch (error) {
    console.error('登录失败:', error.message);
    console.error('错误堆栈:', error.stack);
    return null;
  }
}

testADTLogin();