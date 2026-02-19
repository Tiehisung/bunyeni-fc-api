⚽ Bunyeni FC API
A comprehensive RESTful API server for football club management, built with Express.js, TypeScript, and MongoDB. This API powers the Bunyeni Football Club ecosystem, handling everything from player management to match statistics.

📋 Table of Contents
Features

Tech Stack

Prerequisites

Installation

Environment Variables

Running the App

API Documentation

Project Structure

Authentication & Authorization

Database Schema

Deployment

Contributing

License

🎯 Features
Core Modules
Authentication & Users - JWT-based auth with role-based access control

Player Management - Player profiles, statistics, captaincy history

Team Management - Team creation, squad selection, formation management

Match Operations - Fixtures, results, live match events

Match Events - Goals, cards, injuries, substitutions, MVP awards

Media Management - Image galleries, document storage, match highlights

News System - Club news, articles, press releases

Sponsors & Donations - Sponsor profiles, donation tracking

Training Sessions - Attendance tracking, session management

Staff Management - Coaches, managers, and support staff

Financial Transactions - Income/expense tracking

Feature Flags - Toggle features on/off dynamically

Comprehensive Logging - Action logging with severity levels

Data Archiving - Soft delete with archiving capability

Statistics & Analytics - Match stats, player performance metrics

Security Features
🔐 JWT Authentication

👮 Role-based access control (RBAC) with EUserRole enum

🛡️ Helmet.js for security headers

⚡ Rate limiting (general and auth-specific)

🔄 MongoDB sanitization (NoSQL injection prevention)

🌐 CORS configuration

📦 Request size limiting

Performance
🚀 Response compression with gzip

📊 MongoDB connection pooling

🔄 Efficient data population with Mongoose

📈 Pagination on all list endpoints

🎯 Optimized aggregation pipelines

🛠 Tech Stack
Runtime: Node.js

Framework: Express.js 5.x

Language: TypeScript

Database: MongoDB with Mongoose ODM

Authentication: JWT (jsonwebtoken)

Security: Helmet, CORS, express-rate-limit, express-mongo-sanitize

Utilities: bcryptjs, compression, morgan

Development: ts-node-dev, nodemon

Deployment: Vercel (serverless), compatible with traditional hosting

📋 Prerequisites
Node.js >= 18.0.0

MongoDB >= 6.0

npm or yarn

Git

🚀 Installation
Clone the repository

bash
git clone https://github.com/Tiehisung/bunyeni-fc-api.git
cd bunyeni-fc-api
Install dependencies

bash
npm install
Set up environment variables

bash
cp .env.example .env
# Edit .env with your configuration
Run in development mode

bash
npm run dev
Build for production

bash
npm run build
npm start
🔐 Environment Variables
Create a .env file in the root directory:

env
# Server Configuration
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bunyeni-fc

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
🏃 Running the App
Development
bash
npm run dev
# Runs with ts-node-dev for hot reload
Production
bash
npm run build
npm start
# Runs compiled JavaScript from dist/
Vercel Deployment
bash
npm run vercel-build
vercel --prod
📚 API Documentation
Base URL
Development: http://localhost:5000/api

Production: https://your-api.vercel.app/api

Health Check
http
GET /health
Response:

