# JobDiggerrr

Find Jobs Where Others Aren't Looking. A job aggregator that fetches remote tech jobs from hidden sources that most job seekers overlook.

## Features

- **8 Job Sources** - RemoteOK, Himalayas, Arbeitnow, Jobicy, Remotive, Working Nomads, JSearch, Adzuna
- **Smart Caching** - Jobs cached in MongoDB for 6 hours to reduce API calls
- **Tech Stack Filters** - Filter by JavaScript, Python, React, Node.js, and 25+ technologies
- **Work Type Filters** - Remote, Onsite, Hybrid options
- **Bookmarks** - Save jobs for later (requires login)
- **Dark Mode** - Easy on the eyes
- **Google Sign In** - Quick authentication
- **Responsive Design** - Works on all devices

## Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas
- **Authentication**: NextAuth.js with Google OAuth
- **Deployment**: Render

## Environment Variables

Create a `.env.local` file with:

```env
# JSearch API (RapidAPI)
JSEARCH_API_KEY=your_jsearch_api_key

# Adzuna API
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_API_KEY=your_adzuna_api_key

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jobdiggerrr

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## API Endpoints

- `GET /api/jobs` - Fetch jobs with optional filters
- `GET /api/jobs/[id]` - Get single job details
- `POST /api/jobs/refresh` - Force refresh jobs from APIs
- `GET /api/bookmarks` - Get user's bookmarks
- `POST /api/bookmarks` - Add bookmark
- `DELETE /api/bookmarks?jobId=xxx` - Remove bookmark

## Deployment

### Render

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repo
4. Set environment variables
5. Deploy

## License

MIT

---

Made with ❤️ by **Sayed Abdul Karim**
