# JobDiggerrr - Task List

## Project Overview
**Name:** JobDiggerrr
**Tagline:** "Find tech jobs that 99% of developers never see"
**Goal:** Aggregate jobs from hidden sources + ATS Resume Optimizer + AI Cover Letter Generator

---

## Tech Stack
- **Frontend:** Next.js 14 (App Router)
- **Backend:** Next.js API Routes
- **Database:** MongoDB Atlas (free tier)
- **Auth:** NextAuth.js / Clerk
- **AI:** OpenAI API (cover letter + resume parsing)
- **Styling:** Tailwind CSS
- **Hosting:** Vercel (free tier)

---

## Job Sources (FREE APIs)

| API | Endpoint | Type | Limit |
|-----|----------|------|-------|
| RemoteOK | `remoteok.com/api` | Remote Tech | Unlimited |
| Arbeitnow | `arbeitnow.com/api/job-board-api` | Tech/Remote | Unlimited |
| Himalayas | `himalayas.app/api/jobs` | Remote | Unlimited |
| Jobicy | Public API | Remote | Unlimited |
| JSearch (RapidAPI) | RapidAPI | LinkedIn, Indeed, Glassdoor | 500/month FREE |
| Adzuna | `developer.adzuna.com` | Global | 1000/month FREE |

---

## Phase 1: MVP Features

### 1. Authentication
- [ ] Setup NextAuth.js / Clerk
- [ ] Google OAuth login
- [ ] Email/Password login
- [ ] User profile page

### 2. User Profile Setup
- [ ] Tech stack selection (React, Node, Python, MERN, etc.)
- [ ] Years of Experience (YOE) selection
- [ ] Location preference (Remote / Onsite / Hybrid)
- [ ] Save preferences to DB

### 3. Job Fetching & Caching
- [ ] Setup MongoDB connection
- [ ] Create Job schema
- [ ] Fetch jobs from RemoteOK API
- [ ] Fetch jobs from Arbeitnow API
- [ ] Fetch jobs from Himalayas API
- [ ] Fetch jobs from JSearch API (RapidAPI)
- [ ] Implement 6-hour cache refresh strategy
- [ ] Store jobs in MongoDB (backend cache)
- [ ] Deduplicate jobs from multiple sources

### 4. Job Listing Page
- [ ] Display jobs in card/list format
- [ ] Filter by tech stack
- [ ] Filter by YOE
- [ ] Filter by time (6hr, 24hr, 7 days, 30 days)
- [ ] Filter by Remote/Onsite/Hybrid
- [ ] Sort by newest first
- [ ] Pagination / Infinite scroll
- [ ] Search by keyword

### 5. Job Interaction Tracking
- [ ] Track clicked jobs
- [ ] Mark as "Applied" button
- [ ] Save for later functionality
- [ ] Show "Already viewed" badge
- [ ] Applied jobs history page

### 6. Resume Upload & Parsing
- [ ] Resume upload (PDF)
- [ ] Store resume in cloud storage (Cloudinary/S3)
- [ ] Parse resume using pdf-parse library
- [ ] Extract skills, experience, education using AI
- [ ] Store parsed data in user profile

### 7. ATS Resume Score
- [ ] Analyze resume against job description
- [ ] Calculate ATS compatibility score (0-100)
- [ ] Show missing keywords
- [ ] Highlight improvement areas

### 8. ATS Resume Optimizer
- [ ] AI suggestions to improve resume
- [ ] Add missing keywords
- [ ] Format recommendations
- [ ] Generate optimized resume version

### 9. AI Cover Letter Generator
- [ ] Select a job
- [ ] Generate cover letter based on:
  - User's resume
  - Job description
  - User's tech stack
- [ ] Edit generated cover letter
- [ ] Copy to clipboard
- [ ] Download as PDF

---

## Phase 2: Enhanced Features

### 10. Email Alerts
- [ ] Daily/Weekly job digest email
- [ ] New jobs matching criteria alert
- [ ] Setup email service (Resend/SendGrid)

### 11. Advanced Filters
- [ ] Salary range filter (if available)
- [ ] Company size filter
- [ ] Industry filter

### 12. Analytics Dashboard
- [ ] Total jobs applied
- [ ] Jobs viewed this week
- [ ] Most searched tech stacks
- [ ] Application success rate

