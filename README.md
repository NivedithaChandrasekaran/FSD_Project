# CareerForge AI — MERN + AI Career Acceleration Platform

An enterprise-grade, modern full-stack web application designed to empower students and job seekers in creating ATS-optimized resumes, tailored cover letters, personal portfolio websites, and AI-driven career roadmaps.

---

## 1. Problem Statement

Job seekers frequently struggle to create professional resumes that successfully pass Applicant Tracking Systems (ATS). Over 75% of resumes are filtered out before reaching hiring managers due to incompatible formatting, insufficient keyword density, missing action verbs, and unquantified accomplishments. Additionally, candidates face hurdles matching job descriptions, analyzing skill gaps, and building personal portfolio websites from scratch.

---

## 2. Proposed Solution

**CareerForge AI** solves this by providing a unified, intelligent career platform. Users enter their career history once into a structured 9-step Career Profile Builder. That information is reused across all AI and scoring tools:
- Automated ATS-optimized resume generation with single-column clean hierarchy
- 100% deterministic ATS scoring engine analyzing 7 key dimensions
- Interactive job description keyword coverage and skill matching
- Tone-customized cover letter generation
- Auto-generated portfolio websites featuring Minimal, Modern, and Professional themes
- AI Career Advisor and Role Compatibility engine with prioritized learning roadmaps
- Centralized saved document management (Open, Edit, Duplicate, Delete)

---

## 3. Key Features

- **Multi-Step Career Profile Builder:** 9 structured steps (Personal, Summary, Education, Experience, Projects, Skills, Certifications, Achievements, Preferences) with dynamic Add/Edit/Delete.
- **1-Click Demo Profile Loader:** Instant sample profile (Alex Johnson) to immediately test and demonstrate the entire platform.
- **ATS Resume Builder:** Generates factually accurate, keyword-dense resumes. Includes in-place text editor, AI improvement tool, ATS scanner link, and direct PDF download.
- **Deterministic ATS Scoring Engine:** 100-point multi-factor algorithm (Keyword Match: 30, Skills Match: 20, Structure: 15, Action Verbs: 10, Quantifiable Achievements: 10, Formatting: 10, Contact: 5).
- **Job Description Matching:** Identifies matched skills (✓), missing competencies, keyword coverage %, and targeted improvement recommendations.
- **AI Cover Letter Generator:** Crafts personalized, fact-based letters across 4 distinct tones (Professional, Confident, Friendly, Concise) with Edit, Regenerate, Copy, Save, and Download.
- **Portfolio Website Builder & Public URL:** Generates personal websites hosted at `/portfolio/:username` with 3 themes (Minimal, Modern, Professional) and section visibility toggles.
- **AI Career Advisor & Compatibility Engine:** Answers career questions and evaluates percentage fit across industry software engineering roles.
- **Skill Gap Analyzer:** Categorizes competencies into Strong, Moderate, and Missing, paired with a 5-phase structured learning roadmap.
- **Saved Documents Management:** Centralized hub for Resumes, Cover Letters, Portfolios, and ATS Reports with Open, Edit, Duplicate, and Delete actions.
- **Graceful Fallback Mode:** Seamless deterministic AI engine guarantees every feature works even when external AI API keys are not supplied.

---

## 4. MERN Architecture

The platform strictly follows the MERN architectural pattern:
- **MongoDB & Mongoose:** Schema-driven persistence for Users, Profiles, Resumes, Cover Letters, Portfolios, and ATS Reports. Connects to MongoDB Atlas or local MongoDB instances, with built-in resilient local persistence fallback for offline or zero-configuration demonstrations.
- **Express.js & Node.js:** Modular RESTful backend, JWT authentication middleware, deterministic ATS scoring engine, and external AI orchestration.
- **React.js (Vite):** Fast, component-driven client interface with semantic HTML, custom CSS variables, and zero reliance on CSS frameworks (no Tailwind, no Bootstrap).

```
[ React Client (Vite) ]
         │ (HTTP / JSON / JWT)
         ▼
[ Express.js REST API ] ──► [ Auth Middleware (JWT + bcrypt) ]
         │
         ├──► [ ATS Scoring Engine & Job Matcher ]
         ├──► [ AI Service (OpenAI / Deterministic Fallback) ]
         │
         ▼
[ Mongoose Models ] ──► [ MongoDB Database ]
```

---

