const { ADTClient } = require('abap-adt-api');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '.env') });

// 强制禁用证书验证
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function testDirectLogin() {
  try {
    console.log('=== 直接测试ABAP登录功能 ===');
    console.log('系统URL:', process.env.SAP_URL);
    console.log('用户名:', process.env.SAP_USER);
    console.log('客户端:', process.env.SAP_CLIENT);
    console.log('语言:', process.env.SAP_LANGUAGE);

    // 创建ADT客户端
    const client = new ADTClient(
      process.env.SAP_URL,
      process.env.SAP_USER,
      process.env.SAP_PASSWORD,
      process.env.SAP_CLIENT,
      process.env.SAP_LANGUAGE
    );

    // 测试登录
    console.log('\n1. 测试登录...');
    await client.login();
    console.log('✅ 登录成功！');

    // 测试获取系统信息
    console.log('\n2. 测试获取系统信息...');
    const objectTypes = await client.objectTypes();
    console.log('✅ 获取成功！系统对象类型数量:', objectTypes.length);

    // 测试搜索对象
    console.log('\n3. 测试搜索对象...');
    const objects = await client.searchObject('Z*', 'PROG', 5);
    console.log('✅ 获取成功！找到程序数量:', objects.length);
    objects.forEach(obj => {
      console.log('  -', obj['adtcore:name']);
    });

    // 测试登出
    console.log('\n4. 测试登出...');
    await client.logout().catch(err => {
      console.log('⚠️  登出时出现警告:', err.message);
    });
    console.log('✅ 测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error);
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    process.exit(1);
  }
}

testDirectLogin();
