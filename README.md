# 🎬 CineVibes

[![CI](https://github.com/dangkhoa241/cinevibes/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/dangkhoa241/cinevibes/actions/workflows/ci.yml)

CineVibes started as a class project, but it's really about something I care about a lot: movies, and the very particular way I like to talk about them. I'm the person who wants a deep-dive on a plot twist the second the credits roll, but I also don't want that twist ruined for me in someone else's comment before I've even bought a ticket.

The first version was barely more than a database — I crawled movie data from IMDb and bolted on a basic comment box, nothing more. When I showed it to my professor, he asked a question that stuck with me: what would actually make someone want to use this instead of just going to IMDb? I didn't have a good answer.

He pushed me to think about it differently. Surface newly released movies so people walking straight out of the theater can find them and start discussing right away, instead of a static catalog nobody has a reason to revisit. Split comments into two real conversations, not one — a technical, critical breakdown for people who want to analyze the craft, and a reaction space for people who just want to share how a movie made them feel, since those are genuinely different kinds of discussion. And protect the people who haven't seen it yet: without spoiler protection, someone's twist ending gets ruined in the very first comment.

I rebuilt CineVibes around those three ideas — category-based discussion threads with spoiler warnings, and a focus on trending, recently-released movies rather than a static archive. What changed for me afterward wasn't just that project; it's that I stopped asking "does this work" and started asking "why would someone actually come back" before building anything.

Try it out here: [https://cinevibes-outt.onrender.com/](https://cinevibes-rho.vercel.app/)

---

## 🚀 Features

### 🎥 Movie Browsing
- Browse movies fetched from an external API
- View movie posters, titles, and basic information

### 🧠 Structured Discussions
- Comments are split into two categories: General Chat and Technical Analysis
- Finer-grained categories (Character/Actor, Plot Twist, Script/Dialogue, Memorable Scenes) — **not implemented yet**

### 💬 Comment System
- Add comments under specific categories, with the author's username shown
- Like other users' comments
- Edit or delete your own comments

### 🤖 CineBot (AI Chat Assistant)
- Chat with an AI assistant for movie recommendations and discussion
- Automatically pulls in the current movie's details when chatting from its page
- Can search CineVibes' own movie catalog (by title, year, genre) to answer questions with real data

### ⚠️ Spoiler Protection
- Mark comments as spoilers
- Spoiler content is hidden by default and can be revealed manually

### 🔥 Trending Rankings
- Movies are ranked by overall discussion activity
- Separate daily / weekly / monthly trending breakdowns — **not implemented yet** (currently a single overall ranking)

### 🔍 Search & Filtering
- Search movies by title
- Filter by genre and release year, sort by rating, year, or trending activity

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

CI/CD:
- GitHub Actions (backend/frontend tests, lint, build, and e2e on every push/PR)

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