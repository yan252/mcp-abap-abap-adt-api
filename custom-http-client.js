const axios = require('axios');
const https = require('https');
const { fromError } = require('abap-adt-api');
const { toAxiosConfig, convertheaders } = require('abap-adt-api/build/AdtHTTP');

// 创建一个允许自签名证书的HTTPS代理
const httpsAgent = new https.Agent({
  keepAlive: true,
  rejectUnauthorized: false
});

class CustomHttpClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.axios = axios.create({
      baseURL,
      httpsAgent,
      rejectUnauthorized: false
    });
  }

  async request(options) {
    try {
      const config = toAxiosConfig(options);
      // 确保每个请求都使用正确的代理
      config.httpsAgent = httpsAgent;
      config.rejectUnauthorized = false;
      
      console.log('发送请求:', config.method, config.url);
      
      const response = await this.axios.request(config);
      
      console.log('收到响应:', response.status);
      
      const body = response.data ? (typeof response.data === 'string' ? response.data : `${response.data}`) : "";
      return {
        body,
        headers: convertheaders(response.headers),
        status: response.status,
        statusText: response.statusText
      };
    } catch (error) {
      console.error('请求错误:', error.message);
      if (error.response) {
        console.error('响应状态:', error.response.status);
        console.error('响应头:', error.response.headers);
        console.error('响应体:', error.response.data);
      }
      throw fromError(error);
    }
  }
}

module.exports = CustomHttpClient;