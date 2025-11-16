import 'server-only'

import {
  createAI,
  getMutableAIState
} from 'ai/rsc'
import { nanoid } from '@/lib/utils'
import { Message } from '@/lib/types'
import { BotCard, BotMessage } from '@/components/stocks/message'
import { StockChart } from '@/components/tradingview/stock-chart'
import { ValidatedStockChart } from '@/components/tradingview/validated-stock-chart'
import { StockPrice } from '@/components/tradingview/stock-price'
import { StockNews } from '@/components/tradingview/stock-news'
import { ValidatedStockFinancials } from '@/components/tradingview/validated-stock-financials'
import { ValidatedStockScreener } from '@/components/tradingview/validated-stock-screener'
import { MarketOverview } from '@/components/tradingview/market-overview'
import { ValidatedMarketHeatmap } from '@/components/tradingview/validated-market-heatmap'
import { MarketTrending } from '@/components/tradingview/market-trending'
import { ValidatedETFHeatmap } from '@/components/tradingview/validated-etf-heatmap'
import { validateUsageLimit, trackFeatureUsage } from '@/lib/validation-utils'
import { fetchSentimentData, formatSentimentMessage } from '@/lib/sentiment'
import { SentimentBadge } from '@/components/sentiment/sentiment-badge'

export type AIState = {
  chatId: string
  messages: Message[]
}

export type UIState = {
  id: string
  display: React.ReactNode
}[]

