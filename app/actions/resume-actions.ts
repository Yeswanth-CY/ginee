"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Define types for resume data
export type ResumeData = {
  contactInfo: {
    name: string
    email: string
    phone: string
    location: string
    linkedin?: string
    website?: string
  }
  summary?: string
  education: {
    institution: string
    degree: string
    fieldOfStudy?: string
    startDate: string
    endDate?: string
    gpa?: string
    location?: string
    achievements?: string[]
  }[]
  experience: {
    company: string
    position: string
    startDate: string
    endDate?: string
    location?: string
    description: string[]
    technologies?: string[]
  }[]
  skills: {
    name: string
    category: string
    proficiencyLevel?: number
  }[]
  certifications: {
    name: string
    issuer: string
    issueDate?: string
    expiryDate?: string
    credentialId?: string
  }[]
  projects: {
    name: string
    description: string
    role?: string
    startDate?: string
    endDate?: string
    url?: string
    technologies?: string[]
  }[]
  languages?: {
    name: string
    proficiency: string
  }[]
}

export async function parseResume({
  userId,
  fileName,
  fileContent,
  fileType,
}: {
  userId: string
  fileName: string
  fileContent: string
  fileType: string
}) {
  try {
    const supabase = createServerSupabaseClient()

    // Check if a resume with the same file name already exists for this user
    const { data: existingResume } = await supabase
      .from("user_resumes")
      .select("id")
      .eq("user_id", userId)
      .eq("file_name", fileName)
      .single()

    // If a resume with the same name exists, delete it first
    if (existingResume) {
      const { error: deleteError } = await supabase.from("user_resumes").delete().eq("id", existingResume.id)

      if (deleteError) {
        console.error("Error deleting existing resume:", deleteError)
      }
    }

    // Generate a unique file name by adding a timestamp
    const uniqueFileName = `${fileName.split(".").slice(0, -1).join(".")}_${Date.now()}.${fileName.split(".").pop()}`

    // Store the resume file reference with the unique file name
    const { error: resumeError } = await supabase.from("user_resumes").insert({
      user_id: userId,
      file_name: uniqueFileName,
      file_type: fileType,
      uploaded_at: new Date().toISOString(),
      status: "processing",
    })

    if (resumeError) throw resumeError

    // Extract the text content from the base64 string
    // For PDF, we'd use a PDF parsing library
    // For DOCX, we'd use a DOCX parsing library
    // For this example, we'll assume we have the text content

    // In a real implementation, we would extract text from the file
    // For now, we'll simulate having the text content
    const textContent = extractTextFromFile(fileContent, fileType)

    // Use mock implementation to parse the resume text
    const resumeData = parseResumeWithMock(textContent)

    // Update resume status to processed
    await supabase
      .from("user_resumes")
      .update({
        status: "processed",
        parsed_data: resumeData, // Store the full parsed data as JSON
      })
      .eq("user_id", userId)
      .eq("file_name", uniqueFileName)

    // Store contact information in user profile
    // Only update fields that we know exist in the users table
    if (resumeData.contactInfo) {
      try {
        // First, get the current user data to see what fields exist
        const { data: userData, error: fetchError } = await supabase.from("users").select("*").eq("id", userId).single()

        if (fetchError) {
          console.error("Error fetching user data:", fetchError)
        } else {
          // Create an update object with only the fields that exist in the table
          const updateData: Record<string, any> = {}

          if ("name" in userData) updateData.name = resumeData.contactInfo.name

          // Check if location exists in the users table
          if ("location" in userData) updateData.location = resumeData.contactInfo.location

          // Check if phone exists in the users table
          if ("phone" in userData) updateData.phone = resumeData.contactInfo.phone

          // Check if linkedin exists in the users table
          if ("linkedin" in userData) updateData.linkedin = resumeData.contactInfo.linkedin || ""

          // Check if website exists in the users table
          if ("website" in userData) updateData.website = resumeData.contactInfo.website || ""

          // Only update if we have fields to update
          if (Object.keys(updateData).length > 0) {
            const { error: userError } = await supabase.from("users").update(updateData).eq("id", userId)

            if (userError) console.error("Error updating user profile:", userError)
          }
        }
      } catch (error) {
        console.error("Error updating user profile:", error)
      }
    }

    // Store education information
    for (const edu of resumeData.education) {
      const { error: eduError } = await supabase.from("user_education").upsert({
        user_id: userId,
        institution: edu.institution,
        degree: edu.degree,
        field_of_study: edu.fieldOfStudy || "",
        start_date: edu.startDate,
        end_date: edu.endDate || null,
        gpa: edu.gpa || "",
        location: edu.location || "",
        achievements: edu.achievements || [],
      })

      if (eduError) console.error("Error storing education:", eduError)
    }

    // Store work experience
    for (const exp of resumeData.experience) {
      const { error: expError } = await supabase.from("user_experience").upsert({
        user_id: userId,
        company: exp.company,
        position: exp.position,
        start_date: exp.startDate,
        end_date: exp.endDate || null,
        location: exp.location || "",
        description: exp.description,
        technologies: exp.technologies || [],
      })

      if (expError) console.error("Error storing experience:", expError)
    }

    // Store certifications
    for (const cert of resumeData.certifications) {
      const { error: certError } = await supabase.from("user_certifications").upsert({
        user_id: userId,
        name: cert.name,
        issuer: cert.issuer,
        issue_date: cert.issueDate || null,
        expiry_date: cert.expiryDate || null,
        credential_id: cert.credentialId || "",
      })

      if (certError) console.error("Error storing certification:", certError)
    }

    // Store projects
    for (const project of resumeData.projects) {
      const { error: projError } = await supabase.from("user_projects").upsert({
        user_id: userId,
        name: project.name,
        description: project.description,
        role: project.role || "",
        start_date: project.startDate || null,
        end_date: project.endDate || null,
        url: project.url || "",
        technologies: project.technologies || [],
      })

      if (projError) console.error("Error storing project:", projError)
    }

    // Store skills
    for (const skill of resumeData.skills) {
      // Check if skill exists
      const { data: existingSkill, error: skillCheckError } = await supabase
        .from("skills")
        .select("id")
        .eq("name", skill.name)
        .eq("category", skill.category)
        .single()

      if (skillCheckError && skillCheckError.code !== "PGRST116") {
        console.error("Error checking skill:", skillCheckError)
        continue
      }

      let skillId

      if (!existingSkill) {
        // Create the skill
        const { data: newSkill, error: skillCreateError } = await supabase
          .from("skills")
          .insert({
            name: skill.name,
            category: skill.category,
          })
          .select("id")
          .single()

        if (skillCreateError) {
          console.error("Error creating skill:", skillCreateError)
          continue
        }
        skillId = newSkill.id
      } else {
        skillId = existingSkill.id
      }

      // Now add or update the user_skill
      const { error: userSkillError } = await supabase.from("user_skills").upsert({
        user_id: userId,
        skill_id: skillId,
        proficiency_level: skill.proficiencyLevel || 3, // Default to medium proficiency if not specified
      })

      if (userSkillError) console.error("Error storing user skill:", userSkillError)
    }

    // Store languages
    if (resumeData.languages && resumeData.languages.length > 0) {
      for (const lang of resumeData.languages) {
        const { error: langError } = await supabase.from("user_languages").upsert({
          user_id: userId,
          name: lang.name,
          proficiency: lang.proficiency,
        })

        if (langError) console.error("Error storing language:", langError)
      }
    }

    // Calculate resume score based on completeness and quality
    const resumeScore = calculateResumeScore(resumeData)

    // Update user metrics
    const { error: metricsError } = await supabase.from("user_metrics").upsert({
      user_id: userId,
      resume_score: resumeScore,
      last_updated: new Date().toISOString(),
    })

    if (metricsError) console.error("Error updating metrics:", metricsError)

    // Revalidate the profile and dashboard pages
    revalidatePath("/dashboard/resume")
    revalidatePath("/dashboard/profile")
    revalidatePath("/dashboard")

    return { success: true, data: resumeData }
  } catch (error: any) {
    console.error("Error parsing resume:", error)
    return { error: error.message || "Failed to parse resume" }
  }
}

