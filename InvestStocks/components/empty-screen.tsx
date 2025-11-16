import { UseChatHelpers } from 'ai/react'
import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'
import { IconArrowRight } from '@/components/ui/icons'
import { RiRobot2Line, RiSparklingLine } from 'react-icons/ri'
import { MdChartCandlestick, MdShowChart, MdInsights } from 'react-icons/md'

export function EmptyScreen() {
  return (
    <div className="mx-auto sm:max-w-2xl py-4">
      {/* Hero Card - Apple Glass Style */}
      <div className="relative overflow-hidden glass-morphism rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 p-4 sm:p-6 mb-4 group">
        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-info/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 -z-10" />
        
        {/* Top highlight shine */}
        <div className="absolute inset-x-0 top-0 h-px glass-highlight" />
        
        <div className="relative z-10">
          {/* Icon */}
          <div className="mb-4 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
              <RiRobot2Line className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                AI Investment Assistant
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">Powered by advanced AI technology</p>
            </div>
          </div>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-5">
            Get instant insights on stocks, crypto, and market trends. Ask questions naturally and receive real-time data, interactive charts, and intelligent analysis.
          </p>

          {/* Features Grid - Frosted Glass Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="group/card relative glass-morphism-light rounded-xl p-3.5 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-x-0 top-0 h-px glass-highlight" />
              <div className="relative">
                <div className="w-10 h-10 glass-icon rounded-lg flex items-center justify-center mb-2 group-hover/card:scale-110 transition-transform duration-300">
                  <MdShowChart className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Live Charts</h3>
                <p className="text-xs text-muted-foreground leading-snug">Real-time market data & interactive visualizations</p>
              </div>
            </div>

            <div className="group/card relative glass-morphism-light rounded-xl p-3.5 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-x-0 top-0 h-px glass-highlight" />
              <div className="relative">
                <div className="w-10 h-10 glass-icon rounded-lg flex items-center justify-center mb-2 group-hover/card:scale-110 transition-transform duration-300">
                  <RiSparklingLine className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">AI Analysis</h3>
                <p className="text-xs text-muted-foreground leading-snug">Smart insights powered by AI technology</p>
              </div>
            </div>

            <div className="group/card relative glass-morphism-light rounded-xl p-3.5 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-x-0 top-0 h-px glass-highlight" />
              <div className="relative">
                <div className="w-10 h-10 glass-icon rounded-lg flex items-center justify-center mb-2 group-hover/card:scale-110 transition-transform duration-300">
                  <MdInsights className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Instant Answers</h3>
                <p className="text-xs text-muted-foreground leading-snug">Quick responses to your investment queries</p>
              </div>
            </div>
          </div>

          {/* CTA - Frosted Glass */}
          <div className="relative glass-morphism-ultra mt-5 p-3 rounded-xl hover:shadow-md transition-all duration-300 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px glass-highlight" />
            <p className="text-xs text-center text-muted-foreground relative z-10">
              💡 <span className="font-semibold text-foreground">Pro Tip:</span> Try asking about specific stocks, market trends, or company financials
            </p>
          </div>
        </div>
      </div>

      {/* Quick Examples Text */}
      <div className="text-center mb-3">
        <p className="text-xs text-muted-foreground">💬 Select a prompt below to get started</p>
      </div>
    </div>
  )
}
