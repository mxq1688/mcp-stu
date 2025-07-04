import { test, expect } from '@playwright/test';
import { SearchPage } from './pages/SearchPage.js';

test.describe('搜索功能测试 - 页面对象模式', () => {
  let searchPage;

  test.beforeEach(async ({ page }) => {
    searchPage = new SearchPage(page);
    await searchPage.navigate();
  });

  test('搜索Playwright并验证结果', async () => {
    // 执行搜索
    await searchPage.search('Playwright');
    
    // 验证搜索结果显示
    expect(await searchPage.isSearchResultsVisible()).toBeTruthy();
    
    // 验证至少有结果
    const resultsCount = await searchPage.getSearchResultsCount();
    expect(resultsCount).toBeGreaterThan(0);
    
    // 获取搜索结果文本
    const results = await searchPage.getSearchResults();
    console.log('搜索结果：', results.slice(0, 3)); // 打印前3个结果
  });

  test('搜索多个关键词', async () => {
    const keywords = ['JavaScript', 'TypeScript', 'Node.js'];
    
    for (const keyword of keywords) {
      await searchPage.search(keyword);
      
      // 验证每次搜索都有结果
      expect(await searchPage.isSearchResultsVisible()).toBeTruthy();
      
      const count = await searchPage.getSearchResultsCount();
      expect(count).toBeGreaterThan(0);
      
      console.log(`${keyword} 搜索结果数量: ${count}`);
      
      // 回到首页进行下一次搜索
      if (keyword !== keywords[keywords.length - 1]) {
        await searchPage.navigate();
      }
    }
  });

  test('空搜索验证', async () => {
    // 尝试空搜索
    await searchPage.search('');
    
    // 验证页面状态（百度通常会保持在首页或显示特定提示）
    const currentUrl = searchPage.page.url();
    console.log('空搜索后的URL：', currentUrl);
  });
}); 