async function submitUserMessage(content: string, userPlan: string = 'free', userEmail: string = '') {
  'use server'

  console.log(`[submitUserMessage] Starting message processing: ${content.substring(0, 100)}...`)
  console.log(`[submitUserMessage] User plan: ${userPlan}, Email: ${userEmail}`)

  // Validate conversation limits
  if (userEmail) {
    const conversationValidation = await validateUsageLimit(userPlan, userEmail, 'conversations');
    if (!conversationValidation.allowed) {
      return {
        id: nanoid(),
        display: (
          <BotCard>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h3 className="font-semibold text-amber-800 mb-2">Daily Conversation Limit Reached</h3>
              <p className="text-amber-700">{conversationValidation.reason}</p>
              {conversationValidation.upgradeMessage && (
                <p className="text-sm text-amber-600 mt-2">{conversationValidation.upgradeMessage}</p>
              )}
            </div>
          </BotCard>
        )
      }
    }

    // Track conversation usage
    await trackFeatureUsage(userEmail, 'conversations');
  }

  // Helper function to create stock card with sentiment
  async function createStockCardWithSentiment(symbol: string, content: React.ReactNode, description: string) {
    try {
      console.log(`Creating stock card with sentiment for ${symbol}`)
      const sentiment = await fetchSentimentData(symbol)
      console.log('Sentiment data received:', sentiment)

      return (
        <BotCard>
          {content}
          {sentiment && (
            <div className="mt-4 pt-4 border-t">
              <SentimentBadge
                sentimentPercentage={sentiment.sentimentPercentage}
                source={sentiment.source}
                articleCount={sentiment.articleCount}
              />
            </div>
          )}
          <p className="mt-3">{description}</p>
        </BotCard>
      )
    } catch (error) {
      console.error('Error creating stock card with sentiment:', error)
      return (
        <BotCard>
          {content}
          <p className="mt-3">{description}</p>
        </BotCard>
      )
    }
  }
  
  const aiState = getMutableAIState<typeof AI>()

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user',
        content
      }
    ]
  })

  try {
    console.log(`[submitUserMessage] Processing message: "${content}"`)
    console.log(`[submitUserMessage] Using direct pattern matching approach`)
    
    // COMPLETELY BYPASS streamUI - use direct pattern matching
    const lowerContent = content.toLowerCase().trim()
    let display: React.ReactNode
    
    // Check if the user message is a simple greeting
    const isGreeting = /^(hi|hello|hey|greetings)$/i.test(content.trim())
    if (isGreeting) {
      display = <BotMessage content="Hello! I'm your stock market assistant. I can help you get information about stocks, cryptocurrencies, and market data. You can ask me about stock prices, charts, financial data, news, or market performance. What would you like to know?" />
      console.log(`[submitUserMessage] Using greeting response for display`)
          } else {
      // Direct pattern matching for all financial queries
      console.log(`[submitUserMessage] Processing financial query with pattern matching`)
      
      // Check for chart requests first
      if (lowerContent.includes('chart') || lowerContent.includes('graph')) {
        console.log(`[submitUserMessage] Chart request detected`)
        let symbol = null
        
        // Check for company names or symbols
        if (lowerContent.includes('googl') || lowerContent.includes('google') || lowerContent.includes('$googl')) {
          symbol = 'GOOGL'
        } else if (lowerContent.includes('amazon') || lowerContent.includes('amzn')) {
          symbol = 'AMZN'
        } else if (lowerContent.includes('microsoft') || lowerContent.includes('msft')) {
          symbol = 'MSFT'
        } else if (lowerContent.includes('apple') || lowerContent.includes('aapl')) {
          symbol = 'AAPL'
        } else if (lowerContent.includes('tesla') || lowerContent.includes('tsla')) {
          symbol = 'TSLA'
        } else if (lowerContent.includes('meta') || lowerContent.includes('facebook')) {
          symbol = 'META'
        } else if (lowerContent.includes('nvidia') || lowerContent.includes('nvda')) {
          symbol = 'NVDA'
        } else {
          // Try to extract stock symbol with $ or standalone
          const stockSymbolMatch = content.match(/\$?([A-Z]{2,5})\b/i)
          if (stockSymbolMatch) {
            symbol = stockSymbolMatch[1].toUpperCase()
          } else {
            symbol = 'AAPL' // Default fallback
          }
        }
        
        console.log(`[submitUserMessage] Direct match: stock chart for ${symbol}`)
        display = await createStockCardWithSentiment(
          symbol,
          <ValidatedStockChart symbol={symbol} comparisonSymbols={[]} userPlan={userPlan} userEmail={userEmail} />,
          `Here's the stock chart for ${symbol}. This shows the price movement and technical analysis.`
        )
      } else if (lowerContent.includes('market') && (lowerContent.includes('sector') || lowerContent.includes('performing'))) {
        console.log(`[submitUserMessage] Direct match: market heatmap for sector query`)
        display = (
              <BotCard>
            <ValidatedMarketHeatmap userPlan={userPlan} userEmail={userEmail} />
            <p>Here&apos;s today&apos;s market performance by sector. Each square represents a different sector, with green showing gains and red showing losses.</p>
              </BotCard>
            )
      } else if (lowerContent.includes('market') && (lowerContent.includes('overview') || lowerContent.includes('today'))) {
        console.log(`[submitUserMessage] Direct match: market overview`)
        display = (
              <BotCard>
            <MarketOverview />
            <p>Here&apos;s today&apos;s market overview showing performance across different asset classes.</p>
              </BotCard>
            )
      } else if (lowerContent.includes('trending') || lowerContent.includes('gainer') || lowerContent.includes('loser')) {
        console.log(`[submitUserMessage] Direct match: trending stocks`)
        display = (
              <BotCard>
            <MarketTrending />
            <p>Here are today&apos;s trending stocks including top gainers, losers, and most active stocks.</p>
              </BotCard>
            )
      } else if (lowerContent.includes('screener') || lowerContent.includes('screen') || lowerContent.includes('find stocks')) {
        console.log(`[submitUserMessage] Direct match: stock screener`)
        display = (
              <BotCard>
                <ValidatedStockScreener userPlan={userPlan} userEmail={userEmail} />
            <p>Here&apos;s the stock screener to help you find stocks based on various criteria.</p>
              </BotCard>
            )
      } else if (lowerContent.includes('etf')) {
        console.log(`[submitUserMessage] Direct match: ETF heatmap`)
        display = (
              <BotCard>
            <ValidatedETFHeatmap userPlan={userPlan} userEmail={userEmail} />
            <p>Here&apos;s today&apos;s ETF performance across different sectors and asset classes.</p>
              </BotCard>
            )
      } else if (lowerContent.includes('news') || lowerContent.includes('events') || lowerContent.includes('recent')) {
        // Extract stock symbol or company name for news
        let symbol = 'AAPL'
        
        // Check for company names first
        if (lowerContent.includes('amazon')) symbol = 'AMZN'
        else if (lowerContent.includes('microsoft')) symbol = 'MSFT'
        else if (lowerContent.includes('apple')) symbol = 'AAPL'
        else if (lowerContent.includes('google') || lowerContent.includes('alphabet')) symbol = 'GOOGL'
        else if (lowerContent.includes('tesla')) symbol = 'TSLA'
        else if (lowerContent.includes('meta') || lowerContent.includes('facebook')) symbol = 'META'
        else if (lowerContent.includes('nvidia')) symbol = 'NVDA'
        else if (lowerContent.includes('netflix')) symbol = 'NFLX'
        else if (lowerContent.includes('amd')) symbol = 'AMD'
        else if (lowerContent.includes('intel')) symbol = 'INTC'
        else {
          // Try to extract stock symbol
          const stockSymbolMatch = content.match(/\b([A-Z]{2,5})\b/)
          if (stockSymbolMatch) {
            symbol = stockSymbolMatch[1].toUpperCase()
          }
        }
        
        console.log(`[submitUserMessage] Direct match: stock news for ${symbol}`)
        display = (
          <BotCard>
            <StockNews props={symbol} />
            <p className="mt-3">Here are the latest news and events for {symbol}.</p>
          </BotCard>
        )
      } else if (lowerContent.includes('financial') || lowerContent.includes('metrics') || lowerContent.includes('ratios')) {
        // Extract stock symbol or company name for financials
        let symbol = 'AAPL'
        
        // Check for company names first
        if (lowerContent.includes('amazon')) symbol = 'AMZN'
        else if (lowerContent.includes('microsoft')) symbol = 'MSFT'
        else if (lowerContent.includes('apple')) symbol = 'AAPL'
        else if (lowerContent.includes('google') || lowerContent.includes('alphabet')) symbol = 'GOOGL'
        else if (lowerContent.includes('tesla')) symbol = 'TSLA'
        else if (lowerContent.includes('meta') || lowerContent.includes('facebook')) symbol = 'META'
        else if (lowerContent.includes('nvidia')) symbol = 'NVDA'
        else if (lowerContent.includes('netflix')) symbol = 'NFLX'
        else if (lowerContent.includes('amd')) symbol = 'AMD'
        else if (lowerContent.includes('intel')) symbol = 'INTC'
        else {
          // Try to extract stock symbol
          const stockSymbolMatch = content.match(/\b([A-Z]{2,5})\b/)
          if (stockSymbolMatch) {
            symbol = stockSymbolMatch[1].toUpperCase()
          }
        }
        
        console.log(`[submitUserMessage] Direct match: stock financials for ${symbol}`)
        display = (
          <BotCard>
            <ValidatedStockFinancials props={symbol} userPlan={userPlan} userEmail={userEmail} />
            <p className="mt-3">Here are the financial metrics and key data for {symbol}.</p>
          </BotCard>
        )
      } else {
        // Extract stock symbol or company name and show price
        let symbol = null
        
        // Check for company names first
        if (lowerContent.includes('amazon')) symbol = 'AMZN'
        else if (lowerContent.includes('microsoft')) symbol = 'MSFT'
        else if (lowerContent.includes('apple')) symbol = 'AAPL'
        else if (lowerContent.includes('google') || lowerContent.includes('alphabet')) symbol = 'GOOGL'
        else if (lowerContent.includes('tesla')) symbol = 'TSLA'
        else if (lowerContent.includes('meta') || lowerContent.includes('facebook')) symbol = 'META'
        else if (lowerContent.includes('nvidia')) symbol = 'NVDA'
        else if (lowerContent.includes('netflix')) symbol = 'NFLX'
        else if (lowerContent.includes('amd')) symbol = 'AMD'
        else if (lowerContent.includes('intel')) symbol = 'INTC'
        else {
          // Try to extract stock symbol
          const stockSymbolMatch = content.match(/\b([A-Z]{2,5})\b/)
          if (stockSymbolMatch) {
            symbol = stockSymbolMatch[1].toUpperCase()
          }
        }
        
        if (symbol) {
          console.log(`[submitUserMessage] Direct match: stock price for ${symbol}`)
          display = (
            <BotCard>
              <StockPrice props={symbol} />
              <p className="mt-3">Here&apos;s the current price information for {symbol}. You can also ask for charts or financial data.</p>
            </BotCard>
          )
        } else if (lowerContent.includes('price') || lowerContent.includes('value') || lowerContent.includes('worth')) {
          display = <BotMessage content="Please specify a stock symbol for price information. For example: &apos;What&apos;s the price of AAPL?&apos; or &apos;Show me TSLA price&apos;." />
        } else {
          // Fallback response for unmatched queries
          console.log(`[submitUserMessage] No specific pattern matched, showing help message`)
          display = <BotMessage content="I can help you with stock information and market data. Try asking about:\n• Stock prices: &apos;What is the price of Apple?&apos;\n• Charts: &apos;Show me a chart for GOOGL&apos;\n• Market data: &apos;How is the market performing today?&apos;\n• News: &apos;What are recent events about Amazon?&apos;\n• Financials: &apos;What are Microsoft&apos;s latest financials?&apos;" />
        }
      }
      
      console.log(`[submitUserMessage] Display component prepared successfully`)
    }
    
    // Update AI state for all responses
            aiState.done({
              ...aiState.get(),
              messages: [
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: 'assistant',
          content: 'Displayed financial data widget'
        }
      ]
    })
    
    return {
      id: nanoid(),
      display
    }
  } catch (err: any) {
    console.error(`[submitUserMessage] Critical error:`, err)
    console.error(`[submitUserMessage] Error stack:`, err.stack)
    console.error(`[submitUserMessage] Original message:`, content)
    
    aiState.done({
      ...aiState.get(),
      messages: [
        ...aiState.get().messages,
        {
          id: nanoid(),
          role: 'assistant',
          content: `Error: ${err.message}`
        }
      ]
    })
    
    return {
      id: nanoid(),
      display: (
        <div className="border border-red-300 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-950/20">
          <div className="text-red-700 dark:text-red-400 font-medium">⚠️ Error Processing Request</div>
          <p className="text-sm text-muted-foreground mt-2">
            {err.message || 'An unexpected error occurred'}
          </p>
          <p className="text-xs text-muted-foreground mt-3">
            Please try asking in a different way, such as:
          </p>
          <ul className="text-xs text-muted-foreground mt-1 ml-4 list-disc">
            <li>&quot;What is the price of Apple?&quot;</li>
            <li>&quot;Show me a chart for GOOGL&quot;</li>
            <li>&quot;How is the market performing today?&quot;</li>
          </ul>
        </div>
      )
    }
  }
}

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] }
})