## 5. Technology Stack

### Frontend
- **React 18** (Functional components, Hooks, Context API)
- **React Router v6** (Protected routes, layout routing, public portfolio route)
- **Vanilla Modern CSS** (CSS Variables, Flexbox, CSS Grid, mobile drawer)
- **Axios** (Configured request interceptors with Bearer token authentication)
- **jsPDF** (Client-side clean ATS resume and cover letter PDF generation)

### Backend
- **Node.js** (ES Modules, async/await architecture)
- **Express.js** (Routing, error handling, CORS, Morgan logger)
- **Mongoose & MongoDB** (ODM schemas, indexing, and data models)
- **JSON Web Tokens (JWT)** (Secure 7-day token issuance and verification)
- **bcryptjs** (10-round salted password hashing)

---

## 6. Project Structure

```text
careerforge-ai/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MainLayout.jsx          # App shell with responsive sidebar
│   │   │   ├── ProtectedRoute.jsx      # JWT route guard
│   │   │   └── StatCard.jsx            # Metric card component
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # User authentication state
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx         # 9-section marketing landing page
│   │   │   ├── LoginPage.jsx           # User login
│   │   │   ├── RegisterPage.jsx        # Account registration
│   │   │   ├── DashboardPage.jsx       # Overview, metrics & recent documents
│   │   │   ├── ProfilePage.jsx         # 9-step Career Profile builder
│   │   │   ├── ResumeBuilderPage.jsx   # Resume generation, editor & preview
│   │   │   ├── ATSPage.jsx             # Deterministic ATS scoring & JD match
│   │   │   ├── CoverLetterPage.jsx     # Cover letter generator & actions
│   │   │   ├── PortfolioPage.jsx       # Portfolio generator & preview
│   │   │   ├── PublicPortfolioPage.jsx # Public view (/portfolio/:username)
│   │   │   ├── CareerAdvisorPage.jsx   # AI Advisor & role compatibility
│   │   │   ├── SkillGapPage.jsx        # Skill classification & roadmap
│   │   │   └── SavedDocumentsPage.jsx  # Document management hub
│   │   ├── services/
│   │   │   └── api.js                  # Axios client with auth interceptor
│   │   ├── utils/
│   │   │   ├── demoData.js             # Alex Johnson demo profile
│   │   │   └── downloadPdf.js          # jsPDF export utility
│   │   ├── App.jsx                     # Route declarations
│   │   ├── index.css                   # Comprehensive application styles
│   │   └── main.jsx                    # React entry point
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── config/
│   │   ├── db.js                       # MongoDB connection & fallback handler
│   │   └── localStore.js               # Resilient local JSON data store
│   ├── controllers/
│   │   ├── authController.js           # Register, login, getMe
│   │   ├── profileController.js        # Profile CRUD & AI summary generator
│   │   ├── resumeController.js         # Resume CRUD, AI generate, improve, duplicate
│   │   ├── atsController.js            # ATS analysis & report retrieval
│   │   ├── coverLetterController.js    # Cover letter generation, duplicate & delete
│   │   ├── portfolioController.js      # Portfolio CRUD & public profile lookup
│   │   └── careerController.js         # Role recommendations, skill gap, advice
│   ├── middleware/
│   │   └── auth.js                     # JWT authorization verification
│   ├── models/
│   │   ├── User.js                     # User schema
│   │   ├── CareerProfile.js            # Profile schema (all 9 steps)
│   │   ├── Resume.js                   # Resume document schema
│   │   ├── CoverLetter.js              # Cover letter schema
│   │   ├── Portfolio.js                # Portfolio schema with themes & visibility
│   │   ├── ATSReport.js                # ATS diagnostic report schema
│   │   └── localModel.js               # Mongoose dual-mode hybrid router
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── profileRoutes.js
│   │   ├── resumeRoutes.js
│   │   ├── atsRoutes.js
│   │   ├── coverLetterRoutes.js
│   │   ├── portfolioRoutes.js
│   │   └── careerRoutes.js
│   ├── services/
│   │   └── aiService.js                # AI integration & deterministic fallback
│   ├── utils/
│   │   └── atsEngine.js                # 100-pt deterministic ATS scoring engine
│   ├── package.json
│   └── server.js                       # Express server entry point
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 7. Database Design & Schemas

### 1. User
- `name`: String (Required)
- `email`: String (Required, Unique, Lowercase)
- `password`: String (Bcrypt hashed)
- `createdAt`, `updatedAt`: Timestamps

### 2. CareerProfile
- `userId`: ObjectId / String (Ref: User, Unique)
- `fullName`, `professionalTitle`, `email`, `phone`, `location`, `linkedin`, `github`, `website`, `profilePhoto`
- `summary`: String
- `education`: Array [{ degree, institution, startYear, endYear, score, coursework }]
- `experience`: Array [{ company, title, location, startDate, endDate, description, achievements }]
- `projects`: Array [{ name, description, technologies, githubUrl, liveUrl, contributions }]
- `technicalSkills`, `softSkills`, `languages`, `achievements`: Arrays of Strings
- `certifications`: Array [{ name, organization, date, credentialUrl }]
- `careerInterests`, `targetRoles`: Arrays of Strings
- `targetIndustry`: String

### 3. Resume
- `userId`: ObjectId / String (Ref: User)
- `title`, `targetRole`, `jobDescription`, `summary`: Strings
- `skills`: Array of Strings
- `experience`, `projects`, `education`, `certifications`, `achievements`: Structured Arrays
- `contact`: Embedded Object
- `atsScore`: Number
- `createdAt`, `updatedAt`: Timestamps

### 4. CoverLetter
- `userId`: ObjectId / String (Ref: User)
- `company`, `jobTitle`, `recipientName`, `jobDescription`, `tone`, `content`: Strings
- `createdAt`, `updatedAt`: Timestamps

### 5. Portfolio
- `userId`: ObjectId / String (Ref: User, Unique)
- `username`: String (Unique, Lowercase, URL-safe)
- `theme`: String ('Minimal' | 'Modern' | 'Professional')
- `hero`: Embedded Object { headline, subheading, avatarUrl }
- `about`, `skills`, `experience`, `projects`, `education`, `certifications`, `achievements`, `contact`
- `sectionsVisibility`: Object of boolean toggles for each section
- `published`: Boolean

### 6. ATSReport
- `userId`: ObjectId / String (Ref: User)
- `resumeId`: ObjectId / String (Optional Ref: Resume)
- `overallScore`: Number (0-100)
- `keywordScore`, `skillsScore`, `structureScore`, `actionVerbScore`, `achievementScore`, `contactScore`, `formatScore`
- `matchedKeywords`, `missingKeywords`, `matchedSkills`, `missingSkills`: Arrays of Strings
- `keywordCoverage`: Number (%)
- `suggestions`: Array of Strings

---

## 8. REST API Reference

| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Register new user account | No |
| **POST** | `/api/auth/login` | Authenticate user & return JWT | No |
| **GET** | `/api/auth/me` | Fetch authenticated user details | Yes |
| **GET** | `/api/profile` | Fetch user career profile | Yes |
| **POST** | `/api/profile` | Create or update career profile | Yes |
| **POST** | `/api/profile/generate-summary` | Generate profile summary via AI | Yes |
| **GET** | `/api/resumes` | List user resumes | Yes |
| **GET** | `/api/resumes/:id` | Fetch specific resume | Yes |
| **POST** | `/api/resumes` | Save new resume | Yes |
| **POST** | `/api/resumes/generate` | Generate tailored resume | Yes |
| **POST** | `/api/resumes/improve` | Improve resume content with AI | Yes |
| **POST** | `/api/resumes/:id/duplicate`| Duplicate existing resume | Yes |
| **PUT** | `/api/resumes/:id` | Update resume content | Yes |
| **DELETE**| `/api/resumes/:id` | Delete resume | Yes |
| **POST** | `/api/ats/analyze` | Run ATS diagnostic analysis | Yes |
| **GET** | `/api/ats` | List user ATS reports | Yes |
| **GET** | `/api/ats/:id` | Fetch specific ATS report | Yes |
| **DELETE**| `/api/ats/:id` | Delete ATS report | Yes |
| **POST** | `/api/cover-letter/generate`| Generate tailored cover letter | Yes |
| **GET** | `/api/cover-letter` | List user cover letters | Yes |
| **GET** | `/api/cover-letter/:id` | Fetch specific cover letter | Yes |
| **PUT** | `/api/cover-letter/:id` | Update cover letter content | Yes |
| **POST** | `/api/cover-letter/:id/duplicate`| Duplicate cover letter | Yes |
| **DELETE**| `/api/cover-letter/:id` | Delete cover letter | Yes |
| **GET** | `/api/portfolio` | Fetch user portfolio configuration | Yes |
| **POST** | `/api/portfolio` | Save portfolio configuration | Yes |
| **GET** | `/api/portfolio/public/:username`| View published public portfolio | No |
| **POST** | `/api/career/recommend` | Generate role compatibility matches | Yes |
| **POST** | `/api/career/skill-gap` | Analyze skill gaps & generate roadmap| Yes |
| **POST** | `/api/career/advice` | Consult AI career advisor | Yes |
| **GET** | `/api/health` | Server and database status check | No |

---

## 9. Installation & Local Setup

### Prerequisites
- Node.js (v18 or newer)
- npm (v9 or newer)
- Optional: MongoDB Community Server or MongoDB Atlas account

### 1. Clone & Install Dependencies
Run the install command to install root, backend, and frontend dependencies:
```bash
npm run install:all
```
*(Or install each directory individually: `npm install`, `npm --prefix backend install`, `npm --prefix frontend install`)*

### 2. Configure Environment Variables
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

Ensure `.env` contains:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/careerforge
JWT_SECRET=replace_with_a_random_secret_at_least_32_characters_long
AI_API_KEY=
CLIENT_URL=http://localhost:5173
VITE_API_URL=/api
```

