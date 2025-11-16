import { ObjectId } from 'mongodb'

export type AlertType = 
  // Price alerts
  | 'price_limit_upper' | 'price_limit_lower'
  | 'price_change_1day' | 'price_change_from_current'
  | 'price_increase_from_current' | 'price_decrease_from_current'
  | 'closing_price_change'
  
  // Percent change alerts  
  | 'percent_change_from_open' | 'percent_change_from_current'
  | 'percent_increase_from_current' | 'percent_decrease_from_current'
  | 'closing_percent_change'
  
  // Recurring time alerts
  | 'opening_price_alert' | 'midday_price_alert' | 'closing_price_alert'
  | 'interval_alert'
  
  // Trailing alerts
  | 'trailing_stop_loss_price' | 'trailing_stop_loss_percent'
  | 'trailing_buy_stop_price' | 'trailing_buy_stop_percent'
  
  // 52-week alerts
  | 'fifty_two_week_high' | 'fifty_two_week_low'
  | 'percent_from_52_week_high' | 'percent_from_52_week_low'
  
  // Volume alerts
  | 'volume_deviation_from_average' | 'volume_percentage_change'
  | 'volume_spike' | 'volume_dip'
  
  // SMA alerts
  | 'sma_5_price_target' | 'sma_10_price_target' | 'sma_20_price_target'
  | 'sma_30_price_target' | 'sma_50_price_target' | 'sma_100_price_target' | 'sma_200_price_target'
  | 'sma_5_price_cross' | 'sma_10_price_cross' | 'sma_20_price_cross'
  | 'sma_30_price_cross' | 'sma_50_price_cross' | 'sma_100_price_cross' | 'sma_200_price_cross'
  
  // EMA alerts
  | 'ema_5_price_target' | 'ema_10_price_target' | 'ema_20_price_target'
  | 'ema_30_price_target' | 'ema_50_price_target' | 'ema_100_price_target' | 'ema_200_price_target'
  
  // MACD alerts
  | 'macd_limit_target' | 'macd_bearish_crossover' | 'macd_bullish_crossover'
  
  // RSI alerts
  | 'rsi_limit_target' | 'rsi_overbought' | 'rsi_oversold'
  
  // Bollinger Bands alerts
  | 'bollinger_bullish_signal' | 'bollinger_bearish_signal'
  
  // Pattern alerts
  | 'death_cross' | 'golden_cross'
  
  // Earnings alerts
  | 'upcoming_earnings_target' | 'upcoming_earnings_tomorrow'
  | 'upcoming_earnings_3_days' | 'upcoming_earnings_week' | 'upcoming_earnings_month'
  
  // P/E Ratio alerts
  | 'pe_ratio_upper_limit' | 'pe_ratio_lower_limit'
  | 'pe_ratio_change' | 'pe_ratio_percent_change'
  
  // Market Cap alerts
  | 'market_cap_upper_limit' | 'market_cap_lower_limit'
  | 'market_cap_change' | 'market_cap_percent_change'
  
  // Market status alerts
  | 'market_open' | 'market_close'
  
  // Economic data alerts
  | 'new_gdp_data' | 'new_cpi_data' | 'new_unemployment_data'
  | 'new_federal_funds_rate' | 'new_housing_starts' | 'new_industrial_production'

export type ComparisonOperator = 'above' | 'below' | 'equal' | 'increase' | 'decrease'
export type ComparisonReference = 'current' | 'open' | 'close' | 'high' | 'low' | 'sma' | 'ema' | 'rsi' | 'macd'
export type NotificationMethod = 'email' | 'push' | 'sms'

export interface TriggerCondition {
  type: 'price_limit' | 'percent_change' | 'volume' | 'technical' | 'time_based' | 'economic'
  operator: ComparisonOperator
  value: number
  reference: ComparisonReference
  timeframe?: string // for moving averages (5, 10, 20, etc.)
  interval?: string // for recurring alerts ('15min', '30min', '1hour')
}

export interface Alert {
  _id?: ObjectId
  userId: string
  symbol: string
  name: string
  alertType: AlertType
  
  // Configuration
  triggerCondition: TriggerCondition
  
  // Status
  isActive: boolean
  triggered: boolean
  triggeredAt?: Date
  lastChecked: Date
  
  // Notification settings
  notificationMethods: NotificationMethod[]
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  expiresAt?: Date
}

