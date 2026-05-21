# RoomieMatch — Student Roommate Finder (Manipal University Jaipur)
**Status:** Pre-development plan. Decisions locked — ready to build.

---

## What We're Building
A webapp for MUJ students to find compatible roommates. Browse a filterable list + a "Recommended" tab, open a Diary-of-a-Wimpy-Kid-style A4 profile card, and connect via visible contact info. No swipes, no in-app chat.

---

## Decisions Locked
| Question | Decision |
|---|---|
| Auth | Google OAuth, any Google account (not restricted to college domain) |
| College scope | Manipal University Jaipur only (single-tenant) |
| Contact info | Visible to all logged-in users — no handshake needed |
| Avatar | Default illustrated avatar OR user uploads their own photo |
| Interests | Fixed chip set (defined below) |
| Connections table | Not needed for v1 — contact is open |

---

## Design Direction — Diary of a Wimpy Kid Aesthetic
- **Background:** Off-white / aged paper (`#F5F0E8`)
- **Font:** `Caveat` or `Patrick Hand` (Google Fonts) — handwritten feel
- **Borders/Cards:** Ruled notebook lines, slightly wobbly sketch-style box shadows
- **Colors (minimal palette):**
  - Paper white: `#F5F0E8`
  - Ink black: `#1A1A1A`
  - Pencil grey: `#9E9E9E`
  - Red accent (pen correction): `#D94F4F`
  - Ruled line blue: `#B8D4E8`
- **Profile card:** Looks like a filled-in A4 notebook page. Fields are underlined blanks ("Name: ______"), interests are stamped/circled chips, avatar is in a doodled polaroid-style box.
- **Navigation:** Minimal top bar styled like a notebook header strip.

---

## Tech Stack
| Layer | Choice |
|---|---|
| Frontend | React + Vite + TailwindCSS + TypeScript |
| Backend | FastAPI (Python 3.11+) |
| Database | PostgreSQL 15 |
| Auth | Google OAuth 2.0 → JWT (httpOnly cookie) |
| ORM | SQLAlchemy (async) + Alembic |
| File storage | Local `/uploads` in dev; swap to S3/Cloudflare R2 in prod |
| Dev orchestration | Docker Compose (postgres + backend + frontend) |

---

## Data Model

### `users` table
```
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
google_id       TEXT UNIQUE NOT NULL
email           TEXT UNIQUE NOT NULL
name            TEXT NOT NULL
avatar_url      TEXT                        -- path to uploaded file or default
year            SMALLINT CHECK (year IN (1,2,3,4))
branch          TEXT                        -- from fixed list
hometown        TEXT
veg_nonveg      TEXT CHECK (veg_nonveg IN ('veg','non_veg','both'))
interests       TEXT[]                      -- subset of fixed interest list
contact_info    TEXT NOT NULL               -- WhatsApp number or email
bio             TEXT
is_looking      BOOLEAN DEFAULT TRUE
profile_complete BOOLEAN DEFAULT FALSE      -- gates /setup redirect
created_at      TIMESTAMPTZ DEFAULT NOW()
```

### Fixed Branch List (MUJ)
CSE, ECE, EEE, ME, CE, BBA, MBA, BCA, MCA, B.Pharm, B.Arch, Design, Law, Other

### Fixed Interests List
Gaming, Music, Football, Cricket, Basketball, Badminton, Gym/Fitness, Art & Design, Movies, Travel, Cooking, Reading, Photography, Dance, Other

---

## Features

### Auth Flow
1. Landing page → "Sign in with Google" button
2. Google OAuth redirect → `/auth/callback` → backend validates token
3. Backend: if new user, create record with `profile_complete = false` → return JWT
4. Frontend: if `profile_complete = false` → redirect to `/setup`
5. Subsequent logins → go straight to `/browse`

### Profile Setup (`/setup`)
Styled as a notebook intake form. Fields:
- Year (radio chips: 1st / 2nd / 3rd / 4th)
- Branch (dropdown)
- Hometown (text input)
- Veg / Non-veg / Both (radio chips)
- Interests (multi-select chips from fixed list, pick up to 6)
- Contact info (text — WhatsApp number or email, required)
- Bio (textarea, max 200 chars, optional)
- Avatar upload (drag/drop or click; if skipped → default illustrated avatar assigned)

### Browse Page (`/browse`) — Two Tabs

#### Tab 1: Browse (default)
- Grid of thumbnail profile cards
- Filter bar (collapsible on mobile):
  - Year (multi-select)
  - Branch (multi-select)
  - Veg/Non-veg
  - Hometown (text search)
  - Interests (multi-select chips)
- Default: only `is_looking = true` users, excluding yourself
- Each thumbnail card shows: avatar, name, year, branch, hometown, 2–3 interest chips