> **Note on MongoDB:** If MongoDB is running on your machine, Mongoose connects immediately. If MongoDB is not running locally, the application automatically activates local persistent storage, allowing immediate demonstration without database errors.

> **Note on AI API Key:** If you have an OpenAI API key, set `AI_API_KEY=sk-...`. If left empty, CareerForge AI automatically utilizes its built-in intelligent deterministic fallback engine so all features function smoothly.

### 3. Running Locally
Run both backend and frontend concurrently:
```bash
npm run dev
```

The application will be live at:
- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000/api`
- **Health Check:** `http://localhost:5000/api/health`

---

## 10. Building for Production

Compile the production-ready client bundle:
```bash
npm run build
```

Preview the production build locally:
```bash
npm --prefix frontend run preview
```

---

## 11. Testing the User Flow

1. Navigate to `http://localhost:5173`.
2. Register an account at `/register` or login at `/login`.
3. In **My Profile**, click **⚡ Load Demo Profile (Alex Johnson)** to populate complete profile data in 1 click, then click **Save**.
4. Open **Resume Builder**, pick a target role, and click **✨ Generate Resume with AI**. Test the **✏️ Edit**, **✨ Improve with AI**, and **📥 Download PDF** buttons.
5. Click **🎯 Analyze ATS** to transfer the resume to the **ATS Analyzer**. View the 100-point score, score breakdown, matched skills (`✓`), missing skills, and keyword coverage.
6. Open **Cover Letter**, select a tone, and click **✨ Generate Cover Letter**. Test **Copy**, **Edit**, **Save**, and **Download**.
7. Open **Portfolio**, select a theme (Minimal, Modern, Professional), toggle sections, check **Published**, and click the public URL (`/portfolio/:username`) to view your live portfolio website!
8. Open **Career AI** and test the **AI Career Advisor** and **Role Compatibility Engine**.
9. Open **Skill Gap** and explore the Strong/Moderate/Missing classifications and learning roadmap.
10. Open **Saved Documents** to inspect all saved assets with **Open**, **Edit**, **Duplicate**, and **Delete**.

---

## 12. Security Implementation

- **Bcrypt Password Hashing:** 10 rounds of salt to safeguard stored credentials.
- **JWT Protection:** Signed Bearer tokens verified via Express middleware on all private API endpoints.
- **API Key Isolation:** External AI API keys reside solely on the Express server and are never exposed to the React client bundle.
- **CORS Protection:** Configured cross-origin resource sharing.
- **Input Validation:** Sanitized payloads and strict schema validation preventing injection vulnerabilities.

---

## 13. Future Roadmap

- LinkedIn profile PDF import parser
- Multi-column visual resume templates with theme customization
- Automated email dispatch of cover letters and resumes to recruiters
- Video mock interview simulator with real-time speech and sentiment analysis
- Team and enterprise recruitment portals for university placement offices

---

## 14. License

This project is licensed under the MIT License — suitable for university semester projects, portfolio showcases, and production deployment.
