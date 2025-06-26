# Playwright 端到端测试示例

这是一个完整的Playwright端到端测试项目示例，展示了如何使用Playwright进行Web应用测试。

## 📁 项目结构

```
playwright/
├── tests/                    # 测试文件目录
│   ├── pages/               # 页面对象模式文件
│   │   └── SearchPage.js    # 搜索页面对象
│   ├── screenshots/         # 截图存储目录
│   ├── example.spec.js      # 基础测试示例
│   └── search.spec.js       # 页面对象模式测试示例
├── playwright.config.js     # Playwright配置文件
├── package.json            # 项目配置
└── README.md              # 项目说明
```

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 安装浏览器
```bash
npx playwright install
```

### 3. 运行测试
```bash
# 运行所有测试（无头模式）
npm test

# 运行测试并显示浏览器界面
npm run test:headed

# 使用UI模式运行测试
npm run test:ui

# 只在Chromium中运行测试
npm run test:chromium

# 调试模式运行测试
npm run test:debug
```

## 🎯 测试示例说明

### 基础测试示例 (`example.spec.js`)
- **网页导航测试**：访问百度首页并进行搜索
- **表单交互测试**：填写表单、选择选项、提交数据
- **截图功能**：全页面截图和元素截图
- **等待机制**：等待元素出现和网络请求完成
- **API测试**：直接测试HTTP接口

### 页面对象模式测试 (`search.spec.js`)
- **页面对象模式**：使用面向对象的方式组织测试代码
- **可重用组件**：将页面元素和操作封装成类
- **数据驱动测试**：使用循环测试多个数据集

## 📋 常用命令

| 命令 | 说明 |
|------|------|
| `npm test` | 运行所有测试 |
| `npm run test:headed` | 显示浏览器界面运行测试 |
| `npm run test:debug` | 调试模式运行测试 |
| `npm run test:ui` | 使用UI界面运行测试 |
| `npm run test:chromium` | 只在Chromium中运行 |
| `npm run test:firefox` | 只在Firefox中运行 |
| `npm run test:webkit` | 只在Safari中运行 |
| `npm run report` | 查看测试报告 |
| `npm run codegen` | 启动代码生成器 |

## 🔧 Playwright 核心概念

### 1. 基本API
```javascript
// 页面导航
await page.goto('https://example.com');

// 查找元素
const element = page.locator('#my-id');
const elements = page.locator('.my-class');

// 用户交互
await page.click('button');
await page.fill('input', 'text');
await page.selectOption('select', 'value');

// 断言
await expect(page).toHaveTitle('Page Title');
await expect(element).toBeVisible();
await expect(element).toContainText('Expected Text');
```

### 2. 等待机制
```javascript
// 等待元素出现
await page.waitForSelector('#my-element');

// 等待网络空闲
await page.waitForLoadState('networkidle');

// 等待导航完成
await page.waitForURL('**/search**');
```

### 3. 截图和录制
```javascript
// 页面截图
await page.screenshot({ path: 'screenshot.png' });

// 元素截图
await element.screenshot({ path: 'element.png' });

// 录制视频（在配置中启用）
```

## 🎨 最佳实践

### 1. 使用页面对象模式
将页面元素和操作封装成类，提高代码可维护性。

### 2. 合理使用选择器
- 优先使用`data-testid`属性
- 避免使用脆弱的CSS选择器
- 使用语义化的选择器

### 3. 处理异步操作
- 使用`await`等待操作完成
- 合理设置超时时间
- 使用显式等待而非固定延时

### 4. 测试隔离
- 每个测试应该独立运行
- 使用`beforeEach`进行测试准备
- 清理测试数据

## 🐛 调试技巧

### 1. 使用调试模式
```bash
npm run test:debug
```

### 2. 添加调试语句
```javascript
await page.pause(); // 暂停执行
console.log(await page.title()); // 打印调试信息
```

### 3. 查看测试报告
```bash
npm run report
```

### 4. 使用代码生成器
```bash
npm run codegen https://example.com
```

## 📊 配置说明

`playwright.config.js` 文件包含了完整的配置选项：
- 多浏览器支持（Chrome、Firefox、Safari）
- 移动设备模拟
- 并行执行配置
- 报告生成设置
- 重试机制

## 🔗 相关资源

- [Playwright 官方文档](https://playwright.dev/)
- [API 参考](https://playwright.dev/docs/api/class-playwright)
- [最佳实践指南](https://playwright.dev/docs/best-practices)
- [测试模式和模式](https://playwright.dev/docs/test-patterns)

## 💡 提示

1. 首次运行可能需要下载浏览器，请耐心等待
2. 建议在CI/CD中使用无头模式运行测试
3. 定期更新Playwright版本以获得最新功能
4. 使用环境变量管理不同环境的配置 