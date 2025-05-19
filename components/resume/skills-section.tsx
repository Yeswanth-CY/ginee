"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2 } from "lucide-react"
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
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

interface Skill {
  id: string
  name: string
  category: string
  proficiency_level: number
  skill_id: string
}

interface SkillsSectionProps {
  skills: Skill[]
  onUpdate: () => void
}

export function SkillsSection({ skills, onUpdate }: SkillsSectionProps) {
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Skill>>({})
  const { supabase } = useAuth()
  const { toast } = useToast()

  const skillCategories = [
    "Programming Languages",
    "Frameworks & Libraries",
    "Databases",
    "Cloud Platforms",
    "DevOps",
    "Design",
    "Soft Skills",
    "Other",
  ]

  const handleEdit = (skill: Skill) => {
    setFormData(skill)
    setIsEditing(skill.id)
  }

  const handleAdd = () => {
    setFormData({
      name: "",
      category: "",
      proficiency_level: 3,
    })
    setIsAdding(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("user_skills").delete().eq("id", id)
      if (error) throw error

      toast({
        title: "Skill deleted",
        description: "Skill has been removed successfully",
      })
      setIsDeleting(null)
      onUpdate()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete skill",
        variant: "destructive",
      })
    }
  }

  const handleSave = async () => {
    try {
      const { user } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      // Check if skill exists or create it
      let skillId = formData.skill_id

      if (!skillId) {
        // Check if skill already exists
        const { data: existingSkill, error: skillCheckError } = await supabase
          .from("skills")
          .select("id")
          .eq("name", formData.name)
          .eq("category", formData.category)
          .single()

        if (skillCheckError && skillCheckError.code !== "PGRST116") throw skillCheckError

        if (existingSkill) {
          skillId = existingSkill.id
        } else {
          // Create new skill
          const { data: newSkill, error: skillCreateError } = await supabase
            .from("skills")
            .insert({
              name: formData.name,
              category: formData.category,
            })
            .select("id")
            .single()

          if (skillCreateError) throw skillCreateError
          skillId = newSkill.id
        }
      }

      if (isAdding) {
        const { error } = await supabase.from("user_skills").insert({
          user_id: user.id,
          skill_id: skillId,
          proficiency_level: formData.proficiency_level || 3,
        })
        if (error) throw error

        toast({
          title: "Skill added",
          description: "New skill has been added successfully",
        })
        setIsAdding(false)
      } else if (isEditing) {
        const { error } = await supabase
          .from("user_skills")
          .update({
            skill_id: skillId,
            proficiency_level: formData.proficiency_level,
          })
          .eq("id", isEditing)
        if (error) throw error

        toast({
          title: "Skill updated",
          description: "Skill has been updated successfully",
        })
        setIsEditing(null)
      }

      onUpdate()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save skill",
        variant: "destructive",
      })
    }
  }

  // Group skills by category
  const groupedSkills = skills.reduce(
    (acc, skill) => {
      const category = skill.category || "Other"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(skill)
      return acc
    },
    {} as Record<string, Skill[]>,
  )

  if (!skills || skills.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-6">
            <p className="text-muted-foreground">No skills available</p>
            <p className="text-sm text-muted-foreground mt-2 mb-4">
              Upload your resume to automatically extract your skills or add them manually
            </p>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Skills</h3>
        <Button onClick={handleAdd} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      {Object.entries(groupedSkills).map(([category, categorySkills]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-base">{category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categorySkills.map((skill) => (
                <div key={skill.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{skill.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{skill.proficiency_level}/5</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(skill)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsDeleting(skill.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Progress value={skill.proficiency_level * 20} className="h-2" />
                </div>
              ))}
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
            <DialogTitle>{isAdding ? "Add Skill" : "Edit Skill"}</DialogTitle>
            <DialogDescription>
              {isAdding ? "Add a new skill to your profile" : "Update your skill proficiency"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {isAdding && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="name">Skill Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. JavaScript"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category || ""}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {skillCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            <div className="grid gap-2">
              <div className="flex justify-between">
                <Label htmlFor="proficiency">Proficiency Level</Label>
                <span className="text-sm text-muted-foreground">{formData.proficiency_level || 3}/5</span>
              </div>
              <Slider
                id="proficiency"
                min={1}
                max={5}
                step={1}
                value={[formData.proficiency_level || 3]}
                onValueChange={(value) => setFormData({ ...formData, proficiency_level: value[0] })}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Beginner</span>
                <span>Intermediate</span>
                <span>Expert</span>
              </div>
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
            <DialogTitle>Delete Skill</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this skill? This action cannot be undone.
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