// Function to extract text from different file types
function extractTextFromFile(fileContent: string, fileType: string): string {
  // In a real implementation, we would use libraries like pdf.js for PDF files
  // and mammoth.js for DOCX files to extract text

  // For this example, we'll return a mock resume text
  return `
John Doe
Software Engineer
john.doe@example.com | (123) 456-7890 | San Francisco, CA | linkedin.com/in/johndoe

SUMMARY
Experienced software engineer with 5+ years of experience in full-stack development, specializing in React, Node.js, and cloud technologies. Passionate about building scalable applications and solving complex problems.

EDUCATION
Stanford University
Master of Science in Computer Science
2018 - 2020 | GPA: 3.8
Courses: Advanced Algorithms, Machine Learning, Distributed Systems

University of California, Berkeley
Bachelor of Science in Computer Science
2014 - 2018 | GPA: 3.9
Courses: Data Structures, Algorithms, Operating Systems

EXPERIENCE
Google
Senior Software Engineer
June 2020 - Present | Mountain View, CA
- Led a team of 5 engineers to develop a new feature that increased user engagement by 25%
- Optimized database queries resulting in a 40% reduction in response time
- Implemented CI/CD pipeline using GitHub Actions, reducing deployment time by 60%
- Technologies: React, TypeScript, Node.js, GraphQL, AWS

Facebook
Software Engineer
July 2018 - May 2020 | Menlo Park, CA
- Developed responsive UI components using React and Redux
- Collaborated with UX designers to implement new features
- Fixed critical bugs in the news feed algorithm
- Technologies: React, JavaScript, PHP, MySQL

PROJECTS
AI-Powered Health Monitoring System
Team Lead
- Developed a real-time health monitoring system using machine learning algorithms
- Implemented data visualization dashboard using React and D3.js
- Deployed the application on AWS using Kubernetes
- Technologies: Python, TensorFlow, React, AWS

Global Hackathon 2022
Backend Developer
- Won 2nd place for developing a sustainable energy tracking application
- Built RESTful API using Node.js and Express
- Implemented real-time data processing using Kafka
- Technologies: Node.js, Express, MongoDB, Kafka

SKILLS
Programming Languages: JavaScript, TypeScript, Python, Java, SQL
Frameworks & Libraries: React, Node.js, Express, Django, TensorFlow
Tools & Platforms: Git, Docker, Kubernetes, AWS, GCP, CI/CD
Databases: MongoDB, PostgreSQL, MySQL, Redis

CERTIFICATIONS
AWS Certified Solutions Architect
Amazon Web Services
March 2023 - March 2026

Google Professional Data Engineer
Google Cloud
November 2022 - November 2025

LANGUAGES
English (Native), Spanish (Fluent), French (Intermediate)
  `
}

