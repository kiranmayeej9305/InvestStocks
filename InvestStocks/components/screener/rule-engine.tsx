'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Icons } from '@/components/ui/icons'

interface Rule {
  id: string
  text: string
  field: string
  operator: string
  value: string | number
  validated: boolean
}

interface Suggestion {
  text: string
  type: 'field' | 'operator' | 'value' | 'example'
  description: string
  example?: string
}

// Comprehensive keyword mappings
const FIELD_KEYWORDS = {
  // Price-related
  'price': { key: 'price', description: 'Current stock price', example: 'price > 100' },
  'close': { key: 'price', description: 'Current price (same as price)', example: 'close < 50' },
  'open': { key: 'open', description: 'Opening price', example: 'open > 150' },
  'high': { key: 'high', description: 'Daily high price', example: 'high > 200' },
  'low': { key: 'low', description: 'Daily low price', example: 'low < 45' },
  'previous_close': { key: 'previousClose', description: 'Previous closing price', example: 'previous_close > 100' },
  
  // Change & Performance
  'change': { key: 'change', description: 'Price change in dollars', example: 'change > 5' },
  'change_percent': { key: 'changePercent', description: 'Price change percentage', example: 'change_percent > 2' },
  'change%': { key: 'changePercent', description: 'Price change percentage', example: 'change% > -5' },
  'gain': { key: 'changePercent', description: 'Positive price change', example: 'gain > 3' },
  'loss': { key: 'changePercent', description: 'Negative price change', example: 'loss < -2' },
  
  // Volume
  'volume': { key: 'volume', description: 'Trading volume', example: 'volume > 1000000' },
  'avg_volume': { key: 'avgVolume', description: 'Average volume', example: 'avg_volume > 500000' },
  'volume_ratio': { key: 'volumeRatio', description: 'Current volume / Average volume', example: 'volume_ratio > 2' },
  
  // Market Cap
  'market_cap': { key: 'marketCap', description: 'Market capitalization', example: 'market_cap > 1B' },
  'mcap': { key: 'marketCap', description: 'Market cap (short)', example: 'mcap < 500M' },
  'cap': { key: 'marketCap', description: 'Market cap (shortest)', example: 'cap > 10B' },
  
  // Fundamentals
  'pe': { key: 'peRatio', description: 'Price-to-Earnings ratio', example: 'pe < 15' },
  'pe_ratio': { key: 'peRatio', description: 'Price-to-Earnings ratio', example: 'pe_ratio > 20' },
  'pb': { key: 'pbRatio', description: 'Price-to-Book ratio', example: 'pb < 2' },
  'pb_ratio': { key: 'pbRatio', description: 'Price-to-Book ratio', example: 'pb_ratio > 1.5' },
  'eps': { key: 'eps', description: 'Earnings per share', example: 'eps > 5' },
  'dividend': { key: 'dividendYield', description: 'Dividend yield percentage', example: 'dividend > 3' },
  'dividend_yield': { key: 'dividendYield', description: 'Dividend yield percentage', example: 'dividend_yield > 2.5' },
  'beta': { key: 'beta', description: 'Stock volatility vs market', example: 'beta < 1.5' },
  
  // Technical Indicators
  'rsi': { key: 'rsi', description: 'Relative Strength Index (0-100)', example: 'rsi < 30' },
  'sma_20': { key: 'sma20', description: '20-day Simple Moving Average', example: 'sma_20 > price' },
  'sma_50': { key: 'sma50', description: '50-day Simple Moving Average', example: 'sma_50 < price' },
  'sma_200': { key: 'sma200', description: '200-day Simple Moving Average', example: 'sma_200 > 100' },
  'ema_20': { key: 'ema20', description: '20-day Exponential Moving Average', example: 'ema_20 > sma_20' },
  'ema_50': { key: 'ema50', description: '50-day Exponential Moving Average', example: 'ema_50 < price' },
  'macd': { key: 'macd', description: 'MACD indicator', example: 'macd > 0' },
  'macd_signal': { key: 'macdSignal', description: 'MACD signal line', example: 'macd_signal < macd' },
  
  // 52-week data
  '52w_high': { key: 'week52High', description: '52-week high price', example: '52w_high > 150' },
  '52w_low': { key: 'week52Low', description: '52-week low price', example: '52w_low < 50' },
  'year_high': { key: 'week52High', description: '52-week high (alternative)', example: 'year_high > 200' },
  'year_low': { key: 'week52Low', description: '52-week low (alternative)', example: 'year_low < 30' },
  
  // Sector & Industry
  'sector': { key: 'sector', description: 'Stock sector', example: 'sector = "Technology"' },
  'industry': { key: 'industry', description: 'Stock industry', example: 'industry contains "Software"' },
  
  // Special calculations
  'percent_from_high': { key: 'percentFromHigh', description: '% below 52-week high', example: 'percent_from_high > 20' },
  'percent_from_low': { key: 'percentFromLow', description: '% above 52-week low', example: 'percent_from_low > 50' },
  'price_to_sma20': { key: 'priceToSma20', description: 'Price vs 20-day SMA ratio', example: 'price_to_sma20 > 1.05' },
  'price_to_sma50': { key: 'priceToSma50', description: 'Price vs 50-day SMA ratio', example: 'price_to_sma50 < 0.95' }
}