### 13. Mobile App
- [ ] React Native / Flutter app
- [ ] Push notifications for new jobs

---

## Database Schema

### User
```javascript
{
  _id: ObjectId,
  email: String,
  name: String,
  avatar: String,
  techStack: ["React", "Node.js", "MongoDB"],
  yearsOfExperience: Number,
  locationPreference: "remote" | "onsite" | "hybrid",
  resumeUrl: String,
  resumeParsedData: {
    skills: [],
    experience: [],
    education: []
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Job
```javascript
{
  _id: ObjectId,
  title: String,
  company: String,
  location: String,
  type: "remote" | "onsite" | "hybrid",
  description: String,
  techTags: ["React", "JavaScript", "Node.js"],
  yoeRequired: { min: Number, max: Number },
  salary: { min: Number, max: Number, currency: String },
  source: "remoteok" | "arbeitnow" | "himalayas" | "jsearch" | "adzuna",
  sourceUrl: String,
  sourceId: String,
  postedAt: Date,
  fetchedAt: Date
}
```

### UserJobInteraction
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  jobId: ObjectId,
  clicked: Boolean,
  clickedAt: Date,
  applied: Boolean,
  appliedAt: Date,
  savedForLater: Boolean,
  coverLetterGenerated: Boolean
}
```

---

## API Routes

```
POST   /api/auth/[...nextauth]  - Authentication
GET    /api/jobs                - Get jobs (with filters)
POST   /api/jobs/refresh        - Force refresh jobs (admin)
GET    /api/jobs/[id]           - Get single job
POST   /api/user/profile        - Update user profile
POST   /api/user/resume         - Upload resume
GET    /api/user/interactions   - Get user's job interactions
POST   /api/user/interactions   - Track job click/apply
POST   /api/ai/cover-letter     - Generate cover letter
POST   /api/ai/ats-score        - Get ATS score
POST   /api/ai/optimize-resume  - Get resume optimization suggestions
```

---

## Folder Structure

```
job-diggerrr/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── jobs/
│   │   ├── profile/
│   │   ├── resume/
│   │   ├── applied/
│   │   └── saved/
│   ├── api/
│   │   ├── auth/
│   │   ├── jobs/
│   │   ├── user/
│   │   └── ai/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── jobs/
│   ├── resume/
│   └── shared/
├── lib/
│   ├── db.ts
│   ├── auth.ts
│   ├── job-fetchers/
│   │   ├── remoteok.ts
│   │   ├── arbeitnow.ts
│   │   ├── himalayas.ts
│   │   └── jsearch.ts
│   └── ai/
│       ├── cover-letter.ts
│       ├── ats-score.ts
│       └── resume-parser.ts
├── models/
│   ├── User.ts
│   ├── Job.ts
│   └── Interaction.ts
├── hooks/
├── types/
├── public/
├── .env.local
├── package.json
├── tailwind.config.js
└── README.md
```

---

## Environment Variables

```env
# Database
MONGODB_URI=

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# APIs
RAPIDAPI_KEY=
ADZUNA_APP_ID=
ADZUNA_APP_KEY=

# AI
OPENAI_API_KEY=

# Storage
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## Revenue Model (Future)

| Tier | Price | Features |
|------|-------|----------|
| Free | ₹0 | 20 jobs/day, basic filters |
| Pro | ₹299/month | Unlimited jobs, ATS checker, 10 cover letters/month |
| Premium | ₹499/month | Everything + unlimited cover letters, email alerts |

---

## Timeline

### Week 1
- [ ] Project setup (Next.js, Tailwind, MongoDB)
- [ ] Authentication setup
- [ ] User profile & preferences

### Week 2
- [ ] Job fetching from all APIs
- [ ] Caching strategy implementation
- [ ] Job listing page with filters

### Week 3
- [ ] Resume upload & parsing
- [ ] ATS score calculation
- [ ] Job interaction tracking

### Week 4
- [ ] AI Cover Letter generator
- [ ] Resume optimizer
- [ ] Testing & bug fixes

### Week 5
- [ ] UI polish
- [ ] Deploy to Vercel
- [ ] Beta launch

---

## Notes

- Start with FREE APIs only
- Cache jobs in backend (MongoDB) - all users share cache
- Refresh cache every 6 hours
- Only fetch when user's tech stack has no cached data
- Attribution required for RemoteOK, Arbeitnow (link back to source)
