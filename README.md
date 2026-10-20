# CourseSpace — Online Course Service

CourseSpace is a role-based course management application. Teachers create and
manage courses, while Students browse the catalog and enroll in available
courses. The project uses a Next.js API, MongoDB, JWT authentication in an
HTTP-only cookie, and a React/MUI frontend.

## Student Information

- **Student Name:** Ekaterina Kazakova
- **Student ID:** 6720065

## Features

- Login with either username or email; logout and session restoration
- Separate Teacher and Student dashboards with protected routes
- Teacher course creation, editing, status control, deletion, and enrollment roster
- Student course catalog, name/teacher search, course details, enrollment, and My Courses
- Course states: Open courses accept enrollment, Close courses remain visible but reject enrollment, and Cancel courses are hidden from Students
- Duplicate and over-capacity enrollments prevented atomically in MongoDB
- Passwords stored as bcrypt hashes and JWTs stored in HTTP-only cookies

## Test Credentials

All seeded accounts use the following local-development credentials:

| Role | Username | Email | Password |
| --- | --- | --- | --- |
| Student | `student1` | `student1@example.com` | `Student123!` |
| Student | `student2` | `student2@example.com` | `Student123!` |
| Student | `student3` | `student3@example.com` | `Student123!` |
| Teacher | `teacher1` | `teacher1@example.com` | `Teacher123!` |
| Teacher | `teacher2` | `teacher2@example.com` | `Teacher123!` |
| Teacher | `teacher3` | `teacher3@example.com` | `Teacher123!` |

## Prerequisites

- Node.js 20 or newer
- npm
- A MongoDB Atlas database (or another reachable MongoDB deployment)

## Environment Setup

Create `next-backend/.env.local` from `next-backend/.env.example` and provide:

```env
MONGODB_URI=your-mongodb-connection-string
DB_NAME=online_course_service
JWT_SECRET=a-long-random-secret
FRONTEND_URL=http://localhost:5173

SEED_STUDENT_PASSWORD=Student123!
SEED_TEACHER_PASSWORD=Teacher123!
```

Create `react-frontend/.env.development` from
`react-frontend/.env.example`:

```env
VITE_API_URL=http://localhost:3000
```

The real environment files are ignored by Git. Do not commit secrets.

## How to Run

### 1. Backend (`next-backend/`)

```bash
npm install
npm run seed
npm run dev
```

The API and status page run at `http://localhost:3000`.

### 2. Frontend (`react-frontend/`)

In a second terminal:

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in a browser.

## Testing Walkthrough

1. Log in as `teacher1` and create an Open course. Set its duration, topics,
   price, and maximum number of Students.
2. Open the course details, edit its information, and confirm it appears in
   the Teacher dashboard.
3. Log out, then log in as `student1`. Find the course by its name or the
   Teacher username and enroll.
4. Open My Courses and confirm the enrollment appears.
5. Log back in as `teacher1` and open the course to confirm `student1` appears
   in its roster.
6. Change the course to Close and confirm Students can still see it but cannot
   enroll. Change it to Cancel and confirm it is hidden from Students.
7. Confirm that an enrolled course cannot be deleted and that its capacity
   cannot be reduced below its current enrollment count.

## API Summary

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | Public | Authenticate and set the session cookie |
| POST | `/api/auth/logout` | Authenticated | Clear the session cookie |
| GET | `/api/me` | Authenticated | Return the current user |
| GET | `/api/course` | Authenticated | List the role-appropriate courses |
| POST | `/api/course` | Teacher | Create a course |
| GET | `/api/course/:courseId` | Authenticated | View course details |
| PUT | `/api/course/:courseId` | Owning Teacher | Update a course |
| DELETE | `/api/course/:courseId` | Owning Teacher | Delete an empty course |
| POST | `/api/course/:courseId/enroll` | Student | Enroll in an Open course |
| GET | `/api/user` | Teacher | List Students without sensitive fields |
| GET | `/api/user/:userId` | Restricted | Read an allowed user profile |

Student catalog queries support `?search=term`; My Courses uses
`?enrolled=true`.

## Verification

Run these commands in both application directories before submission:

```bash
npm run lint
npm run build
```

## Vercel Deployment

Create two Vercel projects from this monorepo and choose the corresponding root
directory for each project:

- Backend root: `next-backend`
- Frontend root: `react-frontend`

Set `MONGODB_URI`, `DB_NAME`, `JWT_SECRET`, and `FRONTEND_URL` in the backend
project. Set `VITE_API_URL` to the deployed backend origin in the frontend
project. Set backend `FRONTEND_URL` to the deployed frontend origin so browser
credential requests pass CORS checks.

## Deployment Links

- **Frontend deployment:** https://web-dev-final-frontend.vercel.app
- **Backend deployment:** https://wad-final-2026-01-five.vercel.app