const OPERATORS = {
  '>': { symbol: '>', description: 'Greater than', example: 'price > 100' },
  '<': { symbol: '<', description: 'Less than', example: 'price < 50' },
  '>=': { symbol: '>=', description: 'Greater than or equal', example: 'volume >= 1000000' },
  '<=': { symbol: '<=', description: 'Less than or equal', example: 'pe <= 15' },
  '=': { symbol: '=', description: 'Equal to', example: 'sector = "Technology"' },
  '==': { symbol: '==', description: 'Equal to (alternative)', example: 'rsi == 50' },
  '!=': { symbol: '!=', description: 'Not equal to', example: 'sector != "Utilities"' },
  'contains': { symbol: 'contains', description: 'Text contains', example: 'industry contains "Software"' },
  'starts_with': { symbol: 'starts_with', description: 'Text starts with', example: 'sector starts_with "Tech"' },
  'ends_with': { symbol: 'ends_with', description: 'Text ends with', example: 'industry ends_with "Services"' },
  'between': { symbol: 'between', description: 'Value between range', example: 'price between 50 and 100' },
  'in': { symbol: 'in', description: 'Value in list', example: 'sector in ["Technology", "Healthcare"]' }
}

const LOGICAL_OPERATORS = {
  'and': { symbol: 'and', description: 'Both conditions must be true', example: 'price > 100 and volume > 1000000' },
  'or': { symbol: 'or', description: 'Either condition can be true', example: 'rsi < 30 or rsi > 70' },
  'not': { symbol: 'not', description: 'Negates the condition', example: 'not (sector = "Utilities")' },
  '&&': { symbol: '&&', description: 'Both conditions (alternative)', example: 'price > 100 && pe < 15' },
  '||': { symbol: '||', description: 'Either condition (alternative)', example: 'gain > 5% || volume_ratio > 3' }
}

const COMMON_VALUES = {
  // Market cap shortcuts
  '1M': 1000000,
  '10M': 10000000,
  '100M': 100000000,
  '1B': 1000000000,
  '10B': 10000000000,
  '100B': 100000000000,
  '1T': 1000000000000,
  
  // Sectors
  'Technology': 'Technology',
  'Healthcare': 'Healthcare',
  'Financial': 'Financial',
  'Energy': 'Energy',
  'Consumer': 'Consumer',
  'Industrial': 'Industrial',
  'Materials': 'Materials',
  'Utilities': 'Utilities',
  'RealEstate': 'Real Estate',
  'Communication': 'Communication Services'
}

const EXAMPLE_QUERIES = [
  'price > 100 and volume > 1000000',
  'pe < 15 and market_cap > 1B',
  'rsi < 30 and sector = "Technology"',
  'change_percent > 5 and volume_ratio > 2',
  'dividend_yield > 3 and pe < 20',
  'price > sma_50 and sma_50 > sma_200',
  'market_cap between 1B and 10B',
  'sector in ["Technology", "Healthcare"]',
  'percent_from_high > 20 and volume > avg_volume',
  'beta < 1.2 and eps > 0 and dividend > 2'
]

