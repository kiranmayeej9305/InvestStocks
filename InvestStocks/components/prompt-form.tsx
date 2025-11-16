'use client'

import * as React from 'react'
import Textarea from 'react-textarea-autosize'

import { useActions, useUIState } from 'ai/rsc'

import { UserMessage } from './stocks/message'
import { type AI } from '@/lib/chat/actions'
import { Button } from '@/components/ui/button'
import { IconArrowDown } from '@/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { nanoid } from 'nanoid'

import { useLocalStorage } from '@/lib/hooks/use-local-storage'

export function PromptForm({
  input,
  setInput,
  userPlan = 'free',
  userEmail = ''
}: {
  input: string
  setInput: (value: string) => void
  userPlan?: string
  userEmail?: string
}) {
  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const { submitUserMessage } = useActions()
  const [_, setMessages] = useUIState<typeof AI>()
  const [apiKey, setApiKey] = useLocalStorage('groqKey', '')

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <form
      ref={formRef}
      onSubmit={async (e: any) => {
        e.preventDefault()

        // Blur focus on mobile
        if (window.innerWidth < 600) {
          e.target['message']?.blur()
        }

        const value = input.trim()
        setInput('')
        if (!value) return

        // Optimistically add user message UI
        setMessages(currentMessages => [
          ...currentMessages,
          {
            id: nanoid(),
            display: <UserMessage>{value}</UserMessage>
          }
        ])

        // Submit and get response message
        const responseMessage = await submitUserMessage(value, userPlan, userEmail)
        setMessages(currentMessages => [...currentMessages, responseMessage])
      }}
    >
      <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl px-4 sm:px-8 lg:px-12 border border-gray-200/50 dark:border-slate-700/50 rounded-xl sm:rounded-2xl shadow-lg hover:border-primary/30 dark:hover:border-primary/50 transition-all duration-200"
        style={{ boxShadow: '0 10px 15px -3px rgba(255, 107, 53, 0.05)' }}
      >
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          placeholder="Ask about stocks, charts, or market trends..."
          className="min-h-[50px] sm:min-h-[60px] w-full resize-none bg-transparent px-4 sm:px-6 pr-12 sm:pr-16 py-3 sm:py-[1.3rem] focus-within:outline-none text-sm sm:text-base placeholder:text-muted-foreground/60"
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          name="message"
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <div className="absolute right-2 top-3 sm:right-4 sm:top-[13px]">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                type="submit" 
                size="icon" 
                disabled={input === ''}
                className="size-8 sm:size-10 touch-target disabled:opacity-50 bg-primary hover:bg-primary/90 disabled:bg-gray-400 text-white shadow-lg transition-all"
              >
                <div className="rotate-180">
                  <IconArrowDown className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="sr-only">Send message</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send message</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </form>
  )
}
