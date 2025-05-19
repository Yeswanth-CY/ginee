"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { School, Plus, Pencil, Trash2, Calendar, Award, MapPin } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { Badge } from "@/components/ui/badge"

interface Education {
  id: string
  institution: string
  degree: string
  field_of_study?: string
  start_date: string
  end_date?: string
  gpa?: string
  location?: string
  achievements?: string[]
}

interface EducationSectionProps {
  education: Education[]
  onUpdate: () => void
}

export function EducationSection({ education, onUpdate }: EducationSectionProps) {
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Education>>({})
  const [achievement, setAchievement] = useState("")
  const { supabase } = useAuth()
  const { toast } = useToast()

  const handleEdit = (edu: Education) => {
    setFormData(edu)
    setIsEditing(edu.id)
  }

  const handleAdd = () => {
    setFormData({
      institution: "",
      degree: "",
      field_of_study: "",
      start_date: "",
      end_date: "",
      gpa: "",
      location: "",
      achievements: [],
    })
    setIsAdding(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("user_education").delete().eq("id", id)
      if (error) throw error

      toast({
        title: "Education deleted",
        description: "Education entry has been removed successfully",
      })
      setIsDeleting(null)
      onUpdate()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete education",
        variant: "destructive",
      })
    }
  }

  const handleSave = async () => {
    try {
      const { user } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      if (isAdding) {
        const { error } = await supabase.from("user_education").insert({
          user_id: user.id,
          institution: formData.institution,
          degree: formData.degree,
          field_of_study: formData.field_of_study || "",
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          gpa: formData.gpa || "",
          location: formData.location || "",
          achievements: formData.achievements || [],
        })
        if (error) throw error

        toast({
          title: "Education added",
          description: "New education entry has been added successfully",
        })
        setIsAdding(false)
      } else if (isEditing) {
        const { error } = await supabase
          .from("user_education")
          .update({
            institution: formData.institution,
            degree: formData.degree,
            field_of_study: formData.field_of_study || "",
            start_date: formData.start_date,
            end_date: formData.end_date || null,
            gpa: formData.gpa || "",
            location: formData.location || "",
            achievements: formData.achievements || [],
          })
          .eq("id", isEditing)
        if (error) throw error

        toast({
          title: "Education updated",
          description: "Education entry has been updated successfully",
        })
        setIsEditing(null)
      }

      onUpdate()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save education",
        variant: "destructive",
      })
    }
  }

  const addAchievement = () => {
    if (!achievement.trim()) return
    setFormData({
      ...formData,
      achievements: [...(formData.achievements || []), achievement],
    })
    setAchievement("")
  }

  const removeAchievement = (index: number) => {
    const newAchievements = [...(formData.achievements || [])]
    newAchievements.splice(index, 1)
    setFormData({
      ...formData,
      achievements: newAchievements,
    })
  }

  if (!education || education.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-6">
            <School className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No education information available</p>
            <p className="text-sm text-muted-foreground mt-2 mb-4">
              Upload your resume to automatically extract your education history or add it manually
            </p>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Education
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Education History</h3>
        <Button onClick={handleAdd} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      {education.map((edu) => (
        <Card key={edu.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{edu.institution}</CardTitle>
                <CardDescription>{edu.degree}</CardDescription>
                {edu.field_of_study && <p className="text-sm text-muted-foreground">{edu.field_of_study}</p>}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(edu)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Dialog open={isDeleting === edu.id} onOpenChange={(open) => !open && setIsDeleting(null)}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => setIsDeleting(edu.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Education</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this education entry? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDeleting(null)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={() => handleDelete(edu.id)}>
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
                    {formatDate(edu.start_date)} - {edu.end_date ? formatDate(edu.end_date) : "Present"}
                  </span>
                </div>
                {edu.gpa && (
                  <div className="flex items-center text-muted-foreground">
                    <Award className="h-4 w-4 mr-1" />
                    <span>GPA: {edu.gpa}</span>
                  </div>
                )}
                {edu.location && (
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{edu.location}</span>
                  </div>
                )}
              </div>
              {edu.achievements && edu.achievements.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-1">Achievements:</p>
                  <div className="flex flex-wrap gap-2">
                    {edu.achievements.map((achievement, index) => (
                      <Badge key={index} variant="secondary">
                        {achievement}
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
            <DialogTitle>{isAdding ? "Add Education" : "Edit Education"}</DialogTitle>
            <DialogDescription>
              {isAdding ? "Add a new education entry to your profile" : "Update the details of your education entry"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="institution">Institution</Label>
              <Input
                id="institution"
                value={formData.institution || ""}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                placeholder="e.g. Stanford University"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="degree">Degree</Label>
              <Input
                id="degree"
                value={formData.degree || ""}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                placeholder="e.g. Bachelor of Science"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="field">Field of Study</Label>
              <Input
                id="field"
                value={formData.field_of_study || ""}
                onChange={(e) => setFormData({ ...formData, field_of_study: e.target.value })}
                placeholder="e.g. Computer Science"
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
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="gpa">GPA</Label>
                <Input
                  id="gpa"
                  value={formData.gpa || ""}
                  onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                  placeholder="e.g. 3.8"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location || ""}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Stanford, CA"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="achievements">Achievements</Label>
              <div className="flex gap-2">
                <Input
                  id="achievements"
                  value={achievement}
                  onChange={(e) => setAchievement(e.target.value)}
                  placeholder="Add an achievement"
                />
                <Button type="button" onClick={addAchievement} variant="outline">
                  Add
                </Button>
              </div>
              {formData.achievements && formData.achievements.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.achievements.map((achievement, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {achievement}
                      <button
                        onClick={() => removeAchievement(index)}
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
