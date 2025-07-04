import { test, expect } from '@playwright/test';

test.describe('基础Playwright测试示例', () => {
  test('访问百度首页', async ({ page }) => {
    // 访问百度
    await page.goto('https://www.baidu.com');
    
    // 验证页面标题
    await expect(page).toHaveTitle(/百度/);
    
    // 验证搜索框存在
    const searchBox = page.locator('#kw');
    await expect(searchBox).toBeVisible();
    
    // 输入搜索词
    await searchBox.fill('Playwright');
    
    // 点击搜索按钮
    await page.click('#su');
    
    // 等待搜索结果页面加载
    await page.waitForLoadState('networkidle');
    
    // 验证搜索结果页面
    await expect(page.locator('#content_left')).toBeVisible();
  });

  test('表单交互示例', async ({ page }) => {
    // 访问一个表单页面
    await page.goto('https://httpbin.org/forms/post');
    
    // 填写表单
    await page.fill('input[name="custname"]', '张三');
    await page.fill('input[name="custtel"]', '13800138000');
    await page.fill('input[name="custemail"]', 'zhangsan@example.com');
    
    // 选择选项
    await page.selectOption('select[name="size"]', 'large');
    
    // 勾选复选框
    await page.check('input[name="topping"][value="bacon"]');
    
    // 选择单选按钮
    await page.check('input[name="delivery"][value="12:00"]');
    
    // 填写文本域
    await page.fill('textarea[name="comments"]', '这是一个测试评论');
    
    // 提交表单
    await page.click('input[type="submit"]');
    
    // 验证提交成功（检查响应页面）
    await expect(page.locator('body')).toContainText('张三');
  });

  test('截图示例', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    // 全页面截图
    await page.screenshot({ path: 'tests/screenshots/homepage.png', fullPage: true });
    
    // 元素截图
    const header = page.locator('.navbar');
    await header.screenshot({ path: 'tests/screenshots/header.png' });
  });

  test('等待元素示例', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    // 等待元素可见
    await page.waitForSelector('.hero__title');
    
    // 等待元素包含特定文本
    await expect(page.locator('.hero__title')).toContainText('Playwright');
    
    // 等待网络请求完成
    await page.waitForLoadState('networkidle');
  });

  test('API测试示例', async ({ request }) => {
    // 发送GET请求
    const response = await request.get('https://api.github.com/repos/microsoft/playwright');
    
    // 验证响应状态
    expect(response.status()).toBe(200);
    
    // 解析JSON响应
    const data = await response.json();
    
    // 验证响应数据
    expect(data.name).toBe('playwright');
    expect(data.owner.login).toBe('microsoft');
  });
}); 