export interface AlertLog {
  _id?: ObjectId
  userId: string
  alertId: ObjectId
  symbol: string
  alertType: AlertType
  triggerValue: number
  actualValue: number
  triggeredAt: Date
  notificationSent: boolean
  notificationMethods: NotificationMethod[]
}

export interface MarketData {
  _id?: ObjectId
  symbol: string
  data: {
    // Basic price data
    price: number
    change: number
    changePercent: number
    volume: number
    open: number
    high: number
    low: number
    close: number
    previousClose: number
    
    // Technical indicators
    sma5?: number
    sma10?: number
    sma20?: number
    sma30?: number
    sma50?: number
    sma100?: number
    sma200?: number
    ema5?: number
    ema10?: number
    ema20?: number
    ema30?: number
    ema50?: number
    ema100?: number
    ema200?: number
    rsi?: number
    macd?: number
    macdSignal?: number
    macdHistogram?: number
    
    // Bollinger Bands
    bollinger_upper?: number
    bollinger_middle?: number
    bollinger_lower?: number
    
    // 52-week data
    week52High?: number
    week52Low?: number
    
    // Volume data
    avgVolume?: number
    volumeDeviation?: number
    
    // Market cap and ratios
    marketCap?: number
    peRatio?: number
    
    // Earnings data
    nextEarningsDate?: string
    lastEarningsDate?: string
    estimatedEPS?: number
  }
  lastUpdated: Date
  source: 'yahoo' | 'polygon' | 'alpha_vantage' | 'iex' | 'financial_prep'
}

export interface AlertConfig {
  [key: string]: {
    name: string
    description: string
    category: 'price' | 'volume' | 'technical' | 'fundamental' | 'time' | 'earnings'
    requiredFields: string[]
    defaultNotificationMethods: NotificationMethod[]
  }
}

export const ALERT_CONFIGURATIONS: AlertConfig = {
  // Price alerts
  price_limit_upper: {
    name: 'Upper Price Limit',
    description: 'Triggered when the price moves above the set target',
    category: 'price',
    requiredFields: ['value'],
    defaultNotificationMethods: ['email', 'push']
  },
  price_limit_lower: {
    name: 'Lower Price Limit', 
    description: 'Triggered when the price moves below the set target',
    category: 'price',
    requiredFields: ['value'],
    defaultNotificationMethods: ['email', 'push']
  },
  price_change_1day: {
    name: '1-Day Price Change',
    description: 'Triggered when the price changes by a set amount from market open',
    category: 'price',
    requiredFields: ['value'],
    defaultNotificationMethods: ['email']
  },
  
  // Percent change alerts
  percent_change_from_open: {
    name: 'Percent Change from Open',
    description: 'Triggered when the price changes by a set percentage from market open',
    category: 'price',
    requiredFields: ['value'],
    defaultNotificationMethods: ['email']
  },
  
  // Volume alerts
  volume_spike: {
    name: 'Volume Spike',
    description: 'Triggered when volume spikes by 20% compared to previous day',
    category: 'volume',
    requiredFields: [],
    defaultNotificationMethods: ['email']
  },
  
  // Technical alerts
  sma_20_price_cross: {
    name: '20-Day SMA Price Cross',
    description: 'Triggered when the price crosses its 20-day simple moving average',
    category: 'technical',
    requiredFields: [],
    defaultNotificationMethods: ['email']
  },
  
  rsi_overbought: {
    name: 'RSI Overbought',
    description: 'Triggered when RSI is above 70 (overbought condition)',
    category: 'technical',
    requiredFields: [],
    defaultNotificationMethods: ['email']
  },
  
  rsi_oversold: {
    name: 'RSI Oversold',
    description: 'Triggered when RSI is below 30 (oversold condition)',
    category: 'technical',
    requiredFields: [],
    defaultNotificationMethods: ['email']
  },
  
  // 52-week alerts
  fifty_two_week_high: {
    name: '52-Week High',
    description: 'Triggered when a new 52-week high occurs',
    category: 'fundamental',
    requiredFields: [],
    defaultNotificationMethods: ['email', 'push']
  },
  
  fifty_two_week_low: {
    name: '52-Week Low',
    description: 'Triggered when a new 52-week low occurs',
    category: 'fundamental',
    requiredFields: [],
    defaultNotificationMethods: ['email', 'push']
  },
  
  // Earnings alerts
  upcoming_earnings_tomorrow: {
    name: 'Earnings Tomorrow',
    description: 'Triggered 1 day before earnings date',
    category: 'earnings',
    requiredFields: [],
    defaultNotificationMethods: ['email']
  }
}