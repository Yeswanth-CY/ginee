import { createServerSupabaseClient } from "@/lib/supabase"

// Types for our analysis results
export interface SkillGap {
  skillName: string
  category: string
  importance: number // 1-5 scale
  currentLevel?: number
  recommendedLevel: number
}

export interface JobRecommendation {
  title: string
  matchScore: number // 0-100
  requiredSkills: string[]
  missingSkills: SkillGap[]
  averageSalary?: string
  growthOutlook?: string
  description: string
}

export interface CourseRecommendation {
  title: string
  provider: string
  skillsCovered: string[]
  difficulty: string
  duration: string
  url?: string
}

export interface CareerAnalysis {
  currentSkillLevel: {
    [key: string]: number // category -> average level
  }
  topSkills: {
    name: string
    level: number
  }[]
  skillGaps: SkillGap[]
  jobRecommendations: JobRecommendation[]
  courseRecommendations: CourseRecommendation[]
  resumeScore: number
  interviewReadiness: number
}

// Main function to analyze user data and provide career recommendations
export async function analyzeUserData(userId: string): Promise<CareerAnalysis | null> {
  try {
    const supabase = createServerSupabaseClient()

    // Fetch user skills
    const { data: skillsData, error: skillsError } = await supabase
      .from("user_skills")
      .select(`
        proficiency_level,
        skills (
          id,
          name,
          category
        )
      `)
      .eq("user_id", userId)

    if (skillsError) throw skillsError

    // Fetch education data
    const { data: educationData, error: educationError } = await supabase
      .from("user_education")
      .select("*")
      .eq("user_id", userId)

    if (educationError) throw educationError

    // Fetch experience data
    const { data: experienceData, error: experienceError } = await supabase
      .from("user_experience")
      .select("*")
      .eq("user_id", userId)

    if (experienceError) throw experienceError

    // Fetch resume data
    const { data: resumeData, error: resumeError } = await supabase
      .from("user_resumes")
      .select("*")
      .eq("user_id", userId)
      .order("uploaded_at", { ascending: false })
      .limit(1)

    if (resumeError) throw resumeError

    // Fetch user metrics
    const { data: metricsData, error: metricsError } = await supabase
      .from("user_metrics")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (metricsError && metricsError.code !== "PGRST116") throw metricsError

    // If we don't have skills data, we can't provide meaningful analysis
    if (!skillsData || skillsData.length === 0) {
      return null
    }

    // Process skills by category
    const skillsByCategory: { [key: string]: { total: number; count: number } } = {}
    const allSkills = skillsData.map((skill) => ({
      name: skill.skills.name,
      category: skill.skills.category,
      level: skill.proficiency_level,
    }))

    // Calculate average skill level by category
    allSkills.forEach((skill) => {
      if (!skillsByCategory[skill.category]) {
        skillsByCategory[skill.category] = { total: 0, count: 0 }
      }
      skillsByCategory[skill.category].total += skill.level
      skillsByCategory[skill.category].count++
    })

    const currentSkillLevel: { [key: string]: number } = {}
    Object.keys(skillsByCategory).forEach((category) => {
      currentSkillLevel[category] = skillsByCategory[category].total / skillsByCategory[category].count
    })

    // Identify top skills (highest proficiency)
    const topSkills = [...allSkills]
      .sort((a, b) => b.level - a.level)
      .slice(0, 5)
      .map((skill) => ({ name: skill.name, level: skill.level }))

    // Identify skill gaps based on job market demand
    // In a real implementation, this would use external data or AI
    // For now, we'll use a simplified approach
    const skillGaps: SkillGap[] = determineSkillGaps(allSkills)

    // Generate job recommendations based on skills
    const jobRecommendations = generateJobRecommendations(allSkills, skillGaps)

    // Generate course recommendations to address skill gaps
    const courseRecommendations = generateCourseRecommendations(skillGaps)

    // Calculate resume score and interview readiness
    const resumeScore =
      metricsData?.resume_score || calculateResumeScore(resumeData?.[0], educationData, experienceData)
    const interviewReadiness =
      metricsData?.interview_score || calculateInterviewReadiness(allSkills, educationData, experienceData)

    return {
      currentSkillLevel,
      topSkills,
      skillGaps,
      jobRecommendations,
      courseRecommendations,
      resumeScore,
      interviewReadiness,
    }
  } catch (error) {
    console.error("Error analyzing user data:", error)
    return null
  }
}

