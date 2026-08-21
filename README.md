# 🎬 CineVibes

CineVibes is a full-stack web application designed for movie enthusiasts to explore, discuss, and share opinions about movies in a structured and spoiler-aware environment.

Try it out here: [https://cinevibes-outt.onrender.com/](https://cinevibes-rho.vercel.app/)

---

## 🚀 Features

### 🎥 Movie Browsing
- Browse movies fetched from an external API
- View movie posters, titles, and basic information

### 🧠 Structured Discussions
- Discussions are divided into categories:
  - Character / Actor
  - Plot Twist
  - Script / Dialogue
  - Memorable Scenes

### 💬 Comment System
- Add comments under specific categories
- Like and interact with other users' comments

### ⚠️ Spoiler Protection
- Mark comments as spoilers
- Spoiler content is hidden by default and can be revealed manually

### 🔥 Trending Rankings
- Discover the most discussed movies based on:
  - Daily activity
  - Weekly activity
  - Monthly activity

### 🔍 Search & Filtering
- Search movies by title
- Filter by categories or popularity

---

## 🛠️ Tech Stack

Frontend:
- React (Vite)

Backend:
- Node.js
- Express.js

Database:
- MongoDB

Testing:
- Vitest
- Playwright / Cypress

External API:
- Movie API (OMDB)

---

## ⚙️ Installation

### Prerequisites
- Node.js 18+
- A MongoDB connection string (e.g. a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)
- A free [OMDB API key](http://www.omdbapi.com/apikey.aspx)
- A free [Groq API key](https://console.groq.com/keys) (only needed for the CineBot chat assistant)

### 1. Clone the repo
```bash
git clone https://github.com/dangkhoa241/cinevibes.git
cd cinevibes
```

### 2. Backend setup
```bash
cd backend-cinevibes
npm install
```
Create a `.env` file in `backend-cinevibes/`:
```
OMDB_API_KEY=your_omdb_key
MONGODB_URI=your_mongodb_connection_string
PORT=8000
SECRET=any_random_string_for_jwt
GROQ_API_KEY=your_groq_key
```
Start the API:
```bash
npm run dev
```

### 3. Frontend setup
In a separate terminal:
```bash
cd frontend-cinevibes
npm install
npm run dev
```
The app is now available at http://localhost:5173, proxying API calls to the backend on port 8000.

### 4. (Optional) Seed the movie database
```bash
cd backend-cinevibes
node seedDatabase.js
```

### 5. Running tests
```bash
# Backend unit/integration tests
cd backend-cinevibes && npm test

# Frontend component tests
cd frontend-cinevibes && npm test

# End-to-end tests (spins up both dev servers automatically)
cd e2e && npm install && npm test
```

---

## 👥 Team Members

- Khoa Tran  
- Darshana Prafulla Patil  
