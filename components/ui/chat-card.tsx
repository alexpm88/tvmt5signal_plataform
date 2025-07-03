"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { User, Bot, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChatMessageProps {
  content: string
  sender: "user" | "bot"
  timestamp?: string
  className?: string
}

export const ChatMessage = React.forwardRef<HTMLDivElement, ChatMessageProps>(
  ({ content, sender, timestamp, className }, ref) => {
    const isUser = sender === "user"
    const Icon = isUser ? User : Bot
    const iconColor = isUser ? "text-indigo-600" : "text-cyan-600"
    const bgGradient = isUser ? "from-indigo-500 to-purple-600" : "from-cyan-600 to-blue-600"

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={cn("relative h-full w-full", className)}
      >
        {/* Background gradient */}
        <div className={cn("absolute rounded-xl ", bgGradient)} />

        {/* Content */}
        <div className="relative z-10 rounded-xl flex h-full flex-col justify-between p-6 backdrop-blur-sm shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_-4px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center space-x-1">
                <p className={cn("text-sm font-medium", isUser ? "text-indigo-700" : "text-blue-700")}>
                  {isUser ? "Usuario" : "Asistente"}
                </p>
                {timestamp && (
                  <p className="text-xs text-white/60">{timestamp}</p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-slate-500 text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
              </div>
            </div>
            <div className={cn("flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-lg backdrop-blur-lm")}>
              <Icon className={cn("h-6 w-6", iconColor)} />
            </div>
          </div>
        </div>
      </motion.div>
    )
  }
)
ChatMessage.displayName = "ChatMessage"

interface ChatCardProps {
  messages: ChatMessageProps[]
  onSendMessage?: (message: string) => void
  className?: string
}

export function ChatCard({ messages, onSendMessage, className }: ChatCardProps) {
  const [inputValue, setInputValue] = React.useState("")
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && onSendMessage) {
      onSendMessage(inputValue)
      setInputValue("")
    }
  }



  return (
    <div className={cn("flex flex-col h-full w-full", className)}>
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            content={message.content}
            sender={message.sender}
            timestamp={message.timestamp}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700/50">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <Button type="submit" className="group">
            Enviar
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </form>
    </div>
  )
}