// Function to parse resume text using a mock implementation
function parseResumeWithMock(resumeText: string): ResumeData {
  // In a real implementation, we would use AI to parse the resume
  // For this demo, we'll return mock data
  return {
    contactInfo: {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "(123) 456-7890",
      location: "San Francisco, CA",
      linkedin: "linkedin.com/in/johndoe",
    },
    summary:
      "Experienced software engineer with 5+ years of experience in full-stack development, specializing in React, Node.js, and cloud technologies.",
    education: [
      {
        institution: "Stanford University",
        degree: "Master of Science in Computer Science",
        startDate: "2018-01-01",
        endDate: "2020-05-30",
        gpa: "3.8",
        fieldOfStudy: "Computer Science",
        achievements: ["Dean's List", "Research Assistant"],
      },
      {
        institution: "University of California, Berkeley",
        degree: "Bachelor of Science in Computer Science",
        startDate: "2014-09-01",
        endDate: "2018-05-30",
        gpa: "3.9",
        fieldOfStudy: "Computer Science",
      },
    ],
    experience: [
      {
        company: "Google",
        position: "Senior Software Engineer",
        startDate: "2020-06-01",
        location: "Mountain View, CA",
        description: [
          "Led a team of 5 engineers to develop a new feature that increased user engagement by 25%",
          "Optimized database queries resulting in a 40% reduction in response time",
          "Implemented CI/CD pipeline using GitHub Actions, reducing deployment time by 60%",
        ],
        technologies: ["React", "TypeScript", "Node.js", "GraphQL", "AWS"],
      },
      {
        company: "Facebook",
        position: "Software Engineer",
        startDate: "2018-07-01",
        endDate: "2020-05-31",
        location: "Menlo Park, CA",
        description: [
          "Developed responsive UI components using React and Redux",
          "Collaborated with UX designers to implement new features",
          "Fixed critical bugs in the news feed algorithm",
        ],
        technologies: ["React", "JavaScript", "PHP", "MySQL"],
      },
    ],
    skills: [
      { name: "JavaScript", category: "Programming Languages", proficiencyLevel: 5 },
      { name: "TypeScript", category: "Programming Languages", proficiencyLevel: 5 },
      { name: "Python", category: "Programming Languages", proficiencyLevel: 4 },
      { name: "React", category: "Frameworks & Libraries", proficiencyLevel: 5 },
      { name: "Node.js", category: "Frameworks & Libraries", proficiencyLevel: 5 },
      { name: "AWS", category: "Tools & Platforms", proficiencyLevel: 4 },
      { name: "MongoDB", category: "Databases", proficiencyLevel: 4 },
    ],
    certifications: [
      {
        name: "AWS Certified Solutions Architect",
        issuer: "Amazon Web Services",
        issueDate: "2023-03-01",
        expiryDate: "2026-03-01",
      },
      {
        name: "Google Professional Data Engineer",
        issuer: "Google Cloud",
        issueDate: "2022-11-01",
        expiryDate: "2025-11-01",
      },
    ],
    projects: [
      {
        name: "AI-Powered Health Monitoring System",
        description: "Developed a real-time health monitoring system using machine learning algorithms",
        role: "Team Lead",
        technologies: ["Python", "TensorFlow", "React", "AWS"],
      },
      {
        name: "Global Hackathon 2022",
        description: "Won 2nd place for developing a sustainable energy tracking application",
        role: "Backend Developer",
        technologies: ["Node.js", "Express", "MongoDB", "Kafka"],
      },
    ],
    languages: [
      { name: "English", proficiency: "Native" },
      { name: "Spanish", proficiency: "Fluent" },
      { name: "French", proficiency: "Intermediate" },
    ],
  }
}

