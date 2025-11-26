import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { PromptForm } from '@/components/prompt-form'
import type { AI } from '@/lib/chat/actions'
import { useAIState, useActions, useUIState } from 'ai/rsc'
import { nanoid } from 'nanoid'
import * as React from 'react'
import { useState } from 'react'
import { UserMessage } from './stocks/message'

export interface ChatPanelProps {
  id?: string
  title?: string
  input: string
  setInput: (value: string) => void
  isAtBottom: boolean
  userPlan?: string
  userEmail?: string
  scrollToBottom: () => void
}

export function ChatPanel({
  id,
  title,
  input,
  setInput,
  isAtBottom,
  userPlan = 'free',
  userEmail = '',
  scrollToBottom
}: ChatPanelProps) {
  const [aiState] = useAIState()
  const [messages, setMessages] = useUIState<typeof AI>()
  const { submitUserMessage } = useActions()

  const exampleMessages = [
    {
      heading: 'What is the price',
      subheading: 'of Apple Inc.?',
      message: 'What is the price of Apple stock?'
    },
    {
      heading: 'Show me a stock chart',
      subheading: 'for $GOOGL',
      message: 'Show me a stock chart for $GOOGL'
    },
    {
      heading: 'What are some recent',
      subheading: `events about Amazon?`,
      message: `What are some recent events about Amazon?`
    },
    {
      heading: `What are Microsoft's`,
      subheading: 'latest financials?',
      message: `What are Microsoft's latest financials?`
    },
    {
      heading: 'How is the stock market',
      subheading: 'performing today by sector?',
      message: `How is the stock market performing today by sector?`
    },
    {
      heading: 'Show me a screener',
      subheading: 'to find new stocks',
      message: 'Show me a screener to find new stocks'
    }
  ]

  interface ExampleMessage {
    heading: string
    subheading: string
    message: string
  }

  // Initialize with shuffled examples immediately to avoid empty state on first render
  const [randExamples] = useState<ExampleMessage[]>(() => {
    return [...exampleMessages].sort(() => 0.5 - Math.random())
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submittingRef = React.useRef(false)

  return (
    <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-gradient-to-t from-white/95 via-white/80 to-transparent dark:from-slate-900/95 dark:via-slate-900/80 dark:to-transparent backdrop-blur-xl duration-300 ease-in-out animate-in border-t border-gray-200/50 dark:border-slate-700/50">
      <ButtonScrollToBottom
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
      />

      <div className="mx-auto sm:max-w-2xl px-4 sm:px-6">
        <div className="mb-4 mt-2">
          {/* Mobile: Show 4 cards in 2x2 grid */}
          <div className="grid grid-cols-2 gap-2 sm:hidden">
            {messages.length === 0 &&
              randExamples.slice(0, 4).map((example, index) => (
                <div
                  key={`mobile-${example.heading}`}
                  className={`relative group p-2.5 rounded-lg cursor-pointer bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50 hover:border-blue-400/50 dark:hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200 flex flex-col justify-start overflow-hidden ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={async (e) => {
                    e.preventDefault()
                    e.stopPropagation()

                    if (submittingRef.current) {
                      console.log('Already submitting, ignoring click')
                      return
                    }

                    console.log('Mobile prompt clicked:', example.message)
                    console.log('User plan:', userPlan, 'User email:', userEmail)
                    submittingRef.current = true
                    setIsSubmitting(true)
                    
                    // Add user message immediately
                    const userMessageId = nanoid()
                    setMessages(currentMessages => [
                      ...currentMessages,
                      {
                        id: userMessageId,
                        display: <UserMessage>{example.message}</UserMessage>
                      }
                    ])

                    try {
                      console.log('Submitting to AI:', example.message)
                      const responseMessage = await submitUserMessage(
                        example.message,
                        userPlan,
                        userEmail
                      )
                      console.log('Received response from AI:', responseMessage)
                      
                      if (responseMessage && responseMessage.display) {
                        setMessages(currentMessages => [
                          ...currentMessages,
                          responseMessage
                        ])
                        console.log('Message added to UI')
                      } else {
                        console.error('Invalid response from AI:', responseMessage)
                        throw new Error('Invalid response from AI')
                      }
                    } catch (error) {
                      console.error('Error submitting message:', error)
                      // Add error message to UI
                      setMessages(currentMessages => [
                        ...currentMessages,
                        {
                          id: nanoid(),
                          display: (
                            <div className="p-4 border border-red-300 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950/20">
                              <p className="text-red-700 dark:text-red-400 font-medium">Error processing your request</p>
                              <p className="text-sm text-muted-foreground mt-1">Please try again or ask in a different way.</p>
                            </div>
                          )
                        }
                      ])
                    } finally {
                      submittingRef.current = false
                      setIsSubmitting(false)
                      console.log('Submission complete')
                    }
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-primary/8 transition-all duration-200" />
                  <div className="relative z-10">
                    <div className="text-xs font-semibold text-foreground mb-1 line-clamp-2">{example.heading}</div>
                    <div className="text-[10px] text-muted-foreground line-clamp-1">
                      {example.subheading}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Desktop: Show all 4 cards in 2x2 grid */}
          <div className="hidden sm:grid sm:grid-cols-2 gap-3">
            {messages.length === 0 &&
              randExamples.slice(0, 4).map((example, index) => (
                <div
                  key={`desktop-${example.heading}`}
                  className={`relative group p-3.5 rounded-xl cursor-pointer bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50 hover:border-blue-400/50 dark:hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200 flex flex-col justify-start overflow-hidden ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={async (e) => {
                    e.preventDefault()
                    e.stopPropagation()

                    if (submittingRef.current) {
                      console.log('Already submitting, ignoring click')
                      return
                    }

                    console.log('Desktop prompt clicked:', example.message)
                    console.log('User plan:', userPlan, 'User email:', userEmail)
                    submittingRef.current = true
                    setIsSubmitting(true)
                    
                    // Add user message immediately
                    const userMessageId = nanoid()
                    setMessages(currentMessages => [
                      ...currentMessages,
                      {
                        id: userMessageId,
                        display: <UserMessage>{example.message}</UserMessage>
                      }
                    ])

                    try {
                      console.log('Submitting to AI:', example.message)
                      const responseMessage = await submitUserMessage(
                        example.message,
                        userPlan,
                        userEmail
                      )
                      console.log('Received response from AI:', responseMessage)
                      
                      if (responseMessage && responseMessage.display) {
                        setMessages(currentMessages => [
                          ...currentMessages,
                          responseMessage
                        ])
                        console.log('Message added to UI')
                      } else {
                        console.error('Invalid response from AI:', responseMessage)
                        throw new Error('Invalid response from AI')
                      }
                    } catch (error) {
                      console.error('Error submitting message:', error)
                      // Add error message to UI
                      setMessages(currentMessages => [
                        ...currentMessages,
                        {
                          id: nanoid(),
                          display: (
                            <div className="p-4 border border-red-300 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950/20">
                              <p className="text-red-700 dark:text-red-400 font-medium">Error processing your request</p>
                              <p className="text-sm text-muted-foreground mt-1">Please try again or ask in a different way.</p>
                            </div>
                          )
                        }
                      ])
                    } finally {
                      submittingRef.current = false
                      setIsSubmitting(false)
                      console.log('Submission complete')
                    }
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-primary/8 transition-all duration-200" />
                  <div className="relative z-10">
                    <div className="text-sm font-semibold text-foreground mb-1.5 line-clamp-1">{example.heading}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {example.subheading}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4 px-0 py-4 sm:py-5">
          <PromptForm input={input} setInput={setInput} userPlan={userPlan} userEmail={userEmail} />
        </div>
      </div>
    </div>
  )
}