// Helper function to determine skill gaps
function determineSkillGaps(userSkills: { name: string; category: string; level: number }[]): SkillGap[] {
  // This is a simplified implementation
  // In a real-world scenario, this would use market data or AI analysis

  const inDemandSkills = [
    { name: "React", category: "Frameworks & Libraries", recommendedLevel: 4, importance: 5 },
    { name: "TypeScript", category: "Programming Languages", recommendedLevel: 4, importance: 5 },
    { name: "Node.js", category: "Frameworks & Libraries", recommendedLevel: 4, importance: 4 },
    { name: "AWS", category: "Cloud Platforms", recommendedLevel: 3, importance: 4 },
    { name: "Docker", category: "DevOps", recommendedLevel: 3, importance: 3 },
    { name: "GraphQL", category: "API", recommendedLevel: 3, importance: 3 },
    { name: "Next.js", category: "Frameworks & Libraries", recommendedLevel: 4, importance: 4 },
    { name: "SQL", category: "Databases", recommendedLevel: 3, importance: 4 },
    { name: "MongoDB", category: "Databases", recommendedLevel: 3, importance: 3 },
    { name: "Data Structures", category: "Computer Science", recommendedLevel: 4, importance: 5 },
    { name: "Algorithms", category: "Computer Science", recommendedLevel: 4, importance: 5 },
  ]

  const skillGaps: SkillGap[] = []

  // Check for skills the user is missing or needs to improve
  inDemandSkills.forEach((demandedSkill) => {
    const userSkill = userSkills.find((s) => s.name.toLowerCase() === demandedSkill.name.toLowerCase())

    if (!userSkill) {
      // User doesn't have this skill
      skillGaps.push({
        skillName: demandedSkill.name,
        category: demandedSkill.category,
        importance: demandedSkill.importance,
        recommendedLevel: demandedSkill.recommendedLevel,
      })
    } else if (userSkill.level < demandedSkill.recommendedLevel) {
      // User has the skill but needs improvement
      skillGaps.push({
        skillName: demandedSkill.name,
        category: demandedSkill.category,
        importance: demandedSkill.importance,
        currentLevel: userSkill.level,
        recommendedLevel: demandedSkill.recommendedLevel,
      })
    }
  })

  // Sort by importance
  return skillGaps.sort((a, b) => b.importance - a.importance)
}