// Function to calculate resume score based on completeness and quality
function calculateResumeScore(resumeData: ResumeData): number {
  let score = 0
  const maxScore = 100

  // Contact info (max 10 points)
  if (resumeData.contactInfo) {
    if (resumeData.contactInfo.name) score += 2
    if (resumeData.contactInfo.email) score += 2
    if (resumeData.contactInfo.phone) score += 2
    if (resumeData.contactInfo.location) score += 2
    if (resumeData.contactInfo.linkedin) score += 2
  }

  // Summary (max 5 points)
  if (resumeData.summary && resumeData.summary.length > 50) score += 5

  // Education (max 15 points)
  if (resumeData.education && resumeData.education.length > 0) {
    score += Math.min(resumeData.education.length * 5, 15)
  }

  // Experience (max 30 points)
  if (resumeData.experience && resumeData.experience.length > 0) {
    const expPoints = resumeData.experience.reduce((total, exp) => {
      let points = 3 // Base points for each experience

      // Add points for detailed descriptions
      if (exp.description && exp.description.length >= 3) points += 2

      // Add points for technologies used
      if (exp.technologies && exp.technologies.length > 0) points += 1

      return total + points
    }, 0)

    score += Math.min(expPoints, 30)
  }

  // Skills (max 15 points)
  if (resumeData.skills && resumeData.skills.length > 0) {
    score += Math.min(resumeData.skills.length, 15)
  }

  // Certifications (max 10 points)
  if (resumeData.certifications && resumeData.certifications.length > 0) {
    score += Math.min(resumeData.certifications.length * 5, 10)
  }

  // Projects (max 10 points)
  if (resumeData.projects && resumeData.projects.length > 0) {
    score += Math.min(resumeData.projects.length * 5, 10)
  }

  // Languages (max 5 points)
  if (resumeData.languages && resumeData.languages.length > 0) {
    score += Math.min(resumeData.languages.length * 2, 5)
  }

  return score
}
