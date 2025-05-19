"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Briefcase, Plus, Pencil, Trash2, Calendar, MapPin } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { Badge } from "@/components/ui/badge"

interface Experience {
  id: string
  company: string
  position: string
  start_date: string
  end_date?: string
  location?: string
  description: string[]
  technologies?: string[]
}

interface ExperienceSectionProps {
  experience: Experience[]
  onUpdate: () => void
}

export function ExperienceSection({ experience, onUpdate }: ExperienceSectionProps) {
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Experience>>({})
  const [description, setDescription] = useState("")
  const [technology, setTechnology] = useState("")
  const { supabase } = useAuth()
  const { toast } = useToast()

  const handleEdit = (exp: Experience) => {
    setFormData(exp)
    setIsEditing(exp.id)
  }

  const handleAdd = () => {
    setFormData({
      company: "",
      position: "",
      start_date: "",
      end_date: "",
      location: "",
      description: [],
      technologies: [],
    })
    setIsAdding(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("user_experience").delete().eq("id", id)
      if (error) throw error

      toast({
        title: "Experience deleted",
        description: "Experience entry has been removed successfully",
      })
      setIsDeleting(null)
      onUpdate()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete experience",
        variant: "destructive",
      })
    }
  }

  const handleSave = async () => {
    try {
      const { user } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      if (isAdding) {
        const { error } = await supabase.from("user_experience").insert({
          user_id: user.id,
          company: formData.company,
          position: formData.position,
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          location: formData.location || "",
          description: formData.description || [],
          technologies: formData.technologies || [],
        })
        if (error) throw error

        toast({
          title: "Experience added",
          description: "New experience entry has been added successfully",
        })
        setIsAdding(false)
      } else if (isEditing) {
        const { error } = await supabase
          .from("user_experience")
          .update({
            company: formData.company,
            position: formData.position,
            start_date: formData.start_date,
            end_date: formData.end_date || null,
            location: formData.location || "",
            description: formData.description || [],
            technologies: formData.technologies || [],
          })
          .eq("id", isEditing)
        if (error) throw error

        toast({
          title: "Experience updated",
          description: "Experience entry has been updated successfully",
        })
        setIsEditing(null)
      }

      onUpdate()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save experience",
        variant: "destructive",
      })
    }
  }

  const addDescription = () => {
    if (!description.trim()) return
    setFormData({
      ...formData,
      description: [...(formData.description || []), description],
    })
    setDescription("")
  }

  const removeDescription = (index: number) => {
    const newDescriptions = [...(formData.description || [])]
    newDescriptions.splice(index, 1)
    setFormData({
      ...formData,
      description: newDescriptions,
    })
  }

  const addTechnology = () => {
    if (!technology.trim()) return
    setFormData({
      ...formData,
      technologies: [...(formData.technologies || []), technology],
    })
    setTechnology("")
  }

  const removeTechnology = (index: number) => {
    const newTechnologies = [...(formData.technologies || [])]
    newTechnologies.splice(index, 1)
    setFormData({
      ...formData,
      technologies: newTechnologies,
    })
  }

  if (!experience || experience.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-6">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No work experience available</p>
            <p className="text-sm text-muted-foreground mt-2 mb-4">
              Upload your resume to automatically extract your work experience or add it manually
            </p>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Experience
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Work Experience</h3>
        <Button onClick={handleAdd} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      {experience.map((exp) => (
        <Card key={exp.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{exp.position}</CardTitle>
                <CardDescription>{exp.company}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(exp)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Dialog open={isDeleting === exp.id} onOpenChange={(open) => !open && setIsDeleting(null)}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => setIsDeleting(exp.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Experience</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this experience entry? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDeleting(null)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={() => handleDelete(exp.id)}>
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>
                    {formatDate(exp.start_date)} - {exp.end_date ? formatDate(exp.end_date) : "Present"}
                  </span>
                </div>
                {exp.location && (
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{exp.location}</span>
                  </div>
                )}
              </div>
              {exp.description && exp.description.length > 0 && (
                <div className="mt-2">
                  <ul className="list-disc pl-5 space-y-1">
                    {exp.description.map((desc, index) => (
                      <li key={index} className="text-sm">
                        {desc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {exp.technologies && exp.technologies.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium mb-1">Technologies:</p>
                  <div className="flex flex-wrap gap-2">
                    {exp.technologies.map((tech, index) => (
                      <Badge key={index} variant="secondary">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

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
            <DialogTitle>{isAdding ? "Add Experience" : "Edit Experience"}</DialogTitle>
            <DialogDescription>
              {isAdding
                ? "Add a new work experience entry to your profile"
                : "Update the details of your work experience"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company || ""}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. Google"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={formData.position || ""}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="e.g. Senior Software Engineer"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date ? formData.start_date.substring(0, 10) : ""}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date ? formData.end_date.substring(0, 10) : ""}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  placeholder="Leave blank if current"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location || ""}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Mountain View, CA"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <div className="flex gap-2">
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a bullet point description"
                  rows={2}
                />
                <Button type="button" onClick={addDescription} variant="outline" className="self-start">
                  Add
                </Button>
              </div>
              {formData.description && formData.description.length > 0 && (
                <div className="space-y-2 mt-2">
                  {formData.description.map((desc, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <div className="flex-1 bg-muted p-2 rounded">{desc}</div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeDescription(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="technologies">Technologies</Label>
              <div className="flex gap-2">
                <Input
                  id="technologies"
                  value={technology}
                  onChange={(e) => setTechnology(e.target.value)}
                  placeholder="Add a technology"
                />
                <Button type="button" onClick={addTechnology} variant="outline">
                  Add
                </Button>
              </div>
              {formData.technologies && formData.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.technologies.map((tech, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tech}
                      <button
                        onClick={() => removeTechnology(index)}
                        className="ml-1 h-4 w-4 rounded-full bg-muted-foreground/20 flex items-center justify-center hover:bg-muted-foreground/40"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
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
    </div>
  )
}

function formatDate(dateString: string) {
  if (!dateString) return ""
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
}
