const puppeteer = require('puppeteer');

async function testProductionAPI() {
  console.log('🚀 Starting Production API Test...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1280, height: 720 }
  });
  
  const page = await browser.newPage();
  
  try {
    // フロントエンドテスト
    console.log('📱 Testing Frontend (Production)...');
    await page.goto('https://exam-preparation-system.vercel.app', { waitUntil: 'networkidle2' });
    
    // ページタイトル確認
    const title = await page.title();
    console.log(`✅ Page Title: ${title}`);
    
    // メインコンテンツの存在確認
    await page.waitForSelector('body', { timeout: 10000 });
    console.log('✅ Frontend loaded successfully');
    
    // 待機（デプロイ完了まで）
    console.log('⏳ Waiting for deployment to complete...');
    await new Promise(resolve => setTimeout(resolve, 60000)); // 1分待機
    
    // APIテスト (複数回試行)
    console.log('🔌 Testing API Connection...');
    let apiResponse = null;
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts && !apiResponse) {
      attempts++;
      console.log(`📡 API Test Attempt ${attempts}/${maxAttempts}...`);
      
      try {
        const response = await page.evaluate(async () => {
          try {
            const res = await fetch('https://exam-preparation-system.vercel.app/api/health');
            const text = await res.text();
            return {
              status: res.status,
              statusText: res.statusText,
              body: text,
              headers: Object.fromEntries(res.headers.entries())
            };
          } catch (error) {
            return { error: error.message };
          }
        });
        
        console.log(`📊 API Response (Attempt ${attempts}):`, response);
        
        if (response.status === 200) {
          apiResponse = response;
          console.log('✅ API Health Check SUCCESS!');
          break;
        } else {
          console.log(`⚠️ API returned status ${response.status}, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 30000)); // 30秒待機
        }
      } catch (error) {
        console.log(`❌ API Test Attempt ${attempts} failed:`, error.message);
        await new Promise(resolve => setTimeout(resolve, 30000)); // 30秒待機
      }
    }
    
    if (!apiResponse) {
      console.log('❌ API health check failed after all attempts');
    }
    
    // 追加APIテスト
    if (apiResponse) {
      console.log('🔍 Testing Additional API Endpoints...');
      
      const endpoints = ['/api/categories', '/api/questions'];
      for (const endpoint of endpoints) {
        const testResponse = await page.evaluate(async (url) => {
          try {
            const res = await fetch(url);
            return {
              status: res.status,
              url: url,
              body: await res.text()
            };
          } catch (error) {
            return { error: error.message, url: url };
          }
        }, `https://exam-preparation-system.vercel.app${endpoint}`);
        
        console.log(`📋 ${endpoint}:`, testResponse.status || 'Error', testResponse.body?.substring(0, 100) || testResponse.error);
      }
    }
    
    // スクリーンショット撮影
    await page.screenshot({ 
      path: 'production-test-screenshot.png',
      fullPage: true 
    });
    console.log('📸 Screenshot saved: production-test-screenshot.png');
    
    console.log('🎉 Production test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testProductionAPI().catch(console.error);