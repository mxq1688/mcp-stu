export class SearchPage {
  constructor(page) {
    this.page = page;
    this.searchInput = page.locator('#kw');
    this.searchButton = page.locator('#su');
    this.searchResults = page.locator('#content_left');
    this.resultLinks = page.locator('#content_left h3 a');
  }

  async navigate() {
    await this.page.goto('https://www.baidu.com');
  }

  async search(query) {
    await this.searchInput.fill(query);
    await this.searchButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getSearchResults() {
    return await this.resultLinks.allTextContents();
  }

  async clickFirstResult() {
    await this.resultLinks.first().click();
  }

  async isSearchResultsVisible() {
    return await this.searchResults.isVisible();
  }

  async getSearchResultsCount() {
    return await this.resultLinks.count();
  }
} 