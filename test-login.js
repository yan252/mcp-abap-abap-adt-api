const { ADTClient } = require('abap-adt-api');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '.env') });

// 强制禁用证书验证
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function testLogin() {
  try {
    console.log('=== 测试SAP登录功能 ===');
    console.log('系统URL:', process.env.SAP_URL);
    console.log('用户名:', process.env.SAP_USER);
    console.log('客户端:', process.env.SAP_CLIENT);
    console.log('语言:', process.env.SAP_LANGUAGE);
    console.log('会话类型:', process.env.SAP_SESSION_TYPE);

    // 创建ADT客户端
    const client = new ADTClient(
      process.env.SAP_URL,
      process.env.SAP_USER,
      process.env.SAP_PASSWORD,
      process.env.SAP_CLIENT,
      process.env.SAP_LANGUAGE
    );

    // 设置会话类型
    client.stateful = process.env.SAP_SESSION_TYPE === 'stateful' ? 'stateful' : 'stateless';

    console.log('\n1. 测试登录...');
    await client.login();
    console.log('✅ 登录成功！');

    console.log('\n2. 测试获取系统对象类型...');
    const objectTypes = await client.objectTypes();
    console.log('✅ 获取成功！系统对象类型数量:', objectTypes.length);

    console.log('\n3. 测试获取对象结构...');
    const objects = await client.searchObject('Z*', 'PROG', 10);
    console.log('✅ 获取成功！找到程序数量:', objects.length);
    if (objects.length > 0) {
      console.log('找到的程序:', objects.map(obj => obj['adtcore:name']));
    }

    console.log('\n4. 测试登出...');
    await client.logout().catch(err => {
      // 忽略登出错误，因为有时会话可能已经过期
      console.log('⚠️  登出时出现警告:', err.message);
    });
    console.log('✅ 测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
    }
    if (error.stack) {
      console.error('错误堆栈:', error.stack);
    }
    process.exit(1);
  }
}

testLogin();
