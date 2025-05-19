"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Code, Plus, Pencil, Trash2, Calendar, ExternalLink } from "lucide-react"
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

interface Project {
  id: string
  name: string
  description: string
  role?: string
  start_date?: string
  end_date?: string
  url?: string
  technologies?: string[]
}

interface ProjectsSectionProps {
  projects: Project[]
  onUpdate: () => void
}

export function ProjectsSection({ projects, onUpdate }: ProjectsSectionProps) {
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Project>>({})
  const [technology, setTechnology] = useState("")
  const { supabase } = useAuth()
  const { toast } = useToast()

  const handleEdit = (project: Project) => {
    setFormData(project)
    setIsEditing(project.id)
  }

  const handleAdd = () => {
    setFormData({
      name: "",
      description: "",
      role: "",
      start_date: "",
      end_date: "",
      url: "",
      technologies: [],
    })
    setIsAdding(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("user_projects").delete().eq("id", id)
      if (error) throw error

      toast({
        title: "Project deleted",
        description: "Project has been removed successfully",
      })
      setIsDeleting(null)
      onUpdate()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete project",
        variant: "destructive",
      })
    }
  }

  const handleSave = async () => {
    try {
      const { user } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      if (isAdding) {
        const { error } = await supabase.from("user_projects").insert({
          user_id: user.id,
          name: formData.name,
          description: formData.description,
          role: formData.role || "",
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          url: formData.url || "",
          technologies: formData.technologies || [],
        })
        if (error) throw error

        toast({
          title: "Project added",
          description: "New project has been added successfully",
        })
        setIsAdding(false)
      } else if (isEditing) {
        const { error } = await supabase
          .from("user_projects")
          .update({
            name: formData.name,
            description: formData.description,
            role: formData.role || "",
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
            url: formData.url || "",
            technologies: formData.technologies || [],
          })
          .eq("id", isEditing)
        if (error) throw error

        toast({
          title: "Project updated",
          description: "Project has been updated successfully",
        })
        setIsEditing(null)
      }

      onUpdate()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save project",
        variant: "destructive",
      })
    }
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

  if (!projects || projects.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-6">
            <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No projects or hackathons available</p>
            <p className="text-sm text-muted-foreground mt-2 mb-4">
              Upload your resume to automatically extract your projects or add them manually
            </p>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Projects & Hackathons</h3>
        <Button onClick={handleAdd} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      {projects.map((project) => (
        <Card key={project.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{project.name}</CardTitle>
                {project.role && <CardDescription>{project.role}</CardDescription>}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(project)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Dialog open={isDeleting === project.id} onOpenChange={(open) => !open && setIsDeleting(null)}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => setIsDeleting(project.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Project</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this project? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDeleting(null)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={() => handleDelete(project.id)}>
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
              <p className="text-sm">{project.description}</p>
              {(project.start_date || project.end_date) && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>
                    {project.start_date ? formatDate(project.start_date) : ""}{" "}
                    {project.end_date ? `- ${formatDate(project.end_date)}` : ""}
                  </span>
                </div>
              )}
              {project.technologies && project.technologies.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-1">Technologies:</p>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, index) => (
                      <Badge key={index} variant="secondary">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          {project.url && (
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href={project.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Project
                </a>
              </Button>
            </CardFooter>
          )}
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
            <DialogTitle>{isAdding ? "Add Project" : "Edit Project"}</DialogTitle>
            <DialogDescription>
              {isAdding ? "Add a new project to your profile" : "Update the details of your project"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. AI-Powered Health Monitoring System"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Your Role</Label>
              <Input
                id="role"
                value={formData.role || ""}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. Team Lead"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your project"
                rows={3}
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
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="url">Project URL</Label>
              <Input
                id="url"
                value={formData.url || ""}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="e.g. https://github.com/username/project"
              />
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
