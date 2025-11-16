/**
 * StokAlert API Test Suite
 * Comprehensive testing and validation for all API endpoints
 */

interface TestResult {
  endpoint: string
  method: string
  success: boolean
  responseTime: number
  statusCode: number
  error?: string
  data?: any
}

interface TestSuite {
  name: string
  tests: TestResult[]
  passed: number
  failed: number
  totalTime: number
}

export class APITestSuite {
  private baseUrl: string
  private authToken?: string
  
  constructor(baseUrl: string, authToken?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '') // Remove trailing slash
    this.authToken = authToken
  }

  async runAllTests(): Promise<TestSuite[]> {
    console.log('🚀 Starting StokAlert API Test Suite...')
    
    const suites: TestSuite[] = [
      await this.testHealthEndpoints(),
      await this.testAuthEndpoints(),
      await this.testAlertEndpoints(),
      await this.testStockDataEndpoints(),
      await this.testCalendarEndpoints(),
      await this.testScreenerEndpoints(),
      await this.testCronEndpoints(),
      await this.testErrorHandling(),
      await this.testRateLimiting()
    ]

    // Summary
    const totalPassed = suites.reduce((sum, suite) => sum + suite.passed, 0)
    const totalFailed = suites.reduce((sum, suite) => sum + suite.failed, 0)
    const totalTime = suites.reduce((sum, suite) => sum + suite.totalTime, 0)

    console.log('\n📊 Test Summary:')
    console.log(`Total Tests: ${totalPassed + totalFailed}`)
    console.log(`Passed: ${totalPassed}`)
    console.log(`Failed: ${totalFailed}`)
    console.log(`Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(2)}%`)
    console.log(`Total Time: ${totalTime.toFixed(2)}ms`)

    return suites
  }

  private async testHealthEndpoints(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Health & Monitoring',
      tests: [],
      passed: 0,
      failed: 0,
      totalTime: 0
    }

    // Health check endpoint
    const healthTest = await this.makeRequest('GET', '/api/admin/health')
    suite.tests.push(healthTest)
    
    if (healthTest.success) {
      suite.passed++
      // Validate health response structure
      if (healthTest.data?.status && healthTest.data?.checks) {
        console.log('✅ Health endpoint returns proper structure')
      } else {
        console.log('⚠️  Health endpoint missing required fields')
      }
    } else {
      suite.failed++
    }

    suite.totalTime = healthTest.responseTime
    return suite
  }

  private async testAuthEndpoints(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Authentication',
      tests: [],
      passed: 0,
      failed: 0,
      totalTime: 0
    }

    // Test protected endpoint without auth
    const noAuthTest = await this.makeRequest('GET', '/api/alerts')
    suite.tests.push(noAuthTest)
    
    if (noAuthTest.statusCode === 401) {
      suite.passed++
      console.log('✅ Protected endpoint properly rejects unauthenticated requests')
    } else {
      suite.failed++
      console.log('❌ Protected endpoint should require authentication')
    }

    // Test with invalid token
    const invalidTokenTest = await this.makeRequest('GET', '/api/alerts', undefined, 'invalid_token')
    suite.tests.push(invalidTokenTest)
    
    if (invalidTokenTest.statusCode === 401) {
      suite.passed++
      console.log('✅ Protected endpoint properly rejects invalid tokens')
    } else {
      suite.failed++
      console.log('❌ Protected endpoint should reject invalid tokens')
    }

    suite.totalTime = noAuthTest.responseTime + invalidTokenTest.responseTime
    return suite
  }

  private async testAlertEndpoints(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Alert Management',
      tests: [],
      passed: 0,
      failed: 0,
      totalTime: 0
    }

    if (!this.authToken) {
      console.log('⚠️  Skipping alert tests - no auth token provided')
      return suite
    }

    // Test create alert with valid data
    const createAlertData = {
      symbol: 'AAPL',
      name: 'Test Alert',
      alertType: 'price_limit_upper',
      triggerCondition: {
        type: 'price_limit',
        operator: 'above',
        value: 150
      },
      notificationMethods: ['email']
    }

    const createTest = await this.makeRequest('POST', '/api/alerts', createAlertData)
    suite.tests.push(createTest)
    
    if (createTest.success) {
      suite.passed++
      console.log('✅ Alert creation successful')
    } else {
      suite.failed++
      console.log('❌ Alert creation failed:', createTest.error)
    }

    // Test get alerts
    const getAlertsTest = await this.makeRequest('GET', '/api/alerts')
    suite.tests.push(getAlertsTest)
    
    if (getAlertsTest.success) {
      suite.passed++
      console.log('✅ Get alerts successful')
    } else {
      suite.failed++
      console.log('❌ Get alerts failed:', getAlertsTest.error)
    }

    // Test get alert logs
    const getLogsTest = await this.makeRequest('GET', '/api/alerts/logs')
    suite.tests.push(getLogsTest)
    
    if (getLogsTest.success) {
      suite.passed++
      console.log('✅ Get alert logs successful')
    } else {
      suite.failed++
      console.log('❌ Get alert logs failed:', getLogsTest.error)
    }

    // Test invalid alert creation
    const invalidAlertTest = await this.makeRequest('POST', '/api/alerts', {
      symbol: 'INVALID',
      alertType: 'invalid_type'
    })
    suite.tests.push(invalidAlertTest)
    
    if (invalidAlertTest.statusCode === 400) {
      suite.passed++
      console.log('✅ Invalid alert properly rejected')
    } else {
      suite.failed++
      console.log('❌ Invalid alert should be rejected')
    }

    suite.totalTime = suite.tests.reduce((sum, test) => sum + test.responseTime, 0)
    return suite
  }

  private async testStockDataEndpoints(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Stock Data',
      tests: [],
      passed: 0,
      failed: 0,
      totalTime: 0
    }

    // Test stock data endpoints if they exist
    // Note: These might be part of existing stock functionality
    
    console.log('ℹ️  Stock data endpoints use existing infrastructure')
    return suite
  }

  private async testCalendarEndpoints(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Calendar Features',
      tests: [],
      passed: 0,
      failed: 0,
      totalTime: 0
    }

    // Test earnings calendar
    const earningsTest = await this.makeRequest('GET', '/api/earnings')
    suite.tests.push(earningsTest)
    
    if (earningsTest.success || earningsTest.statusCode === 200) {
      suite.passed++
      console.log('✅ Earnings calendar endpoint accessible')
    } else {
      suite.failed++
      console.log('❌ Earnings calendar endpoint failed')
    }

    // Test dividends calendar
    const dividendsTest = await this.makeRequest('GET', '/api/dividends')
    suite.tests.push(dividendsTest)
    
    if (dividendsTest.success || dividendsTest.statusCode === 200) {
      suite.passed++
      console.log('✅ Dividends calendar endpoint accessible')
    } else {
      suite.failed++
      console.log('❌ Dividends calendar endpoint failed')
    }

    suite.totalTime = suite.tests.reduce((sum, test) => sum + test.responseTime, 0)
    return suite
  }

  private async testScreenerEndpoints(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Stock Screener',
      tests: [],
      passed: 0,
      failed: 0,
      totalTime: 0
    }

    // Test screener with basic filters
    const screenerData = {
      priceRange: { min: 10, max: 500 },
      marketCapRange: { min: 1000000000 },
      limit: 10
    }

    const screenerTest = await this.makeRequest('POST', '/api/screener', screenerData)
    suite.tests.push(screenerTest)
    
    if (screenerTest.success) {
      suite.passed++
      console.log('✅ Stock screener working')
      
      // Validate response structure
      if (screenerTest.data?.stocks && Array.isArray(screenerTest.data.stocks)) {
        console.log('✅ Screener returns proper stock array')
      } else {
        console.log('⚠️  Screener response structure unexpected')
      }
    } else {
      suite.failed++
      console.log('❌ Stock screener failed:', screenerTest.error)
    }

    suite.totalTime = screenerTest.responseTime
    return suite
  }

  private async testCronEndpoints(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Cron Jobs',
      tests: [],
      passed: 0,
      failed: 0,
      totalTime: 0
    }

    // Test manual alert processing
    const processAlertsTest = await this.makeRequest('POST', '/api/cron/process-alerts', {})
    suite.tests.push(processAlertsTest)
    
    if (processAlertsTest.success || processAlertsTest.statusCode === 200) {
      suite.passed++
      console.log('✅ Alert processing cron job accessible')
    } else {
      suite.failed++
      console.log('❌ Alert processing cron job failed')
    }

    suite.totalTime = processAlertsTest.responseTime
    return suite
  }

  private async testErrorHandling(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Error Handling',
      tests: [],
      passed: 0,
      failed: 0,
      totalTime: 0
    }

    // Test 404 endpoint
    const notFoundTest = await this.makeRequest('GET', '/api/nonexistent')
    suite.tests.push(notFoundTest)
    
    if (notFoundTest.statusCode === 404 || notFoundTest.statusCode === 405) {
      suite.passed++
      console.log('✅ 404 handling working')
    } else {
      suite.failed++
      console.log('❌ 404 handling not working properly')
    }

    // Test malformed JSON
    const malformedTest = await this.makeRequest('POST', '/api/alerts', 'invalid-json', this.authToken, true)
    suite.tests.push(malformedTest)
    
    if (malformedTest.statusCode === 400) {
      suite.passed++
      console.log('✅ Malformed JSON properly rejected')
    } else {
      suite.failed++
      console.log('❌ Malformed JSON not properly handled')
    }

    suite.totalTime = suite.tests.reduce((sum, test) => sum + test.responseTime, 0)
    return suite
  }

  private async testRateLimiting(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Rate Limiting',
      tests: [],
      passed: 0,
      failed: 0,
      totalTime: 0
    }

    console.log('ℹ️  Rate limiting tests would require multiple rapid requests')
    console.log('ℹ️  Skipping to avoid triggering actual rate limits during testing')
    
    return suite
  }

  private async makeRequest(
    method: string, 
    path: string, 
    body?: any, 
    token?: string,
    rawBody?: boolean
  ): Promise<TestResult> {
    const start = Date.now()
    const url = `${this.baseUrl}${path}`
    const authToken = token || this.authToken
    
    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        }
      }

      if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = rawBody ? body : JSON.stringify(body)
      }

      const response = await fetch(url, options)
      const responseTime = Date.now() - start
      
      let data
      try {
        data = await response.json()
      } catch {
        data = await response.text()
      }

      return {
        endpoint: path,
        method,
        success: response.ok,
        responseTime,
        statusCode: response.status,
        data
      }
    } catch (error) {
      const responseTime = Date.now() - start
      return {
        endpoint: path,
        method,
        success: false,
        responseTime,
        statusCode: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Utility method to generate test report
  generateReport(suites: TestSuite[]): string {
    const report = [
      '# StokAlert API Test Report',
      `Generated: ${new Date().toISOString()}`,
      '',
      '## Summary',
      ''
    ]

    const totalTests = suites.reduce((sum, suite) => sum + suite.tests.length, 0)
    const totalPassed = suites.reduce((sum, suite) => sum + suite.passed, 0)
    const totalFailed = suites.reduce((sum, suite) => sum + suite.failed, 0)
    const totalTime = suites.reduce((sum, suite) => sum + suite.totalTime, 0)

    report.push(`- **Total Tests**: ${totalTests}`)
    report.push(`- **Passed**: ${totalPassed}`)
    report.push(`- **Failed**: ${totalFailed}`)
    report.push(`- **Success Rate**: ${((totalPassed / totalTests) * 100).toFixed(2)}%`)
    report.push(`- **Total Time**: ${totalTime.toFixed(2)}ms`)
    report.push('')

    // Detailed results
    for (const suite of suites) {
      report.push(`## ${suite.name}`)
      report.push('')
      report.push(`- Tests: ${suite.tests.length}`)
      report.push(`- Passed: ${suite.passed}`)
      report.push(`- Failed: ${suite.failed}`)
      report.push(`- Time: ${suite.totalTime.toFixed(2)}ms`)
      report.push('')

      if (suite.failed > 0) {
        report.push('### Failed Tests:')
        report.push('')
        for (const test of suite.tests) {
          if (!test.success) {
            report.push(`- ${test.method} ${test.endpoint} - ${test.error || `Status: ${test.statusCode}`}`)
          }
        }
        report.push('')
      }
    }

    return report.join('\n')
  }
}

// Validation functions
export const ValidationSuite = {
  // Validate alert data structure
  validateAlertStructure(alert: any): boolean {
    const required = ['symbol', 'alertType', 'triggerCondition', 'isActive']
    return required.every(field => alert.hasOwnProperty(field))
  },

  // Validate market data structure
  validateMarketDataStructure(data: any): boolean {
    const required = ['price', 'symbol', 'lastUpdated']
    return required.every(field => data.hasOwnProperty(field))
  },

  // Validate screener response
  validateScreenerResponse(response: any): boolean {
    return (
      response.hasOwnProperty('stocks') &&
      Array.isArray(response.stocks) &&
      response.hasOwnProperty('count') &&
      typeof response.count === 'number'
    )
  },

  // Validate health check response
  validateHealthResponse(response: any): boolean {
    return (
      response.hasOwnProperty('status') &&
      response.hasOwnProperty('checks') &&
      response.hasOwnProperty('metrics')
    )
  }
}

// Example usage:
// const tester = new APITestSuite('https://your-domain.vercel.app', 'your_jwt_token')
// const results = await tester.runAllTests()
// console.log(tester.generateReport(results))