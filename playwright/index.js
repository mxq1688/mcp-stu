// 打开浏览器并导航到登录页面
await mcp_playwright_browser_navigate({
    url: "https://example.com/login"
  });
   
  // 等待页面加载
  await mcp_playwright_browser_wait({
    time: 2
  });
   
  // 捕获页面快照以获取元素引用
  await mcp_playwright_browser_snapshot({
    random_string: "snapshot"
  });
   
  // 输入用户名
  await mcp_playwright_browser_type({
    element: "用户名输入框",
    ref: "input[name='username']", // 实际使用时应替换为真实元素的引用
    text: "your_username"
  });
   
  // 输入密码
  await mcp_playwright_browser_type({
    element: "密码输入框",
    ref: "input[name='password']", // 实际使用时应替换为真实元素的引用
    text: "your_password"
  });
   
  // 点击登录按钮
  await mcp_playwright_browser_click({
    element: "登录按钮",
    ref: "button[type='submit']" // 实际使用时应替换为真实元素的引用
  });
   
  // 等待登录完成
  await mcp_playwright_browser_wait({
    time: 3
  });
   
  // 验证登录结果
  await mcp_playwright_browser_snapshot({
    random_string: "verify_login"
  });
   
  // 关闭浏览器
  await mcp_playwright_browser_close({
    random_string: "close"
  });