# Job API Responses Reference

## Summary of Issues

**Problem**: None of the free APIs provide proper tech stack tags. They only give generic categories.

| API | Tags/Categories | Tech Stack Info |
|-----|-----------------|-----------------|
| RemoteOK | Generic: "director", "support", "technical" | In description only |
| Arbeitnow | Categories: "Software Development", "IT" | In description only |
| Himalayas | Job roles: "Marketing", "Engineering" | In description only |
| Jobicy | Industry: "Programming" | In description only |

**Solution**: Extract tech keywords from job title + description.

---

## 1. RemoteOK API

**URL**: `https://remoteok.com/api`
**Auth**: None (just User-Agent header)
**Rate Limit**: Unknown

### Sample Response:
```json
{
  "slug": "remote-senior-analytics-engineer-alpaca-1129325",
  "id": "1129325",
  "epoch": 1735048831,
  "date": "2025-12-23T14:00:31+00:00",
  "company": "Alpaca",
  "company_logo": "",
  "position": "Senior Analytics Engineer",
  "tags": ["crypto", "technical", "support", "financial", "c", "api", "senior"],
  "description": "HTML content...",
  "location": "Remote - North America",
  "salary_min": 60000,
  "salary_max": 80000,
  "url": "https://remoteOK.com/remote-jobs/..."
}
```

**Issues**:
- `tags` are NOT tech stack - they're generic keywords from description
- "c" tag matches "javascript" substring (BUG in our filter)

---

## 2. Arbeitnow API

**URL**: `https://www.arbeitnow.com/api/job-board-api`
**Auth**: None
**Rate Limit**: Unknown

### Sample Response:
```json
{
  "data": [
    {
      "slug": "marketing-allrounder-mit-schwerpunkt-mediengestaltung-berlin-391064",
      "company_name": "Stadtritter GmbH",
      "title": "Marketing-Allrounder (m/w/d)",
      "description": "HTML content...",
      "remote": false,
      "url": "https://www.arbeitnow.com/jobs/...",
      "tags": ["Marketing and Communication"],
      "job_types": [],
      "location": "Berlin",
      "created_at": 1766631713
    }
  ]
}
```

**Issues**:
- `tags` are job categories, NOT tech stack
- No salary info
- Mostly German jobs

---

## 3. Himalayas API

**URL**: `https://himalayas.app/jobs/api`
**Auth**: None
**Rate Limit**: Unknown

### Sample Response:
```json
{
  "jobs": [
    {
      "title": "Influencer & Partnership Manager",
      "excerpt": "Short description...",
      "companyName": "Tumblerware",
      "companyLogo": "https://cdn-images.himalayas.app/...",
      "employmentType": "Full Time",
      "minSalary": 90000,
      "maxSalary": 110000,
      "currency": "USD",
      "seniority": ["Senior", "Manager"],
      "locationRestrictions": ["United States"],
      "categories": ["Influencer-Marketing-Specialist", "Partnerships-Manager"],
      "parentCategories": ["Marketing"],
      "description": "HTML content..."
    }
  ]
}
```

**Issues**:
- `categories` are job roles, NOT tech stack
- Good salary data
- Good structure overall

---

## 4. Jobicy API

**URL**: `https://jobicy.com/api/v2/remote-jobs?count=50&industry=dev`
**Auth**: None
**Rate Limit**: "Few times daily" recommended

### Sample Response:
```json
{
  "jobs": [
    {
      "id": 137834,
      "url": "https://jobicy.com/jobs/137834-microsoft-dynamics-developer",
      "jobTitle": "Microsoft Dynamics Developer",
      "companyName": "ECS",
      "companyLogo": "https://jobicy.com/data/...",
      "jobIndustry": ["Programming"],
      "jobType": ["Full-Time"],
      "jobGeo": "USA",
      "jobLevel": "Any",
      "jobExcerpt": "Short description...",
      "jobDescription": "HTML content with tech stack...",
      "pubDate": "2025-12-23T04:32:20+00:00",
      "salaryMin": 135000,
      "salaryMax": 168000,
      "salaryCurrency": "USD"
    }
  ]
}
```

**Issues**:
- `jobIndustry` is generic: "Programming"
- Tech stack is in `jobDescription` only

---

## 5. JSearch API (RapidAPI)

**URL**: `https://jsearch.p.rapidapi.com/search`
**Auth**: REQUIRED - `JSEARCH_API_KEY`
**Rate Limit**: 500 requests/month free

### Required ENV:
```
JSEARCH_API_KEY=your-rapidapi-key
```

---

## 6. Adzuna API

**URL**: `https://api.adzuna.com/v1/api/jobs/{country}/search/1`
**Auth**: REQUIRED - App ID + API Key
**Rate Limit**: 1000 requests/month free

### Required ENV:
```
ADZUNA_APP_ID=your-app-id
ADZUNA_API_KEY=your-api-key
```

---

## Recommended Solution

Since tags are useless, we need to **extract tech stack from description**:

```javascript
const TECH_KEYWORDS = [
  // Frontend
  'react', 'react.js', 'reactjs', 'react native',
  'vue', 'vue.js', 'vuejs',
  'angular', 'angularjs',
  'next.js', 'nextjs', 'next',
  'svelte', 'nuxt',

  // Backend
  'node', 'node.js', 'nodejs',
  'express', 'express.js',
  'python', 'django', 'flask', 'fastapi',
  'java', 'spring', 'spring boot',
  'golang', 'go ',
  'rust', 'ruby', 'rails',
  'php', 'laravel',
  '.net', 'c#', 'asp.net',

  // Database
  'mongodb', 'mongo',
  'postgresql', 'postgres',
  'mysql', 'sql server',
  'redis', 'elasticsearch',

  // Cloud/DevOps
  'aws', 'amazon web services',
  'gcp', 'google cloud',
  'azure', 'docker', 'kubernetes', 'k8s',

  // Languages
  'javascript', 'typescript',

  // Mobile
  'flutter', 'swift', 'kotlin',

  // AI/ML
  'machine learning', 'ml', 'ai',
  'tensorflow', 'pytorch', 'openai',
  'llm', 'gpt', 'langchain'
];
```

Match these against `title` + `description` with word boundaries.
