const axios = require('axios');
const https = require('https');

// 创建一个允许自签名证书的HTTPS代理
const httpsAgent = new https.Agent({
  keepAlive: true,
  rejectUnauthorized: false
});

// 测试与SAP服务器的连接
async function testConnection() {
  try {
    const response = await axios.get('https://133.200.63.192:60275/sap/bc/adt/discovery', {
      httpsAgent,
      auth: {
        username: 'ji201',
        password: '1qaz!QAZ'
      },
      headers: {
        'x-csrf-token': 'fetch'
      },
      params: {
        'sap-client': '900',
        'sap-language': 'ZH'
      }
    });
    
    console.log('连接成功！');
    console.log('响应状态码:', response.status);
    console.log('响应头:', response.headers);
    console.log('响应体:', response.data);
  } catch (error) {
    console.error('连接失败:', error.message);
    if (error.response) {
      console.error('响应状态码:', error.response.status);
      console.error('响应头:', error.response.headers);
      console.error('响应体:', error.response.data);
    } else if (error.request) {
      console.error('请求没有收到响应:', error.request);
    }
  }
}

testConnection();