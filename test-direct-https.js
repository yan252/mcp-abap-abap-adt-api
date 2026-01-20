const https = require('https');

// 配置选项
const options = {
  hostname: '133.200.63.192',
  port: 60275,
  path: '/sap/bc/adt/discovery',
  method: 'GET',
  auth: 'ji201:1qaz!QAZ',
  headers: {
    'x-csrf-token': 'fetch',
    'Content-Type': 'application/xml',
    'SAP-CLIENT': '900',
    'SAP-LANGUAGE': 'ZH'
  },
  // 禁用证书验证
  rejectUnauthorized: false,
  // 禁用主机名验证
  checkServerIdentity: () => {
    return undefined;
  }
};

console.log('正在发送直接HTTPS请求到SAP服务器...');

const req = https.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  console.log(`响应头: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('响应体:', data);
    console.log('请求成功！');
  });
});

req.on('error', (error) => {
  console.error('请求错误:', error);
});

req.end();