export function RuleEngine({ onRulesChange }: { onRulesChange: (rules: Rule[]) => void }) {
  const [inputValue, setInputValue] = useState('')
  const [rules, setRules] = useState<Rule[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0)
  const [cursorPosition, setCursorPosition] = useState(0)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Generate suggestions based on current input
  const generateSuggestions = useCallback((text: string, position: number) => {
    if (!text.trim()) {
      return EXAMPLE_QUERIES.map(query => ({
        text: query,
        type: 'example' as const,
        description: 'Example query',
        example: query
      }))
    }

    const beforeCursor = text.substring(0, position).toLowerCase()
    const lastWord = beforeCursor.split(/[\s()]+/).pop() || ''
    const suggestions: Suggestion[] = []

    // Field suggestions
    Object.entries(FIELD_KEYWORDS).forEach(([keyword, config]) => {
      if (keyword.toLowerCase().includes(lastWord) || lastWord === '') {
        suggestions.push({
          text: keyword,
          type: 'field',
          description: config.description,
          example: config.example
        })
      }
    })

    // Operator suggestions
    Object.entries(OPERATORS).forEach(([op, config]) => {
      if (op.toLowerCase().includes(lastWord) || lastWord === '') {
        suggestions.push({
          text: op,
          type: 'operator',
          description: config.description,
          example: config.example
        })
      }
    })

    // Logical operator suggestions
    Object.entries(LOGICAL_OPERATORS).forEach(([op, config]) => {
      if (op.toLowerCase().includes(lastWord)) {
        suggestions.push({
          text: op,
          type: 'operator',
          description: config.description,
          example: config.example
        })
      }
    })

    // Value suggestions
    Object.entries(COMMON_VALUES).forEach(([value, actualValue]) => {
      if (value.toLowerCase().includes(lastWord)) {
        suggestions.push({
          text: value,
          type: 'value',
          description: `Represents ${actualValue}`,
          example: `market_cap > ${value}`
        })
      }
    })

    return suggestions.slice(0, 10) // Limit to 10 suggestions
  }, [])

  // Update suggestions when input changes
  useEffect(() => {
    const newSuggestions = generateSuggestions(inputValue, cursorPosition)
    setSuggestions(newSuggestions)
    setSelectedSuggestionIndex(0)
    setShowSuggestions(newSuggestions.length > 0)
  }, [inputValue, cursorPosition, generateSuggestions])

  const handleInputChange = (value: string) => {
    setInputValue(value)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (showSuggestions && suggestions.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedSuggestionIndex((prev) => 
            prev < suggestions.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedSuggestionIndex((prev) => 
            prev > 0 ? prev - 1 : suggestions.length - 1
          )
          break
        case 'Tab':
        case 'Enter':
          if (e.key === 'Enter' && e.shiftKey) {
            // Allow new line on Shift+Enter
            break
          }
          e.preventDefault()
          applySuggestion(suggestions[selectedSuggestionIndex])
          break
        case 'Escape':
          setShowSuggestions(false)
          break
      }
    }
  }

  const applySuggestion = (suggestion: Suggestion) => {
    if (!inputRef.current) return

    const textarea = inputRef.current
    const start = textarea.selectionStart || 0
    const end = textarea.selectionEnd || 0
    const beforeCursor = inputValue.substring(0, start)
    const afterCursor = inputValue.substring(end)
    
    // Find the last word to replace
    const words = beforeCursor.split(/[\s()]+/)
    const lastWord = words.pop() || ''
    const beforeLastWord = words.join(' ') + (words.length > 0 ? ' ' : '')
    
    let newText = suggestion.text
    if (suggestion.type === 'example') {
      newText = suggestion.text // Replace entire input with example
      setInputValue(newText)
    } else {
      const newValue = beforeLastWord + newText + ' ' + afterCursor
      setInputValue(newValue)
      
      // Set cursor position after the inserted text
      setTimeout(() => {
        const newPosition = beforeLastWord.length + newText.length + 1
        textarea.setSelectionRange(newPosition, newPosition)
        setCursorPosition(newPosition)
      }, 0)
    }
    
    setShowSuggestions(false)
  }

  const parseRules = (text: string): Rule[] => {
    const lines = text.split('\n').filter(line => line.trim())
    return lines.map((line, index) => ({
      id: `rule_${index}`,
      text: line.trim(),
      field: 'price', // This would be parsed from the actual rule
      operator: '>',
      value: 0,
      validated: validateRule(line.trim())
    }))
  }

  const validateRule = (rule: string): boolean => {
    // Simple validation - check if rule contains field and operator
    const hasField = Object.keys(FIELD_KEYWORDS).some(field => 
      rule.toLowerCase().includes(field.toLowerCase())
    )
    const hasOperator = Object.keys({...OPERATORS, ...LOGICAL_OPERATORS}).some(op => 
      rule.includes(op)
    )
    return hasField && hasOperator
  }

  const addRules = () => {
    if (inputValue.trim()) {
      const newRules = parseRules(inputValue)
      const updatedRules = [...rules, ...newRules]
      setRules(updatedRules)
      onRulesChange(updatedRules)
      setInputValue('')
    }
  }

  const removeRule = (ruleId: string) => {
    const updatedRules = rules.filter(rule => rule.id !== ruleId)
    setRules(updatedRules)
    onRulesChange(updatedRules)
  }

  const clearRules = () => {
    setRules([])
    onRulesChange([])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.activity className="h-5 w-5" />
          Smart Rule Engine
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Type natural language criteria like &quot;price {'>'}100 and volume {'>'} 1M&quot; or &quot;pe {'<'} 15 and sector = Technology&quot;
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Area */}
        <div className="relative">
          <Textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown as any}
            onSelect={(e) => setCursorPosition((e.target as HTMLTextAreaElement).selectionStart || 0)}
            placeholder="Enter your screening criteria... e.g., price > 100 and pe < 15"
            className="min-h-[80px] resize-none"
            rows={3}
          />
          
          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border rounded-md shadow-lg max-h-64 overflow-y-auto z-50">
              {suggestions.map((suggestion, index) => (
                <div
                  key={`${suggestion.text}-${index}`}
                  className={`p-3 cursor-pointer border-b last:border-b-0 ${
                    index === selectedSuggestionIndex 
                      ? 'bg-blue-50 dark:bg-blue-900/20' 
                      : 'hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
                  onClick={() => applySuggestion(suggestion)}
                >
                  <div className="flex items-start gap-2">
                    <Badge variant={
                      suggestion.type === 'field' ? 'default' :
                      suggestion.type === 'operator' ? 'secondary' :
                      suggestion.type === 'value' ? 'outline' : 'destructive'
                    } className="text-xs">
                      {suggestion.type}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm font-medium">{suggestion.text}</div>
                      <div className="text-xs text-muted-foreground">{suggestion.description}</div>
                      {suggestion.example && (
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          Example: {suggestion.example}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={addRules} disabled={!inputValue.trim()}>
            <Icons.plus className="h-4 w-4 mr-2" />
            Add Rules
          </Button>
          <Button variant="outline" onClick={clearRules} disabled={rules.length === 0}>
            Clear All
          </Button>
        </div>

        {/* Active Rules */}
        {rules.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Active Rules ({rules.length})</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-800 rounded-md"
                >
                  <div className={`w-2 h-2 rounded-full ${rule.validated ? 'bg-green-500' : 'bg-red-500'}`} />
                  <code className="flex-1 text-sm font-mono">{rule.text}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRule(rule.id)}
                    className="p-1 h-auto"
                  >
                    <Icons.close className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Examples */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Quick Examples</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {EXAMPLE_QUERIES.slice(0, 6).map((query, index) => (
              <button
                key={index}
                onClick={() => setInputValue(query)}
                className="p-2 text-left bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md text-xs font-mono transition-colors"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}