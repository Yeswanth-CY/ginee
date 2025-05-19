"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileText, Loader2 } from "lucide-react"
import { parseResume } from "@/app/actions/resume-actions"
import { Progress } from "@/components/ui/progress"

export function ResumeUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [parsingStage, setParsingStage] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file || !user) return

    setIsUploading(true)
    setUploadProgress(0)
    setParsingStage("Uploading file")

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 5
        })
      }, 200)

      // Convert file to base64
      const base64String = await fileToBase64(file)

      // Update parsing stage
      setParsingStage("Extracting text")
      setUploadProgress(95)

      // Call the server action to parse the resume
      const result = await parseResume({
        userId: user.id,
        fileName: file.name,
        fileContent: base64String,
        fileType: file.type,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)
      setParsingStage("Completed")

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Resume parsed successfully",
        description: "Your profile has been updated with information from your resume.",
      })

      // Refresh the page to show updated data
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error: any) {
      console.error("Error uploading resume:", error)
      toast({
        title: "Upload failed",
        description: error.message || "There was a problem uploading your resume.",
        variant: "destructive",
      })
    } finally {
      setTimeout(() => {
        setIsUploading(false)
        setParsingStage(null)
      }, 1500)
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Resume</CardTitle>
        <CardDescription>
          Upload your resume to automatically extract your skills, education, experience, and more
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="resume">Resume</Label>
            <Input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <p className="text-xs text-muted-foreground">Supported formats: PDF, DOC, DOCX</p>
          </div>
          {file && (
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" />
              <span>{file.name}</span>
              <span className="text-xs text-muted-foreground">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
          )}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>{parsingStage}</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpload} disabled={!file || isUploading} className="w-full">
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {parsingStage}...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload & Parse Resume
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
