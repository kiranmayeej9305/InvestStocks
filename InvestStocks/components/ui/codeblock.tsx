// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Markdown/CodeBlock.tsx

'use client'

import { FC, memo } from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'

import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'
import { IconCheck, IconCopy, IconDownload } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'

interface Props {
  language: string
  value: string
}

interface languageMap {
  [key: string]: string | undefined
}

export const programmingLanguages: languageMap = {
  javascript: '.js',
  python: '.py',
  java: '.java',
  c: '.c',
  cpp: '.cpp',
  'c++': '.cpp',
  'c#': '.cs',
  ruby: '.rb',
  php: '.php',
  swift: '.swift',
  'objective-c': '.m',
  kotlin: '.kt',
  typescript: '.ts',
  go: '.go',
  perl: '.pl',
  rust: '.rs',
  scala: '.scala',
  haskell: '.hs',
  lua: '.lua',
  shell: '.sh',
  sql: '.sql',
  html: '.html',
  css: '.css'
  // add more file extensions here, make sure the key is same as language prop in CodeBlock.tsx component
}

export const generateRandomString = (length: number, lowercase = false) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXY3456789' // excluding similar looking characters like Z, 2, I, 1, O, 0
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return lowercase ? result.toLowerCase() : result
}

const CodeBlock: FC<Props> = memo(({ language, value }) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })

  const downloadAsFile = () => {
    if (typeof window === 'undefined') {
      return
    }
    const fileExtension = programmingLanguages[language] || '.file'
    const suggestedFileName = `file-${generateRandomString(
      3,
      true
    )}${fileExtension}`
    const fileName = window.prompt('Enter file name', suggestedFileName)

    if (!fileName) {
      // User pressed cancel on prompt.
      return
    }

    const blob = new Blob([value], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = fileName
    link.href = url
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const onCopy = () => {
    if (isCopied) return
    copyToClipboard(value)
  }

  return (
    <div className="relative w-full font-sans codeblock bg-card border rounded-2xl overflow-hidden shadow-lg">
      <div className="flex items-center justify-between w-full px-6 py-4 pr-4 bg-gradient-to-r from-muted/50 to-muted/30 border-b">
        <span className="text-sm font-semibold text-foreground uppercase tracking-wide">{language}</span>
        <div className="flex items-center space-x-2">
                      <Button
              variant="ghost"
              className="hover:bg-muted/80 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 transition-colors"
              onClick={downloadAsFile}
              size="icon"
            >
              <IconDownload className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              <span className="sr-only">Download</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-muted/80 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 transition-colors"
              onClick={onCopy}
            >
              {isCopied ? <IconCheck className="h-4 w-4 text-green-500" /> : <IconCopy className="h-4 w-4 text-muted-foreground hover:text-foreground" />}
              <span className="sr-only">Copy code</span>
            </Button>
        </div>
      </div>
      <SyntaxHighlighter
        language={language}
        PreTag="div"
        showLineNumbers
        customStyle={{
          margin: 0,
          width: '100%',
          background: 'transparent',
          padding: '2rem 1.5rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.95rem',
          lineHeight: '1.6'
        }}
        lineNumberStyle={{
          userSelect: 'none',
          color: 'hsl(var(--muted-foreground))',
          fontSize: '0.85rem'
        }}
        codeTagProps={{
          style: {
            fontSize: '0.95rem',
            fontFamily: 'var(--font-mono)',
            lineHeight: '1.6'
          }
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  )
})
CodeBlock.displayName = 'CodeBlock'

export { CodeBlock }
