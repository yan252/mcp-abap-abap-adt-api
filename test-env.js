#!/usr/bin/env node

// 先加载环境变量
const { config } = require('dotenv');
const path = require('path');
config({ path: path.resolve(__dirname, '.env') });

// 测试环境变量是否正确加载
console.log('SAP_USER from .env:', process.env.SAP_USER);
console.log('SAP_URL from .env:', process.env.SAP_URL);
console.log('SAP_CLIENT from .env:', process.env.SAP_CLIENT);

// 模拟DebugHandlers中的代码
class MockDebugHandlers {
    constructor() {
        // 模拟adtclient
        this.adtclient = {
            username: 'mock-context-user'
        };
    }
    
    // 模拟handleDebuggerSetBreakpoints方法
    async handleDebuggerSetBreakpoints(args) {
        // 总是使用当前登录用户
        console.log('DEBUG: SAP_USER value:', process.env.SAP_USER);
        const user = process.env.SAP_USER;
        console.log('DEBUG: Using user for breakpoints:', user);
        console.log('DEBUG: Context user (this.adtclient.username):', this.adtclient.username);
        
        // 模拟API调用
        console.log('Calling debuggerSetBreakpoints with user:', user);
        
        return { 
            content: [
                { 
                    type: 'text', 
                    text: JSON.stringify({ 
                        status: 'success', 
                        result: { message: 'Breakpoints set successfully' } 
                    }) 
                } 
            ] 
        };
    }
}

// 运行测试
async function runTest() {
    const debugHandlers = new MockDebugHandlers();
    await debugHandlers.handleDebuggerSetBreakpoints({
        debuggingMode: 'terminal',
        terminalId: 'test-terminal',
        ideId: 'test-ide',
        clientId: 'test-client',
        breakpoints: []
    });
}

runTest().catch(console.error);
