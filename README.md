# ?? Travel Buddy Finder App (Full Stack MERN)

> Safe, social, and admin-governed travel companion platform  
> Built with **React 18 + Vite (Frontend)** and **Node.js + Express + MongoDB + JWT (Backend)**.

---

## ?? Table of Contents

1. [Project Overview](#-project-overview)
2. [Tech Stack](#-tech-stack)
3. [Project File Structure](#-project-file-structure)
4. [Backend Architecture & API Endpoints](#-backend-architecture--api-endpoints)
5. [Database Models (MongoDB)](#-database-models-mongodb)
6. [Security Architecture](#-security-architecture)
7. [Step-by-Step Setup & How to Run](#-step-by-step-setup--how-to-run)
8. [Configuring MongoDB](#-configuring-mongodb)
9. [Admin Credentials](#-admin-credentials)

---

## ?? Project Overview

Travel Buddy Finder is a full-stack platform designed to connect travelers safely and coordinate group expeditions:

- **Travelers** can explore admin-approved trips, match with travel buddies, plan itineraries, track expenses, post travel updates, chat with admin, and dispatch emergency SOS alerts.
- **Admins** have an isolated control console to review and approve/reject trips, send activity guidance via chat, govern user accounts (suspend/verify/delete), and monitor SOS emergencies.

---

## ?? Tech Stack

### Frontend
- **Framework**: React 18 (JSX)
- **Build Tool**: Vite 5
- **Icons**: Lucide React
- **Client Networking**: Centralized `fetch` API Client with JWT Bearer auth
- **Port**: `http://localhost:5173`

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens) + bcryptjs (12 salt rounds)
- **Port**: `http://localhost:5000`

---

## ?? Project File Structure

```
Travel Buddy Finder App/
¦
+-- server/                          ? ?? Node.js + Express + MongoDB Backend
¦   +-- server.js                    ? Express server entry point & admin seeder
¦   +-- package.json                 ? Backend dependencies
¦   +-- .env                         ? MongoDB URI, JWT Secret, Port
¦   +-- middleware/
¦   ¦   +-- auth.js                  ? JWT protect & adminOnly guards
¦   +-- models/
¦   ¦   +-- User.js                  ? User schema with bcrypt pre-save hook
¦   ¦   +-- Trip.js                  ? Trip schema (PENDING/APPROVED status)
¦   ¦   +-- Expense.js               ? Shared expenses schema
¦   ¦   +-- Post.js                  ? Community photo feed schema
¦   ¦   +-- ItineraryItem.js         ? Shared itinerary and voting schema
¦   ¦   +-- SosAlert.js              ? Emergency SOS alert schema
¦   ¦   +-- ChatMessage.js           ? Admin ? User guidance chat schema
¦   +-- routes/
¦       +-- auth.js                  ? /api/auth (register, login, me)
¦       +-- trips.js                 ? /api/trips (CRUD + approve/reject)
¦       +-- users.js                 ? /api/users (CRUD + status/verify)
¦       +-- expenses.js              ? /api/expenses (CRUD)
¦       +-- posts.js                 ? /api/posts (CRUD + likes)
¦       +-- itinerary.js             ? /api/itinerary (CRUD + upvoting)
¦       +-- sos.js                   ? /api/sos (trigger + resolve)
¦       +-- chat.js                  ? /api/chat (send & retrieve threads)
¦
+-- src/                             ? ?? React Frontend
¦   +-- api/
¦   ¦   +-- client.js                ? API Client wrapping all HTTP requests
¦   +-- App.jsx                      ? Main Application UI & Workflow
¦   +-- main.jsx                     ? React Root Mount
¦   +-- index.css                    ? Global Styles
¦
+-- vite.config.js                   ? Vite dev server & /api proxy configuration
+-- package.json                     ? Frontend dependencies & scripts
+-- README.md                        ? Complete documentation
+-- dist/                            ? Production build directory
```

---

## ?? Backend Architecture & API Endpoints

All protected endpoints require the header `Authorization: Bearer <jwt_token>`.

### ?? Auth (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user, returns JWT & user object |
| `POST` | `/api/auth/login` | Public | Login with email/callsign & password |
| `GET` | `/api/auth/me` | Protected | Fetch current user profile from token |

### ?? Trips (`/api/trips`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/trips` | User | Get all APPROVED trips (supports `search` & `womenOnly` queries) |
| `GET` | `/api/trips/pending` | Admin | Get all PENDING trip submissions |
| `GET` | `/api/trips/all` | Admin | Get all trips in the database |
| `GET` | `/api/trips/mine` | User | Get current user's submitted trips |
| `POST` | `/api/trips` | User | Create a trip (defaults to `PENDING` approval) |
| `PATCH`| `/api/trips/:id/approve` | Admin | Approve trip for public feed |
| `PATCH`| `/api/trips/:id/reject` | Admin | Reject & remove trip |
| `DELETE`| `/api/trips/:id` | Admin | Delete any trip |

### ?? Users (`/api/users`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/users` | Admin | Get all registered users |
| `GET` | `/api/users/travelers` | User | Get active users for buddy matching |
| `PATCH`| `/api/users/:id` | User/Admin | Update user profile |
| `PATCH`| `/api/users/:id/status` | Admin | Suspend or Activate user account |
| `PATCH`| `/api/users/:id/verify` | Admin | Toggle verified badge |
| `DELETE`| `/api/users/:id` | Admin | Delete user account |

### ?? Chat, SOS, Social, Expenses & Itinerary
- **Chat (`/api/chat`)**: Send messages between travelers and admin, view message history.
- **SOS (`/api/sos`)**: Dispatch emergency alerts with live coordinates and contact info; admin can mark alerts resolved.
- **Posts (`/api/posts`)**: Post travel stories, like posts, delete posts.
- **Expenses (`/api/expenses`)**: Record shared expenses, calculate per-person budget splits.
- **Itinerary (`/api/itinerary`)**: Add activities, vote on group activities.

---

## ??? Security Architecture

1. **Password Hashing (bcrypt)**:
   - Passwords are salt-hashed (12 rounds) on the backend before writing to MongoDB.
   - Plaintext passwords are never saved or returned in API responses.
2. **Stateless JWT Authentication**:
   - On successful login, the server issues a signed JWT token valid for 7 days.
   - Token is verified on each API request by the `protect` middleware.
3. **Role-Based Access Control (RBAC)**:
   - Admin-only routes are secured with `adminOnly` middleware verifying `req.user.role === 'admin'`.
4. **Admin Protection**:
   - The master admin account cannot be suspended or deleted.
5. **CORS & Input Validation**:
   - CORS is restricted to frontend development origins.
   - User inputs are trimmed and validated on the backend.

---

## ?? Step-by-Step Setup & How to Run

### 1. Install Dependencies
In the project root folder:
```powershell
# Install frontend packages
npm install

# Install backend packages
cd server
npm install
cd ..
```

### 2. Configure MongoDB
Open `server/.env` and verify the `MONGO_URI`. (See [Configuring MongoDB](#-configuring-mongodb) below).

### 3. Start the Backend Server
In one terminal window:
```powershell
npm run server
# or: cd server && npm start
```
*Backend runs at `http://localhost:5000`*

### 4. Start the Frontend Dev Server
In a second terminal window:
```powershell
npm run dev
```
*Frontend runs at `http://localhost:5173`*

---

## ?? Configuring MongoDB

You can connect to **MongoDB Atlas (Free Cloud Database)** or a **Local MongoDB instance**:

### Option A: MongoDB Atlas (Recommended - No installation required)
1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 Shared Cluster**.
3. Under **Database Access**, create a user (e.g., `appUser` and password).
4. Under **Network Access**, add IP `0.0.0.0/0` (Allow Access from Anywhere).
5. Click **Connect** ? **Drivers** ? Copy your connection string.
6. Paste it into [`server/.env`](file:///c:/Users/ASUS/OneDrive/Desktop/Travel%20Buddy%20Finder%20App/server/.env):
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/travel_buddy_finder?retryWrites=true&w=majority
   ```

### Option B: Local MongoDB
If you install [MongoDB Community Server](https://www.mongodb.com/try/download/community) locally:
```env
MONGO_URI=mongodb://127.0.0.1:27017/travel_buddy_finder
```

---

## ?? Admin Credentials

The backend automatically creates the initial Master Admin account on first startup:

| Field | Value |
|---|---|
| **Email / Callsign** | `admin@travelbuddy.com` (or simply `admin`) |
| **Password** | `admin123` |

---

<p align="center">Travel Buddy Finder • Built with React, Node.js, Express & MongoDB</p>
