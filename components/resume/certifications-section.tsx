"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Award, Plus, Pencil, Trash2, Calendar } from "lucide-react"
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

interface Certification {
  id: string
  name: string
  issuer: string
  issue_date?: string
  expiry_date?: string
  credential_id?: string
}

interface CertificationsSectionProps {
  certifications: Certification[]
  onUpdate: () => void
}

export function CertificationsSection({ certifications, onUpdate }: CertificationsSectionProps) {
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Certification>>({})
  const { supabase } = useAuth()
  const { toast } = useToast()

  const handleEdit = (cert: Certification) => {
    setFormData(cert)
    setIsEditing(cert.id)
  }

  const handleAdd = () => {
    setFormData({
      name: "",
      issuer: "",
      issue_date: "",
      expiry_date: "",
      credential_id: "",
    })
    setIsAdding(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("user_certifications").delete().eq("id", id)
      if (error) throw error

      toast({
        title: "Certification deleted",
        description: "Certification has been removed successfully",
      })
      setIsDeleting(null)
      onUpdate()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete certification",
        variant: "destructive",
      })
    }
  }

  const handleSave = async () => {
    try {
      const { user } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      if (isAdding) {
        const { error } = await supabase.from("user_certifications").insert({
          user_id: user.id,
          name: formData.name,
          issuer: formData.issuer,
          issue_date: formData.issue_date || null,
          expiry_date: formData.expiry_date || null,
          credential_id: formData.credential_id || "",
        })
        if (error) throw error

        toast({
          title: "Certification added",
          description: "New certification has been added successfully",
        })
        setIsAdding(false)
      } else if (isEditing) {
        const { error } = await supabase
          .from("user_certifications")
          .update({
            name: formData.name,
            issuer: formData.issuer,
            issue_date: formData.issue_date || null,
            expiry_date: formData.expiry_date || null,
            credential_id: formData.credential_id || "",
          })
          .eq("id", isEditing)
        if (error) throw error

        toast({
          title: "Certification updated",
          description: "Certification has been updated successfully",
        })
        setIsEditing(null)
      }

      onUpdate()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save certification",
        variant: "destructive",
      })
    }
  }

  if (!certifications || certifications.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-6">
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No certifications available</p>
            <p className="text-sm text-muted-foreground mt-2 mb-4">
              Upload your resume to automatically extract your certifications or add them manually
            </p>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Certification
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Certifications</h3>
        <Button onClick={handleAdd} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      {certifications.map((cert) => (
        <Card key={cert.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{cert.name}</CardTitle>
                <CardDescription>{cert.issuer}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(cert)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Dialog open={isDeleting === cert.id} onOpenChange={(open) => !open && setIsDeleting(null)}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => setIsDeleting(cert.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Certification</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this certification? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDeleting(null)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={() => handleDelete(cert.id)}>
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
              <div className="flex flex-wrap gap-4 text-sm">
                {(cert.issue_date || cert.expiry_date) && (
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>
                      {cert.issue_date ? `Issued: ${formatDate(cert.issue_date)}` : ""}{" "}
                      {cert.expiry_date ? `Expires: ${formatDate(cert.expiry_date)}` : ""}
                    </span>
                  </div>
                )}
                {cert.credential_id && (
                  <div className="flex items-center text-muted-foreground">
                    <span>Credential ID: {cert.credential_id}</span>
                  </div>
                )}
              </div>
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
            <DialogTitle>{isAdding ? "Add Certification" : "Edit Certification"}</DialogTitle>
            <DialogDescription>
              {isAdding ? "Add a new certification to your profile" : "Update the details of your certification"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Certification Name</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. AWS Certified Solutions Architect"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="issuer">Issuing Organization</Label>
              <Input
                id="issuer"
                value={formData.issuer || ""}
                onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                placeholder="e.g. Amazon Web Services"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="issue_date">Issue Date</Label>
                <Input
                  id="issue_date"
                  type="date"
                  value={formData.issue_date ? formData.issue_date.substring(0, 10) : ""}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={formData.expiry_date ? formData.expiry_date.substring(0, 10) : ""}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="credential_id">Credential ID</Label>
              <Input
                id="credential_id"
                value={formData.credential_id || ""}
                onChange={(e) => setFormData({ ...formData, credential_id: e.target.value })}
                placeholder="e.g. ABC123XYZ"
              />
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