// Helper function to generate job recommendations
function generateJobRecommendations(
  userSkills: { name: string; category: string; level: number }[],
  skillGaps: SkillGap[],
): JobRecommendation[] {
  // This is a simplified implementation
  // In a real-world scenario, this would use job market data or AI analysis

  const jobRoles = [
    {
      title: "Frontend Developer",
      requiredSkills: ["JavaScript", "React", "HTML", "CSS", "TypeScript"],
      description: "Build user interfaces and implement frontend functionality for web applications.",
      averageSalary: "$90,000 - $120,000",
      growthOutlook: "Strong",
    },
    {
      title: "Full Stack Developer",
      requiredSkills: ["JavaScript", "React", "Node.js", "SQL", "MongoDB", "Express"],
      description: "Develop both client and server-side applications, working with databases and APIs.",
      averageSalary: "$100,000 - $140,000",
      growthOutlook: "Very Strong",
    },
    {
      title: "Backend Developer",
      requiredSkills: ["Node.js", "Express", "SQL", "MongoDB", "API Design"],
      description: "Build server-side logic, databases, and APIs that power web applications.",
      averageSalary: "$95,000 - $130,000",
      growthOutlook: "Strong",
    },
    {
      title: "DevOps Engineer",
      requiredSkills: ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux"],
      description: "Implement and manage infrastructure, deployment pipelines, and operational processes.",
      averageSalary: "$110,000 - $150,000",
      growthOutlook: "Very Strong",
    },
    {
      title: "React Native Developer",
      requiredSkills: ["React", "JavaScript", "TypeScript", "Mobile Development"],
      description: "Build cross-platform mobile applications using React Native framework.",
      averageSalary: "$95,000 - $135,000",
      growthOutlook: "Strong",
    },
  ]

  const recommendations: JobRecommendation[] = []

  // Calculate match score for each job role
  jobRoles.forEach((job) => {
    let matchingSkills = 0
    const userSkillNames = userSkills.map((s) => s.name.toLowerCase())

    // Calculate how many required skills the user has
    job.requiredSkills.forEach((skill) => {
      if (userSkillNames.includes(skill.toLowerCase())) {
        matchingSkills++
      }
    })

    const matchScore = Math.round((matchingSkills / job.requiredSkills.length) * 100)

    // Determine missing skills for this role
    const missingSkills = job.requiredSkills
      .filter((skill) => !userSkillNames.includes(skill.toLowerCase()))
      .map((skill) => {
        const gap = skillGaps.find((g) => g.skillName.toLowerCase() === skill.toLowerCase())
        if (gap) return gap

        // If not found in skill gaps, create a new one
        return {
          skillName: skill,
          category: getCategoryForSkill(skill),
          importance: 4,
          recommendedLevel: 3,
        }
      })

    // Only recommend jobs with a reasonable match
    if (matchScore > 40) {
      recommendations.push({
        title: job.title,
        matchScore,
        requiredSkills: job.requiredSkills,
        missingSkills,
        averageSalary: job.averageSalary,
        growthOutlook: job.growthOutlook,
        description: job.description,
      })
    }
  })

  // Sort by match score (highest first)
  return recommendations.sort((a, b) => b.matchScore - a.matchScore)
}

// Helper function to get a category for a skill
function getCategoryForSkill(skillName: string): string {
  const categoryMap: { [key: string]: string } = {
    javascript: "Programming Languages",
    typescript: "Programming Languages",
    python: "Programming Languages",
    java: "Programming Languages",
    "c#": "Programming Languages",
    react: "Frameworks & Libraries",
    angular: "Frameworks & Libraries",
    vue: "Frameworks & Libraries",
    "node.js": "Frameworks & Libraries",
    express: "Frameworks & Libraries",
    "next.js": "Frameworks & Libraries",
    sql: "Databases",
    mongodb: "Databases",
    postgresql: "Databases",
    mysql: "Databases",
    aws: "Cloud Platforms",
    azure: "Cloud Platforms",
    gcp: "Cloud Platforms",
    docker: "DevOps",
    kubernetes: "DevOps",
    "ci/cd": "DevOps",
    git: "Tools",
    html: "Frontend",
    css: "Frontend",
    graphql: "API",
    rest: "API",
  }

  const key = skillName.toLowerCase()
  return categoryMap[key] || "Other"
}

