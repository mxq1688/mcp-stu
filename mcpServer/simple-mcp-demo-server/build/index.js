import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import cors from "cors";
import { z } from "zod"; // 用于定义工具和提示的输入验证schema
// 创建 Express 应用
const app = express();
// 配置 CORS
const corsOptions = {
    origin: true,
    credentials: true,
    exposedHeaders: ['mcp-session-id'],
    allowedHeaders: ['Content-Type', 'Authorization', 'mcp-session-id', 'Accept'],
    methods: ['GET', 'POST', 'OPTIONS']
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // 启用 CORS 预检请求
app.use(express.json());
// 添加请求日志中间件
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('Query:', req.query);
    next();
});
// 在 MCP 路由前统一处理 Content-Type 和 Accept 头
app.use((req, res, next) => {
    if (req.path.startsWith('/stdio')) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
    }
    else if (req.path.startsWith('/config') || req.path.startsWith('/mcp')) {
        res.setHeader('Content-Type', 'application/json');
    }
    next();
});
// 1. 创建MCP服务器实例
// McpServer 是您与MCP协议的核心接口。
const server = new McpServer({
    name: "Demo互动服务器", // 服务器的名称
    version: "1.0.0", // 服务器的版本
    capabilities: {
        resources: {
            status: true
        },
        tools: {
            echo_message: true,
            simple_calculation: true
        },
        prompts: {
            generate_slogan: true
        }
    },
});
// 2. 暴露一个只读的"资源 (Resource)"
// 资源用于向大型语言模型（LLM）暴露数据和内容，类似于Web API中的GET请求。
// 它们不应执行显著的计算或产生副作用。
server.resource("status", // 资源的内部名称
"resource://status/server", // 资源的URI模板，这是一个固定URI，表示服务器状态
async (uri) => {
    // 当客户端请求此资源时，返回预设的服务器状态信息。
    return {
        contents: [
            {
                uri: uri.href,
                text: "服务器运行正常，无已知错误。自上次启动以来已处理 100 次请求。",
                mimeType: "text/plain"
            },
        ],
    };
});
console.log("已注册资源: resource://status/server");
// 3. 提供两个"工具 (Tool)"
// 工具允许LLM通过服务器执行操作，预期会执行计算并产生副作用。
// 工具调用通常需要用户的批准。
// 工具 A: 消息回显器
server.tool("echo_message", // 工具的内部名称
"回显您输入的任何消息", // 对人类友好的描述
{
    // 输入参数的Zod schema，Zod是一个用于schema验证的库。
    message: z.string().describe("要回显的文本消息"), // 消息内容
}, async ({ message }) => {
    // 工具的执行逻辑
    return {
        content: [
            {
                type: "text",
                text: `你说了：${message}`, // 返回原样消息，前面加上"你说了："
            },
        ],
    };
});
console.log("已注册工具: echo_message");
// 工具 B: 简单数字计算器
server.tool("simple_calculation", // 工具的内部名称
"执行两个数字之间的简单加减乘除运算", // 对人类友好的描述
{
    a: z.number().describe("第一个数字"),
    b: z.number().describe("第二个数字"),
    operator: z.enum(["+", "-", "*", "/"]).describe("要执行的运算（+, -, *, /）"),
}, async ({ a, b, operator }) => {
    let result;
    try {
        switch (operator) {
            case "+":
                result = a + b;
                break;
            case "-":
                result = a - b;
                break;
            case "*":
                result = a * b;
                break;
            case "/":
                if (b === 0) {
                    return {
                        content: [{ type: "text", text: "错误：除数不能为零。" }],
                        isError: true, // 标记为错误结果
                    };
                }
                result = a / b;
                break;
            default:
                return {
                    content: [{ type: "text", text: "错误：不支持的运算符。" }],
                    isError: true,
                };
        }
        return {
            content: [
                {
                    type: "text",
                    text: `结果：${result}`, // 返回计算结果
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [{ type: "text", text: `执行计算时发生错误: ${error.message}` }],
            isError: true,
        };
    }
});
console.log("已注册工具: simple_calculation");
// 4. 定义一个"提示 (Prompt)"
// 提示是可重用的模板，旨在帮助LLM与服务器有效互动，通常由用户控制，以UI元素（如斜杠命令）的形式呈现。
server.prompt("generate_slogan", // 提示的内部名称
"为给定主题生成一句口号", // 对人类友好的描述
{
    theme: z.string().describe('口号的主题，例如"环保"或"创新"'),
}, ({ theme }) => {
    // 返回一个消息数组，指导LLM如何生成口号
    return {
        messages: [
            {
                role: "user", // 消息角色，这里模拟用户对LLM的请求
                content: {
                    type: "text",
                    text: `请为"${theme}"主题生成一句有创意且吸引人的口号。要求口号简短有力，易于传播。`,
                },
            },
        ],
    };
});
console.log("已注册提示: generate_slogan");
// OAuth 相关端点
app.get(['/.well-known/oauth-protected-resource', '/.well-known/oauth-protected-resource/stdio'], (req, res) => {
    const base = req.path.endsWith('/stdio') ? '/.well-known/oauth-authorization-server/stdio' : '/.well-known/oauth-authorization-server';
    res.json({
        authorization_server: base
    });
});
app.get(['/.well-known/oauth-authorization-server', '/.well-known/oauth-authorization-server/stdio'], (req, res) => {
    const isStdio = req.path.endsWith('/stdio');
    const base = 'http://127.0.0.1:6277';
    const suffix = isStdio ? '/stdio' : '';
    res.json({
        issuer: base,
        authorization_endpoint: `${base}/authorize${suffix}`,
        token_endpoint: `${base}/token${suffix}`,
        registration_endpoint: `${base}/register${suffix}`,
    });
});
// 存储已注册的客户端和令牌
const clients = new Map();
const tokens = new Map();
// 授权端点
app.get(['/authorize', '/authorize/stdio'], (req, res) => {
    const code = 'auth_code_' + Math.random().toString(36).substring(7);
    const redirectUri = req.query.redirect_uri;
    const state = req.query.state;
    if (!redirectUri) {
        return res.status(400).json({ error: 'redirect_uri is required' });
    }
    res.redirect(`${redirectUri}?code=${code}&state=${state}`);
});
// 令牌端点
app.post(['/token', '/token/stdio'], express.urlencoded({ extended: true }), (req, res) => {
    console.log('Token request:', req.body);
    const accessToken = 'access_token_' + Math.random().toString(36).substring(7);
    tokens.set(accessToken, {
        clientId: req.body.client_id,
        scope: req.body.scope,
        expiresAt: Date.now() + 3600000
    });
    res.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        scope: req.body.scope
    });
});
// 客户端注册端点
app.post(['/register', '/register/stdio'], (req, res) => {
    console.log('收到客户端注册请求:', {
        path: req.path,
        headers: req.headers,
        body: req.body
    });
    res.json({
        client_id: 'test-client-' + Math.random().toString(36).substring(7),
        client_secret: 'secret-' + Math.random().toString(36).substring(7),
        registration_access_token: 'rat-' + Math.random().toString(36).substring(7),
        token_endpoint_auth_method: 'client_secret_basic'
    });
});
// 添加授权中间件
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    // 如果没有提供 Authorization 头，则直接放行（临时关闭鉴权，避免 401）
    if (!authHeader) {
        return next();
    }
    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer') {
        return res.status(401).json({
            error: 'invalid_token',
            error_description: 'Invalid token type'
        });
    }
    const tokenInfo = tokens.get(token);
    if (!tokenInfo) {
        return res.status(401).json({
            error: 'invalid_token',
            error_description: 'Token not found or expired'
        });
    }
    if (tokenInfo.expiresAt < Date.now()) {
        tokens.delete(token);
        return res.status(401).json({
            error: 'invalid_token',
            error_description: 'Token expired'
        });
    }
    req.tokenInfo = tokenInfo;
    next();
};
// 启动服务器
async function main() {
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => Math.random().toString(36).substring(7),
        enableDnsRebindingProtection: false,
        onsessioninitialized: (sessionId) => {
            console.log('新会话已初始化:', sessionId);
        }
    });
    // 连接到 MCP 服务器
    await server.connect(transport);
    // 处理所有 MCP 请求的函数
    const handleMcpRequest = async (req, res, next) => {
        try {
            console.log('收到 MCP 请求:', {
                method: req.method,
                path: req.path,
                headers: req.headers,
                body: req.body,
                query: req.query
            });
            // 设置适当的响应头
            if (req.path === '/stdio') {
                res.setHeader('Content-Type', 'text/event-stream');
                res.setHeader('Cache-Control', 'no-cache');
                res.setHeader('Connection', 'keep-alive');
            }
            else {
                res.setHeader('Content-Type', 'application/json');
            }
            // 对于 /config 请求，我们不需要授权
            if (req.path === '/config') {
                await transport.handleRequest(req, res, req.body);
                return;
            }
            // 对其他所有请求应用授权中间件
            authMiddleware(req, res, async () => {
                await transport.handleRequest(req, res, req.body);
            });
        }
        catch (error) {
            next(error);
        }
    };
    // 错误处理中间件
    const errorHandler = (err, req, res, next) => {
        console.error('处理 MCP 请求时出错:', err);
        const mcpError = err;
        if (!res.headersSent) {
            res.status(mcpError.status || 500).json({
                jsonrpc: "2.0",
                error: {
                    code: mcpError.code || -32603,
                    message: mcpError.message || "Internal server error",
                    data: mcpError instanceof Error ? {
                        message: mcpError.message,
                        stack: mcpError.stack
                    } : String(mcpError)
                },
                id: null
            });
        }
        next();
    };
    // 创建路由
    const router = express.Router();
    // 注册路由处理器
    router.all('/config', handleMcpRequest);
    router.all('/stdio', handleMcpRequest);
    router.all('/mcp', handleMcpRequest);
    router.get('/health', (req, res) => res.json({ status: 'ok' }));
    // 使用路由和错误处理
    app.use('/', router);
    app.use(errorHandler);
    // 启动 HTTP 服务器
    const PORT = 6277;
    app.listen(PORT, () => {
        console.log(`MCP 服务器已启动，监听在:`);
        console.log(`- http://127.0.0.1:${PORT}/mcp`);
        console.log(`- http://127.0.0.1:${PORT}/stdio`);
        console.log(`- 健康检查: http://127.0.0.1:${PORT}/health`);
        console.log(`- OAuth 端点: http://127.0.0.1:${PORT}/.well-known/oauth-authorization-server`);
    });
}
// 捕获可能发生的致命错误
main().catch((error) => {
    console.error("服务器启动时发生致命错误:", error);
    process.exit(1); // 以非零退出码表示错误
});
