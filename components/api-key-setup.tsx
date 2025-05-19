"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { setGeminiApiKey } from "@/app/actions/env-actions"
import { Loader2, Key } from "lucide-react"

// Update the component props to include onConfigured
export function ApiKeySetup({ onConfigured }: { onConfigured?: () => void }) {
  const [apiKey, setApiKey] = useState("AIzaSyDpI0QJMWxLdaTDRqcTw8JTDNUbz-MH6dM")
  const [isLoading, setIsLoading] = useState(false)
  const [isConfigured, setIsConfigured] = useState(false)
  const { toast } = useToast()

  // Add a function to check if the API key is configured
  const checkApiKeyConfigured = async () => {
    try {
      const response = await fetch("/api/gemini/check-key", {
        method: "GET",
      })

      const data = await response.json()
      if (data.configured) {
        setIsConfigured(true)
      }
    } catch (error) {
      console.error("Error checking API key:", error)
    }
  }

  // Add useEffect to check on component mount
  useEffect(() => {
    checkApiKeyConfigured()
  }, [])

  const handleSetApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter a valid Gemini API key",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await setGeminiApiKey(apiKey)

      // Update the handleSetApiKey function to call onConfigured
      if (result.success) {
        setIsConfigured(true)
        toast({
          title: "API Key Configured",
          description: "Gemini API key has been successfully configured",
        })
        if (onConfigured) {
          onConfigured()
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to configure API key",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configure Gemini API</CardTitle>
        <CardDescription>Set up your Gemini API key to enable AI-powered analysis and recommendations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="apiKey">Gemini API Key</Label>
            <Input
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={isLoading || isConfigured}
              type="password"
            />
            <p className="text-xs text-muted-foreground">
              Your API key is stored securely and only used for Gemini API requests
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSetApiKey} disabled={isLoading || isConfigured} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Configuring...
            </>
          ) : isConfigured ? (
            <>
              <Key className="mr-2 h-4 w-4" />
              API Key Configured
            </>
          ) : (
            <>
              <Key className="mr-2 h-4 w-4" />
              Configure API Key
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