#### Tab 2: Recommended
- Same card grid but pre-filtered and **ranked by compatibility score**
- Score calculated server-side:
  - +3 pts — same year
  - +3 pts — same branch
  - +2 pts — same veg/non-veg preference
  - +1 pt per shared interest (max +5)
  - +1 pt — same hometown
- Top 20 results shown, sorted descending by score
- Small "X% match" badge on each card (score / max_possible * 100)
- No manual filters on this tab — it's purely algorithmic

### Profile Card (`/profile/:id`)
Full-page A4 notebook layout:
- Polaroid-style avatar box (top right, doodled border)
- Underline-blank fields: Name, Year, Branch, Hometown, Veg preference
- Interest chips displayed as circled/stamped bubbles
- Bio in a "notes" section (lined area)
- Contact info shown directly (WhatsApp icon or email icon)
- "← Back" button styled as a notebook tab

### My Profile (`/me`)
- Same A4 card view but with an "Edit" button
- Edit mode turns all fields into inputs in-place
- Toggle: "I'm looking for a roommate" (on/off switch)

---

## Page Routes
```
/                   Landing (sign in CTA)
/auth/callback      OAuth callback (no UI, redirects after)
/setup              Profile setup — guarded: redirect here if profile_complete=false
/browse             Browse + Recommended tabs (auth required)
/profile/:id        Full A4 card view (auth required)
/me                 Own profile view + edit (auth required)
```

---

## API Endpoints

```
POST   /auth/google              Body: { id_token } → { jwt, user }
GET    /users/me                 → own profile
PUT    /users/me                 → update profile (multipart for avatar upload)
GET    /users                    → filtered browse list
                                   query: year, branch, veg_nonveg, hometown, interests
GET    /users/recommended        → ranked list for current user (auth required)
GET    /users/{id}               → single user public profile (auth required)
POST   /uploads/avatar           → avatar image upload → returns avatar_url
```

---

## Avatar Logic
- On setup, user can upload a photo (JPEG/PNG, max 2MB)
- If skipped → generated initials avatar: circle filled with a color derived from name hash, initials in white `Caveat` font (e.g. "Aryan Mehta" → "AM")
- No image file needed for default — rendered entirely in CSS/SVG on the frontend
- Uploaded photos stored in `backend/uploads/avatars/` in dev, served via `/static/avatars/`

---

## Folder Structure
```
/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py           (env vars via pydantic-settings)
│   │   ├── database.py         (async engine + session)
│   │   ├── models.py           (SQLAlchemy ORM)
│   │   ├── schemas.py          (Pydantic request/response)
│   │   ├── auth.py             (Google OAuth + JWT helpers)
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   └── uploads.py
│   │   └── recommender.py      (scoring logic)
│   ├── alembic/
│   ├── uploads/
│   │   └── avatars/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.tsx
│   │   │   ├── Setup.tsx
│   │   │   ├── Browse.tsx      (tabs: Browse + Recommended)
│   │   │   ├── ProfileCard.tsx
│   │   │   └── MyProfile.tsx
│   │   ├── components/
│   │   │   ├── ThumbnailCard.tsx
│   │   │   ├── A4Card.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   ├── InterestChip.tsx
│   │   │   └── AvatarUpload.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── api/
│   │   │   └── client.ts       (axios + JWT interceptor)
│   │   └── styles/
│   │       └── theme.ts        (Tailwind color tokens)
│   ├── public/
│   │   └── avatars/            (default avatar illustrations)
│   ├── tailwind.config.ts
│   └── vite.config.ts
├── PLAN.md
└── docker-compose.yml
```

---

## Build Order
1. **Docker Compose** — Postgres + FastAPI + Vite containers wired up
2. **DB schema** — Alembic initial migration
3. **Backend: Auth** — Google OAuth token validation, JWT issue, `/auth/google`
4. **Backend: Users** — `/users/me` GET+PUT, `/users` browse with filters, `/users/{id}`
5. **Backend: Recommender** — scoring logic, `/users/recommended`
6. **Backend: Uploads** — avatar upload endpoint, static file serving
7. **Frontend: Auth flow** — Landing → Google sign-in → callback → setup redirect
8. **Frontend: Setup page** — form with all fields + avatar upload
9. **Frontend: Browse page** — thumbnail grid + filter bar + tabs
10. **Frontend: Profile card** — A4 notebook layout modal/page
11. **Frontend: My Profile** — view + edit own card
12. **Styling pass** — Wimpy Kid theme applied consistently
13. **Polish** — match % badge, transitions, mobile responsiveness

---

## All Decisions Locked
Plan is complete. Ready to build.
