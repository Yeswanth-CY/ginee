"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Globe, Plus, Pencil, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface Language {
  id: string
  name: string
  proficiency: string
}

interface LanguagesSectionProps {
  languages: Language[]
  onUpdate: () => void
}

export function LanguagesSection({ languages, onUpdate }: LanguagesSectionProps) {
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Language>>({})
  const { supabase } = useAuth()
  const { toast } = useToast()

  const proficiencyLevels = ["Native", "Fluent", "Advanced", "Intermediate", "Basic"]

  const handleEdit = (language: Language) => {
    setFormData(language)
    setIsEditing(language.id)
  }

  const handleAdd = () => {
    setFormData({
      name: "",
      proficiency: "",
    })
    setIsAdding(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("user_languages").delete().eq("id", id)
      if (error) throw error

      toast({
        title: "Language deleted",
        description: "Language has been removed successfully",
      })
      setIsDeleting(null)
      onUpdate()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete language",
        variant: "destructive",
      })
    }
  }

  const handleSave = async () => {
    try {
      const { user } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      if (isAdding) {
        const { error } = await supabase.from("user_languages").insert({
          user_id: user.id,
          name: formData.name,
          proficiency: formData.proficiency,
        })
        if (error) throw error

        toast({
          title: "Language added",
          description: "New language has been added successfully",
        })
        setIsAdding(false)
      } else if (isEditing) {
        const { error } = await supabase
          .from("user_languages")
          .update({
            name: formData.name,
            proficiency: formData.proficiency,
          })
          .eq("id", isEditing)
        if (error) throw error

        toast({
          title: "Language updated",
          description: "Language has been updated successfully",
        })
        setIsEditing(null)
      }

      onUpdate()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save language",
        variant: "destructive",
      })
    }
  }

  const getProficiencyColor = (proficiency: string) => {
    switch (proficiency) {
      case "Native":
        return "bg-green-500"
      case "Fluent":
        return "bg-green-400"
      case "Advanced":
        return "bg-blue-500"
      case "Intermediate":
        return "bg-yellow-500"
      case "Basic":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  if (!languages || languages.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-6">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No languages available</p>
            <p className="text-sm text-muted-foreground mt-2 mb-4">
              Upload your resume to automatically extract your languages or add them manually
            </p>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Language
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Languages</h3>
        <Button onClick={handleAdd} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Language Proficiency</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {languages.map((language) => (
              <div key={language.id} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${getProficiencyColor(language.proficiency)}`} />
                  <span className="font-medium">{language.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline">{language.proficiency}</Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(language)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsDeleting(language.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit/Add Dialog */}
      <Dialog
        open={isEditing !== null || isAdding}
        onOpenChange={(open) => {
          if (!open) {
            setIsEditing(null)
            setIsAdding(false)
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isAdding ? "Add Language" : "Edit Language"}</DialogTitle>
            <DialogDescription>
              {isAdding ? "Add a new language to your profile" : "Update your language proficiency"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Language</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. English"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="proficiency">Proficiency</Label>
              <Select
                value={formData.proficiency || ""}
                onValueChange={(value) => setFormData({ ...formData, proficiency: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select proficiency level" />
                </SelectTrigger>
                <SelectContent>
                  {proficiencyLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => (isAdding ? setIsAdding(false) : setIsEditing(null))}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleting !== null} onOpenChange={(open) => !open && setIsDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Language</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this language? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleting(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => isDeleting && handleDelete(isDeleting)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
