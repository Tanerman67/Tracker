const {defineConfig,devices}=require('@playwright/test');
module.exports=defineConfig({
 testDir:'./tests/browser',timeout:45000,expect:{timeout:10000},fullyParallel:false,workers:1,
 maxFailures:10,reporter:[['list'],['html',{open:'never'}]],
 use:{baseURL:'http://127.0.0.1:8765',trace:'retain-on-failure',screenshot:'only-on-failure'},
 projects:[{name:'chromium-desktop',use:{...devices['Desktop Chrome']}},{name:'chromium-mobile',use:{...devices['iPhone 13'],defaultBrowserType:'chromium'}},{name:'webkit-mobile',use:{...devices['iPhone 13']}}],
 webServer:{command:'python3 -m http.server 8765 --bind 127.0.0.1',url:'http://127.0.0.1:8765',reuseExistingServer:!process.env.CI}
});
