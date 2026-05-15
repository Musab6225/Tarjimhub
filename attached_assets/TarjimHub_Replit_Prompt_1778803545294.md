# TarjimHub — Full App Prompt for Replit AI Agent

Paste this entire prompt into Replit's AI agent to generate the full app.

---

## PROMPT START — COPY EVERYTHING BELOW THIS LINE

Build a full-stack web application called **TarjimHub** (ترجيم هاب) — a professional platform for Arabic interpreters. The app must be bilingual (English + Arabic) with full RTL support for Arabic text.

---

## TECH STACK

- **Frontend**: React + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: Replit DB (key-value) or PostgreSQL if available
- **Auth**: Email/password sign up and sign in with JWT tokens
- **AI**: Anthropic Claude API (claude-sonnet-4-20250514) for the glossary feature
- **Payments**: Stripe (add placeholder, not required to activate)

---

## COLOR SCHEME & DESIGN

Primary color: #1D9E75 (teal green)
Background: clean white / light gray
Font: Inter or system sans-serif
Style: Clean, modern, professional. Similar feel to LinkedIn but warmer.
Mobile-first responsive design.
Support both LTR (English) and RTL (Arabic) layouts.

---

## PAGES & FEATURES

### 1. AUTH PAGES
- Sign up page: name, email, password, role (Interpreter / Client), primary language pair, dialect specialty
- Sign in page
- User profile stored in database

### 2. DASHBOARD (after login)
- Welcome message in English and Arabic
- Quick access cards to: Glossary, Tools, Jobs, Feed, Messages
- Stats: sessions completed, jobs applied, connections

### 3. AI GLOSSARY PAGE
This is the core feature. Build it as follows:

- Text input where user types any term in English or Arabic
- On submit, call the Anthropic Claude API with this system prompt:

```
You are an expert Arabic linguistics assistant specializing in dialect variations. 
When given a term, return a JSON object with the term translated and explained in 5 Arabic dialects: 
Egyptian, Levantine, Gulf, Moroccan, and Sudanese. 
For each dialect include:
- "dialect": dialect name in English
- "dialectAr": dialect name in Arabic
- "term": the term as used in that dialect (transliterated)
- "arabic": the term written in Arabic script
- "note": any important usage note (max 10 words)
Return ONLY valid JSON, no explanation, no markdown. Format:
{"results": [{"dialect":"","dialectAr":"","term":"","arabic":"","note":""}]}
```

- Display results as 5 cards, one per dialect, showing the Arabic script prominently
- Add a "Save to my glossary" button on each result
- Add a search history sidebar showing last 20 lookups
- Add category filters: Medical, Legal, Social Services, Mental Health, General

### 4. INTERPRETER TOOLS PAGE
Three mode tabs: Over The Phone (OTP), Video, In-Person

Each mode shows relevant tools:

**All modes:**
- Session timer (start/pause/reset) with elapsed time display
- Quick notes textarea (auto-saves to localStorage)
- Quick phrases panel (common interpreter phrases in EN + AR)

**OTP mode extras:**
- Mute reminder button
- Call log (start time, duration, language pair, notes)

**Video mode extras:**
- Screen share reminder checklist
- Virtual background tips

**In-person mode extras:**
- Seating arrangement diagram (interpreter positioning)
- Loud/clear speech reminder

**Quick Phrases panel** (preloaded with):
- "Please speak slowly" / "تكلم ببطء من فضلك"
- "I need to clarify something" / "أحتاج أن أوضح شيئاً"
- "Could you repeat that?" / "ممكن تعيد ذلك؟"
- "I am the interpreter, not a party to this conversation" / "أنا المترجم، لست طرفاً في هذه المحادثة"
- "Please address the client directly" / "تكلم مع العميل مباشرةً"
- Add more phrase button (user can add custom phrases)

### 5. JOB BOARD PAGE

**For Interpreters:**
- List of job postings with: title, client name, rate, language pair, mode (OTP/video/in-person), location, urgency tag
- Filter by: language pair, mode, specialty, remote/in-person
- Apply button → sends application stored in DB
- Saved jobs list

**For Clients:**
- Post a job form: title, description, language pair needed, dialect preference, mode, rate offered, urgency
- View applications received
- Hire button

### 6. COMMUNITY FEED PAGE
- Social feed similar to LinkedIn
- Users can post text updates, tips, questions
- Like and comment on posts
- Follow other interpreters
- Posts tagged by specialty (Medical, Legal, etc.)
- Trending topics sidebar
- Bilingual posts supported (EN + AR)

### 7. MESSAGING PAGE
- Direct messaging between users
- Conversation list on left, chat window on right
- Real-time feel (can use polling every 3 seconds if no websockets)
- Messages stored in database
- Show online status

### 8. PROFILE PAGE
- Profile photo (initials avatar if no photo)
- Name in English and Arabic
- Bio
- Language pairs and dialect specialties (tags)
- Certifications / experience
- Stats: sessions, ratings, reviews
- Edit profile button
- Public profile URL: tarjimhub.com/username

---

## DATABASE SCHEMA

Tables / keys needed:
- users: id, name, email, passwordHash, role, languagePairs, dialects, bio, createdAt
- glossary_saves: id, userId, term, results (JSON), category, savedAt
- jobs: id, clientId, title, description, languagePair, dialect, mode, rate, urgent, status, createdAt
- applications: id, jobId, interpreterId, message, status, appliedAt
- posts: id, userId, content, contentAr, likes, createdAt
- comments: id, postId, userId, content, createdAt
- messages: id, senderId, receiverId, content, sentAt, read
- follows: followerId, followingId

---

## API ROUTES NEEDED

```
POST /api/auth/register
POST /api/auth/login
GET  /api/user/:id
PUT  /api/user/:id

POST /api/glossary/lookup   ← calls Claude API
POST /api/glossary/save
GET  /api/glossary/history/:userId

GET  /api/jobs
POST /api/jobs
POST /api/jobs/:id/apply
GET  /api/jobs/:id/applications

GET  /api/feed
POST /api/feed/post
POST /api/feed/post/:id/like
POST /api/feed/post/:id/comment

GET  /api/messages/:userId
POST /api/messages/send
```

---

## ENVIRONMENT VARIABLES NEEDED

```
ANTHROPIC_API_KEY=your_key_here
JWT_SECRET=your_secret_here
DATABASE_URL=your_db_url (if using postgres)
```

---

## IMPORTANT NOTES FOR REPLIT

1. Store the Anthropic API key in Replit Secrets, never in code
2. The glossary API call must be server-side only (never expose API key to frontend)
3. Make the app fully functional on mobile
4. Add loading states on all AI calls
5. Handle API errors gracefully with user-friendly messages in both English and Arabic
6. Default language toggle in the top navbar (EN / عربي)
7. When Arabic is selected, flip the entire layout to RTL

---

## LAUNCH CHECKLIST

After generating, make sure:
- [ ] User can sign up and sign in
- [ ] Glossary works with Claude API
- [ ] Job board shows and accepts postings
- [ ] Feed shows and accepts posts
- [ ] Timer works in tools section
- [ ] App works on mobile
- [ ] Arabic/English toggle works

## PROMPT END
