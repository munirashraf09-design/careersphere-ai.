# CareerSphere AI (core build)
## Setup (Windows)
1. `cd server && npm install && copy .env.example .env` — then put your key from https://aistudio.google.com/apikey in `.env` as GEMINI_API_KEY.
2. `npm start` (http://localhost:3001)
3. New terminal: `cd client && npm install && npm run dev` (http://localhost:5173)

## Gemini flow
Browser -> POST /api/chat (validated, rate-limited) -> server adds system instruction -> Gemini via @google/genai -> reply -> rendered as Markdown. The key never reaches the browser; failures show an error with Retry.

## Implemented
Landing, career explorer (search/filter/detail, Ask AI), courses (official links), 15-question aptitude test, Gemini chatbot.
## Not implemented (yet)
Login/profile, dashboard, scholarships, placements, admin, MongoDB (data is in server/data.js and is SAMPLE data), seed script.
## Testing
Not run in the build environment (no network). Run it locally and test missing-key (503), bad input (400), and rate-limit (429) cases.
