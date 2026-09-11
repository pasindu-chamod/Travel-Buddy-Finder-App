# Travel Buddy Finder App (Full-Stack MERN)

[![Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-4.x-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> A full-stack travel companion and squad finder web application designed for group trip planning, budget tracking, real-time community messaging, and administrative safety governance.

---

## Features Overview

### Traveler Portal
* **Explore Approved Trips**: Search and filter admin-approved travel expeditions by destination, budget, or women-only preferences.
* **Host & Submit Expeditions**: Create custom travel itineraries; submitted trips are queued for admin review before public publishing.
* **Buddy Matcher**: Interactive profile matching to connect with compatible travel companions.
* **Direct Messenger**: Real-time 1-on-1 messaging between travelers as well as a direct line to System Admin Support.
* **Trip Expense Splitter**: Track shared expenditures and manage group balances transparently.
* **Community Travel Feed**: Share travel photos, stories, and like posts from fellow travelers.
* **Emergency SOS Dispatch**: One-click emergency SOS alerting with live GPS coordinate dispatch and emergency contact details.

### Admin Governance Console
* **Isolated Control Center**: Dedicated administrative interface isolated from regular user views.
* **Trip Approvals Queue**: Moderation workflow to review, approve, or reject host trip requests before publishing.
* **User Governance**: Suspend/Activate accounts, toggle verified badges, or permanently remove users violating community rules.
* **Support & Guidance Messaging**: Direct communication channel with travelers to offer official travel advisories and safety guidance.
* **Emergency SOS Monitor**: Real-time alert monitor with active/resolved status tracking.
* **Content Moderation**: Review public community posts and delete inappropriate content.

---

## Tech Stack & Architecture

### Frontend
- **Framework**: React 18 (JSX)
- **Build Tool**: Vite 5
- **Icons**: Lucide React
- **Client Networking**: Centralized HTTP API Client wrapping `fetch` requests with JWT Bearer Headers
- **Dev Server Port**: `5173` (Proxies `/api` to Express backend)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose ODM)
- **Security**: JWT (JSON Web Tokens) for stateless auth + `bcryptjs` (12 rounds) for password hashing
- **Port**: `5000`

---

## Project Directory Structure

```text
Travel-Buddy-Finder-App/
+-- server/                          # Express + MongoDB Backend
¦   +-- middleware/
¦   ¦   +-- auth.js                  # JWT protect & adminOnly guards
¦   +-- models/
¦   ¦   +-- User.js                  # User schema with bcrypt pre-save hook
¦   ¦   +-- Trip.js                  # Trip schema (PENDING/APPROVED status)
¦   ¦   +-- Expense.js               # Shared expenses schema
¦   ¦   +-- Post.js                  # Community photo feed schema
¦   ¦   +-- ItineraryItem.js         # Group itinerary and voting schema
¦   ¦   +-- SosAlert.js              # Emergency SOS alert schema
¦   ¦   +-- ChatMessage.js           # Direct messaging schema
¦   +-- routes/
¦   ¦   +-- auth.js                  # Authentication routes (/api/auth)
¦   ¦   +-- trips.js                 # Expedition management (/api/trips)
¦   ¦   +-- users.js                 # User governance (/api/users)
¦   ¦   +-- expenses.js              # Expense tracking (/api/expenses)
¦   ¦   +-- posts.js                 # Social feed (/api/posts)
¦   ¦   +-- itinerary.js             # Activity planner (/api/itinerary)
¦   ¦   +-- sos.js                   # Emergency SOS (/api/sos)
¦   ¦   +-- chat.js                  # Direct messaging (/api/chat)
¦   +-- .env.example                 # Environment variables template
¦   +-- server.js                    # Express application entry & auto-seeder
¦   +-- package.json                 # Backend dependencies
¦
+-- src/                             # React Frontend
¦   +-- api/
¦   ¦   +-- client.js                # Centralized API client wrapping fetch calls
¦   +-- App.jsx                      # Main React application & workspace views
¦   +-- main.jsx                     # Application root entry
¦   +-- index.css                    # Global application styles
¦
+-- vite.config.js                   # Vite configuration with API proxy
+-- package.json                     # Frontend dependencies & scripts
+-- README.md                        # Project documentation
```

---

## API Endpoints Reference

All protected endpoints require the header `Authorization: Bearer <jwt_token>`.

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new traveler account, returns JWT & user object |
| `POST` | `/api/auth/login` | Public | Authenticate via email, username, or admin callsign |
| `GET` | `/api/auth/me` | Protected | Verify active JWT session and return profile |

### Trips (`/api/trips`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/trips` | User | Get all APPROVED trips (supports search & womenOnly filtering) |
| `GET` | `/api/trips/pending` | Admin | Get all PENDING trip submissions |
| `GET` | `/api/trips/all` | Admin | Get all platform trips |
| `POST` | `/api/trips` | User | Submit trip (defaults to `PENDING` status) |
| `PATCH`| `/api/trips/:id/approve` | Admin | Approve pending trip request |
| `PATCH`| `/api/trips/:id/reject` | Admin | Reject and delete trip request |
| `DELETE`| `/api/trips/:id` | Admin | Permanently delete live trip |

---

## Getting Started & Local Setup

### 1. Repository Setup & Dependencies
```bash
# Clone repository
git clone https://github.com/your-username/Travel-Buddy-Finder-App.git
cd Travel-Buddy-Finder-App

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Environment Configuration
Create a `.env` file inside the `server/` directory (you can copy `server/.env.example`):
```env
MONGO_URI=mongodb://127.0.0.1:27017/travel_buddy_finder
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:5173
```

### 3. Launching Application
In terminal 1 (Backend Server):
```bash
npm run server
```

In terminal 2 (Frontend React App):
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## Default Master Admin Credentials

The backend automatically seeds a master admin account on initial startup:
* **Email / Callsign**: `admin@travelbuddy.com` (or `admin`)
* **Password**: `admin123`

---

## License
Distributed under the MIT License. See `LICENSE` for details.
