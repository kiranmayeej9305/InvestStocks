import { nanoid } from 'nanoid'
import { Chat } from '@/components/chat'
import { AI } from '@/lib/chat/actions'

export const maxDuration = 60

export default async function AIChatPage() {
  const id = nanoid()

  return (
    <AI initialAIState={{ chatId: id, messages: [] }}>
      <Chat id={id} missingKeys={[]} />
    </AI>
  )
}

