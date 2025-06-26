import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* 在CI中并行运行 */
  fullyParallel: true,
  /* 在CI中失败时不重试 */
  forbidOnly: !!process.env.CI,
  /* 在CI中重试失败的测试 */
  retries: process.env.CI ? 2 : 0,
  /* 在CI中限制worker数量 */
  workers: process.env.CI ? 1 : undefined,
  /* 报告器：在CI中使用HTML报告 */
  reporter: 'html',
  /* 所有测试的共享设置 */
  use: {
    /* 基础URL，这样可以使用page.goto('/') */
    baseURL: 'http://127.0.0.1:3000',

    /* 收集跟踪信息用于调试 */
    trace: 'on-first-retry',
  },

  /* 配置不同浏览器的项目 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* 移动浏览器测试 */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* Microsoft Edge */
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },

    /* Google Chrome */
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],

  /* 在运行测试前启动本地开发服务器 */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
}); 