json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 123.45,
  "environment": "development",
  "mongodb": "connected"
}
Authentication Endpoints
Method	Endpoint	Description	Roles
POST	/api/auth/register	Register new user	Public
POST	/api/auth/login	User login	Public
POST	/api/auth/logout	User logout	Authenticated
POST	/api/auth/refresh	Refresh token	Authenticated
GET	/api/auth/me	Get current user	Authenticated
User Endpoints
Method	Endpoint	Description	Roles
GET	/api/users	List users	ADMIN, SUPER_ADMIN, COACH
POST	/api/users	Create user	ADMIN, SUPER_ADMIN
GET	/api/users/:id	Get user by ID	ADMIN, SUPER_ADMIN, COACH
PUT	/api/users/:id	Update user	ADMIN, SUPER_ADMIN
DELETE	/api/users/:id	Delete user	SUPER_ADMIN
PATCH	/api/users/:userId/toggle-status	Toggle user status	ADMIN, SUPER_ADMIN
Player Endpoints
Method	Endpoint	Description	Roles
GET	/api/players	List players	Public
POST	/api/players	Create player	ADMIN, SUPER_ADMIN, COACH
GET	/api/players/:id	Get player by ID	Public
PUT	/api/players/:id	Update player	ADMIN, SUPER_ADMIN, COACH
DELETE	/api/players/:id	Delete player	ADMIN, SUPER_ADMIN
PATCH	/api/players/:id/status	Update player status	ADMIN, SUPER_ADMIN, COACH
Match Endpoints
Method	Endpoint	Description	Roles
GET	/api/matches	List matches	Public
POST	/api/matches	Create match	ADMIN, SUPER_ADMIN, COACH
GET	/api/matches/upcoming	Get upcoming matches	Public
GET	/api/matches/recent	Get recent matches	Public
GET	/api/matches/:id	Get match by ID	Public
PUT	/api/matches/:id	Update match	ADMIN, SUPER_ADMIN, COACH
DELETE	/api/matches/:id	Delete match	ADMIN, SUPER_ADMIN
PATCH	/api/matches/:id/result	Update match result	ADMIN, SUPER_ADMIN, COACH
Goal Endpoints
Method	Endpoint	Description	Roles
GET	/api/goals	List goals	Public
POST	/api/goals	Create goal	ADMIN, SUPER_ADMIN, COACH
GET	/api/goals/match/:matchId	Get match goals	Public
GET	/api/goals/player/:playerId	Get player goals	Public
DELETE	/api/goals/:id	Delete goal	ADMIN, SUPER_ADMIN, COACH
Statistics Endpoints
Method	Endpoint	Description
GET	/api/metrics/dashboard	Dashboard metrics
GET	/api/metrics/overview	Overview statistics
GET	/api/metrics/trends	Performance trends
GET	/api/metrics/season/:season	Season-specific stats
GET	/api/metrics/player/:playerId	Player statistics
📁 Project Structure
text
bunyeni-fc-api/
├── api/                          # Vercel serverless entry point
│   └── index.ts
├── src/
│   ├── app.ts                    # Express app configuration
│   ├── server.ts                 # Server startup (traditional hosting)
│   ├── config/
│   │   └── db.ts                 # Database connection
│   ├── modules/                   # Feature modules
│   │   ├── auth/                  # Authentication module
│   │   ├── users/                 # User management
│   │   ├── players/               # Player management
│   │   ├── teams/                 # Team management
│   │   ├── matches/               # Match operations
│   │   │   ├── goals/             # Goal events
│   │   │   ├── cards/             # Card events
│   │   │   ├── injuries/          # Injury events
│   │   │   └── mvps/              # MVP awards
│   │   ├── squad/                 # Squad selection
│   │   ├── news/                   # News articles
│   │   ├── media/                  # Media management
│   │   │   ├── galleries/          # Image galleries
│   │   │   ├── documents/          # Document storage
│   │   │   └── highlights/         # Match highlights
│   │   ├── sponsors/               # Sponsor management
│   │   │   └── donations/          # Donation tracking
│   │   ├── training/               # Training sessions
│   │   ├── features/               # Feature flags
│   │   ├── captains/               # Captaincy history
│   │   ├── managers/               # Staff management
│   │   ├── logs/                   # Activity logging
│   │   ├── archives/               # Data archiving
│   │   └── metrics/                # Statistics & analytics
│   ├── shared/                     # Shared utilities
│   │   ├── middleware/              # Custom middleware
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error-handler.middleware.ts
│   │   │   └── logger.middleware.ts
│   │   └── utils/                   # Helper functions
│   └── types/                       # TypeScript type definitions
│       └── express.d.ts              # Express type extensions
├── dist/                           # Compiled output
├── .env                             # Environment variables
├── .gitignore
├── package.json
├── tsconfig.json
└── vercel.json                      # Vercel configuration
👮 Authentication & Authorization
The API uses JWT (JSON Web Tokens) for authentication and implements Role-Based Access Control (RBAC) with the following roles:

typescript
enum EUserRole {
  SUPER_ADMIN = 'super_admin',  // Full system access
  ADMIN = 'admin',               // Administrative access
  MANAGER = 'manager',           // Team management
  COACH = 'coach',                // Coaching staff
  ASSISTANT_COACH = 'assistant_coach',
  PLAYER = 'player',              // Player access (limited)
  GUEST = 'guest',                 // Read-only access
  JOURNALIST = 'journalist',       // News management
  EDITOR = 'editor',               // Content editing
  FINANCE_MANAGER = 'finance_manager',
  FINANCE_STAFF = 'finance_staff',
  HR_MANAGER = 'hr_manager',
  ANALYST = 'analyst',             // Statistics access
  SPONSORSHIP_MANAGER = 'sponsorship_manager',
  REFEREE = 'referee'              // Match official
}
Authentication Flow
Login: POST /api/auth/login with email/password

Receive JWT: Server returns token in response

Authenticate: Include token in Authorization: Bearer <token> header

Authorize: Middleware checks user roles for protected routes

📊 Database Schema
Key models include:

User - System users with authentication

Player - Player profiles and statistics

Team - Team information and squad

Match - Fixtures and results

Goal - Goal events with scorers/assists

Card - Yellow/red card events

Injury - Player injury records

Squad - Match lineups and substitutions

News - Club news articles

Gallery - Image galleries

Document - File storage

Sponsor - Sponsor information

Donation - Donation records

Training - Training sessions and attendance

Feature - Feature flags

Captaincy - Captain history

Log - Action logs

Archive - Archived records

🚢 Deployment
Deploy to Vercel (Recommended)
Install Vercel CLI

bash
npm i -g vercel
Login to Vercel

bash
vercel login
Deploy

bash
vercel --prod
Set Environment Variables

Go to your project on Vercel Dashboard

Settings → Environment Variables

Add all variables from your .env file

Deploy to Traditional Hosting (Heroku, DigitalOcean, etc.)
Build the project

bash
npm run build
Start the server

bash
npm start
Using PM2 (recommended)

bash
npm install -g pm2
pm2 start dist/src/server.js --name bunyeni-api
📝 API Response Format
All API responses follow a consistent format:

Success Response
json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message",
  "pagination": {  // For list endpoints
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
Error Response
json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (development only)",
  "stack": "Error stack trace (development only)"
}
🧪 Testing
bash
# Run tests (when implemented)
npm test

# Run tests with coverage
npm run test:coverage
🤝 Contributing
Fork the repository

Create a feature branch (git checkout -b feature/amazing-feature)

Commit your changes (git commit -m 'Add some amazing feature')

Push to the branch (git push origin feature/amazing-feature)

Open a Pull Request

Coding Standards
Follow TypeScript best practices

Use proper enums for authorization (EUserRole)

Add JSDoc comments for functions

Write unit tests for new features

Update documentation as needed

📄 License
This project is licensed under the ISC License.

👥 Authors
Tiehisung - Initial work

🙏 Acknowledgments
Express.js community

MongoDB team

All contributors and supporters of Bunyeni FC