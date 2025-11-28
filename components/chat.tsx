'use client'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { useEffect, useState } from 'react'
import { useUIState, useAIState } from 'ai/rsc'
import { Message, Session } from '@/lib/types'
import { usePathname, useRouter } from 'next/navigation'
import { useScrollAnchor } from '@/lib/hooks/use-scroll-anchor'
import { toast } from 'sonner'
import { TickerTape } from '@/components/tradingview/ticker-tape'
import { MissingApiKeyBanner } from '@/components/missing-api-key-banner'

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
  session?: Session
  missingKeys: string[]
}

export function Chat({ id, className, session, missingKeys }: ChatProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [input, setInput] = useState('')
  const [messages] = useUIState()
  const [aiState] = useAIState()
  const [userPlan, setUserPlan] = useState('free')
  const [userEmail, setUserEmail] = useState('')

  // Get pathname safely after component mounts
  const pathname = usePathname()
  const path = mounted ? pathname : ''

  useEffect(() => {
    setMounted(true)
  }, [])

  const [_, setNewChatId] = useLocalStorage('newChatId', id)

  // Get user info from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('InvestSentry_user')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setUserEmail(user.email || '')
        setUserPlan(user.plan || 'free')
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }, [])

  useEffect(() => {
    if (session?.user) {
      if (!path.includes('chat') && messages.length === 1) {
        window.history.replaceState({}, '', `/chat/${id}`)
      }
    }
  }, [id, path, session?.user, messages])

  // Don't refresh on every message - this was causing the chat to reset
  // useEffect(() => {
  //   const messagesLength = aiState.messages?.length
  //   if (messagesLength === 2) {
  //     router.refresh()
  //   }
  //   console.log('Value: ', aiState.messages)
  // }, [aiState.messages, router])

  useEffect(() => {
    setNewChatId(id)
  })

  useEffect(() => {
    missingKeys.map(key => {
      toast.error(`Missing ${key} environment variable!`)
    })
  }, [missingKeys])

  const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } =
    useScrollAnchor()

  return (
    <div
      className="group w-full overflow-auto h-full pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]"
      ref={scrollRef}
    >
      {messages.length ? (
        <MissingApiKeyBanner missingKeys={missingKeys} />
      ) : (
        <TickerTape />
      )}

      <div
        className={cn(
          messages.length ? 'pb-[200px] sm:pb-[220px] pt-4 md:pt-6' : 'pb-[200px] sm:pb-[220px] pt-8',
          'mobile-container',
          className
        )}
        ref={messagesRef}
      >
        {messages.length ? (
          <ChatList messages={messages} isShared={false} session={session} />
        ) : (
          <EmptyScreen />
        )}
        <div className="w-full h-px" ref={visibilityRef} />
      </div>
      <ChatPanel
        id={id}
        input={input}
        setInput={setInput}
        isAtBottom={isAtBottom}
        userPlan={userPlan}
        userEmail={userEmail}
        scrollToBottom={scrollToBottom}
      />
    </div>
  )
}
