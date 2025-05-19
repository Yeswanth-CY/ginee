"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, Send } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { ApiKeySetup } from "@/components/api-key-setup"

// Import the Gemini integration
import { queryGemini } from "@/lib/gemini-integration"

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

export default function ChatPage() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isApiConfigured, setIsApiConfigured] = useState(false)
  const { user, supabase } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Add state to track if we're checking API key status
  const [isCheckingApiKey, setIsCheckingApiKey] = useState(true)

  // Load chat history
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("chat_history")
          .select("*")
          .eq("user_id", user.id)
          .order("timestamp", { ascending: true })
          .limit(50)

        if (error) throw error

        if (data) {
          setMessages(
            data.map((msg) => ({
              id: msg.id,
              content: msg.message,
              isUser: msg.is_user,
              timestamp: new Date(msg.timestamp),
            })),
          )
        }
      } catch (error) {
        console.error("Error fetching chat history:", error)
      }
    }

    fetchChatHistory()
  }, [user, supabase])

  // Add welcome message if no messages
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          content: `Hi ${user?.user_metadata?.name || "there"}! I'm Ginee, your personalized learning assistant. How can I help you today?`,
          isUser: false,
          timestamp: new Date(),
        },
      ])
    }
  }, [messages, user])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle API key configuration
  const handleApiConfigured = () => {
    setIsApiConfigured(true)
  }

  // Add useEffect to check if API key is configured
  useEffect(() => {
    const checkApiKeyConfigured = async () => {
      try {
        const response = await fetch("/api/gemini/check-key", {
          method: "GET",
        })

        const data = await response.json()
        if (data.configured) {
          setIsApiConfigured(true)
        }
      } catch (error) {
        console.error("Error checking API key:", error)
      } finally {
        setIsCheckingApiKey(false)
      }
    }

    checkApiKeyConfigured()
  }, [])

  // Update the handleSendMessage function to use Gemini
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!input.trim() || isLoading || !user) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Use Gemini to generate a response
      const response = await queryGemini({
        prompt: userMessage.content,
        userId: user.id,
      })

      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: response.text,
        isUser: false,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Chat with Ginee</h2>
        <p className="text-muted-foreground">Ask me anything about your learning journey and career goals</p>
      </div>

      {isCheckingApiKey ? (
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Checking API configuration...</p>
          </div>
        </div>
      ) : !isApiConfigured ? (
        <div className="max-w-md mx-auto w-full">
          <ApiKeySetup onConfigured={() => setIsApiConfigured(true)} />
        </div>
      ) : (
        <Card className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex items-start gap-3 ${message.isUser ? "justify-end" : ""}`}>
                {!message.isUser && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">G</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.isUser ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <div className="whitespace-pre-line">{message.content}</div>
                  <div className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                {message.isUser && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user?.user_metadata?.name
                        ? getInitials(user.user_metadata.name)
                        : user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">G</AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-4 py-2 bg-muted">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Ginee is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      )}
    </div>
  )
}