// Helper function to generate course recommendations
function generateCourseRecommendations(skillGaps: SkillGap[]): CourseRecommendation[] {
  // This is a simplified implementation
  // In a real-world scenario, this would use course catalog data or AI recommendations

  const courseDatabase = [
    {
      title: "Modern React with Redux",
      provider: "Udemy",
      skillsCovered: ["React", "Redux", "JavaScript"],
      difficulty: "Intermediate",
      duration: "40 hours",
      url: "https://www.udemy.com/course/react-redux/",
    },
    {
      title: "Understanding TypeScript",
      provider: "Udemy",
      skillsCovered: ["TypeScript", "JavaScript"],
      difficulty: "Intermediate",
      duration: "15 hours",
      url: "https://www.udemy.com/course/understanding-typescript/",
    },
    {
      title: "The Complete Node.js Developer Course",
      provider: "Udemy",
      skillsCovered: ["Node.js", "Express", "MongoDB", "JavaScript"],
      difficulty: "Intermediate",
      duration: "35 hours",
      url: "https://www.udemy.com/course/the-complete-nodejs-developer-course-2/",
    },
    {
      title: "AWS Certified Solutions Architect",
      provider: "A Cloud Guru",
      skillsCovered: ["AWS", "Cloud Architecture"],
      difficulty: "Advanced",
      duration: "40 hours",
      url: "https://acloudguru.com/course/aws-certified-solutions-architect-associate-saa-c02",
    },
    {
      title: "Docker & Kubernetes: The Practical Guide",
      provider: "Udemy",
      skillsCovered: ["Docker", "Kubernetes", "DevOps"],
      difficulty: "Intermediate",
      duration: "22 hours",
      url: "https://www.udemy.com/course/docker-kubernetes-the-practical-guide/",
    },
    {
      title: "GraphQL with React: The Complete Developers Guide",
      provider: "Udemy",
      skillsCovered: ["GraphQL", "React", "Node.js"],
      difficulty: "Intermediate",
      duration: "15 hours",
      url: "https://www.udemy.com/course/graphql-with-react-course/",
    },
    {
      title: "The Complete Next.js Developer Course",
      provider: "Udemy",
      skillsCovered: ["Next.js", "React", "Node.js"],
      difficulty: "Intermediate",
      duration: "20 hours",
      url: "https://www.udemy.com/course/nextjs-dev/",
    },
    {
      title: "SQL Bootcamp",
      provider: "Udemy",
      skillsCovered: ["SQL", "PostgreSQL", "Database Design"],
      difficulty: "Beginner to Intermediate",
      duration: "18 hours",
      url: "https://www.udemy.com/course/the-complete-sql-bootcamp/",
    },
    {
      title: "MongoDB - The Complete Developer's Guide",
      provider: "Udemy",
      skillsCovered: ["MongoDB", "NoSQL", "Database Design"],
      difficulty: "Intermediate",
      duration: "16 hours",
      url: "https://www.udemy.com/course/mongodb-the-complete-developers-guide/",
    },
    {
      title: "JavaScript Algorithms and Data Structures Masterclass",
      provider: "Udemy",
      skillsCovered: ["Data Structures", "Algorithms", "JavaScript"],
      difficulty: "Intermediate to Advanced",
      duration: "22 hours",
      url: "https://www.udemy.com/course/js-algorithms-and-data-structures-masterclass/",
    },
  ]

  const recommendations: CourseRecommendation[] = []

  // Find courses that address the user's skill gaps
  skillGaps.forEach((gap) => {
    const relevantCourses = courseDatabase.filter((course) =>
      course.skillsCovered.some((skill) => skill.toLowerCase() === gap.skillName.toLowerCase()),
    )

    if (relevantCourses.length > 0) {
      // Add the most relevant course (could be improved with more sophisticated matching)
      recommendations.push(relevantCourses[0])
    }
  })

  // Remove duplicates (in case multiple skill gaps are addressed by the same course)
  const uniqueRecommendations = recommendations.filter(
    (course, index, self) => index === self.findIndex((c) => c.title === course.title),
  )

  // Limit to top 5 recommendations
  return uniqueRecommendations.slice(0, 5)
}

// Helper function to calculate resume score
function calculateResumeScore(resumeFile: any, education: any[], experience: any[]): number {
  // If we already have a parsed resume, use that score
  if (resumeFile?.parsed_data) {
    return resumeFile.parsed_data.resumeScore || 70
  }

  // Otherwise calculate a basic score based on education and experience
  let score = 50 // Base score

  // Add points for education
  if (education && education.length > 0) {
    score += Math.min(education.length * 5, 15)
  }

  // Add points for experience
  if (experience && experience.length > 0) {
    score += Math.min(experience.length * 7, 25)
  }

  // Cap at 100
  return Math.min(score, 100)
}

// Helper function to calculate interview readiness
function calculateInterviewReadiness(
  skills: { name: string; category: string; level: number }[],
  education: any[],
  experience: any[],
): number {
  let score = 40 // Base score

  // Add points for technical skills
  const technicalCategories = ["Programming Languages", "Frameworks & Libraries", "Databases", "Computer Science"]

  const technicalSkills = skills.filter((skill) => technicalCategories.includes(skill.category))

  // Add points for each technical skill based on proficiency
  technicalSkills.forEach((skill) => {
    score += skill.level
  })

  // Add points for education
  if (education && education.length > 0) {
    score += 5
  }

  // Add points for experience
  if (experience && experience.length > 0) {
    score += experience.length * 3
  }

  // Cap at 100
  return Math.min(score, 100)
}
