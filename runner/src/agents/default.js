const { chromium } = require('playwright')

class DefaultAgent {
  async execute(task, options = {}) {
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    try {
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      })

      const page = await context.newPage()
      
      // Basic web automation example
      if (task.toLowerCase().includes('search')) {
        return await this.searchGoogle(page, task)
      } else if (task.toLowerCase().includes('screenshot')) {
        return await this.takeScreenshot(page, task)
      } else {
        return await this.browsePage(page, task)
      }
    } finally {
      await browser.close()
    }
  }

  async searchGoogle(page, task) {
    const searchQuery = task.replace('search', '').trim()
    
    await page.goto('https://www.google.com')
    await page.fill('input[name="q"]', searchQuery)
    await page.press('input[name="q"]', 'Enter')
    await page.waitForSelector('#search')
    
    const results = await page.evaluate(() => {
      const items = document.querySelectorAll('.g')
      return Array.from(items).slice(0, 5).map(item => ({
        title: item.querySelector('h3')?.textContent || '',
        url: item.querySelector('a')?.href || '',
        snippet: item.querySelector('.VwiC3b')?.textContent || ''
      }))
    })

    return {
      type: 'search_results',
      query: searchQuery,
      results
    }
  }

  async takeScreenshot(page, task) {
    const url = task.match(/https?:\/\/[^\s]+/)?.[0] || 'https://example.com'
    
    await page.goto(url, { waitUntil: 'networkidle' })
    const screenshot = await page.screenshot({ fullPage: true })
    
    return {
      type: 'screenshot',
      url,
      screenshot: screenshot.toString('base64')
    }
  }

  async browsePage(page, task) {
    const url = task.match(/https?:\/\/[^\s]+/)?.[0] || 'https://example.com'
    
    await page.goto(url, { waitUntil: 'networkidle' })
    
    const title = await page.title()
    const textContent = await page.evaluate(() => {
      return document.body.innerText.slice(0, 1000)
    })

    return {
      type: 'page_info',
      url,
      title,
      textContent
    }
  }
}

module.exports = new DefaultAgent()