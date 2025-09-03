# 🚀 Collaborative LLM Chat Backend (Roadmap)

This project is a **FastAPI + SQLite (migratable to Postgres)** backend for a collaborative chat application.
Multiple users can join the same chatroom, interact with each other, and chat with an LLM bot as if it’s another participant.

The backend provides **authentication, room management, and chat features**.

---

## 📌 Tech Stack

- **FastAPI** (web framework)
- **SQLAlchemy + Alembic** (ORM + migrations)
- **SQLite** (dev DB, easily portable to Postgres later)
- **JWT (pyjwt)** for authentication
- **Passlib** for password hashing
- **WebSockets** (for realtime messaging in later phases)

---

## 🗂 Folder Structure

```
backend/
│── alembic.ini
│── main.py                # Entrypoint (FastAPI app)
│
├── alembic/               # Alembic migrations
│   ├── versions/
│   └── env.py
│
└── app/
    │── __init__.py
    │── config.py
    │── database.py
    │
    ├── models/
    │   └── user.py
    │
    ├── schemas/
    │   └── user.py
    │
    ├── routes/
    │   └── auth.py
    │
    └── utils/
        └── auth_utils.py
```

---

## 🛠 Roadmap (Phases)

### **Phase 1 — Setup & Auth**

Goal: Build a minimal backend with user authentication.

- [] Setup FastAPI project structure (`app/`, `routes/`, `models/`, etc.)
- [] Configure SQLite with SQLAlchemy + Alembic migrations
- [ ] Create `User` model (id, username, email, hashed_password, created_at)
- [ ] Implement authentication system:

  - `POST /auth/register`
  - `POST /auth/login`
  - `GET /auth/me` (protected route)

- [ ] JWT-based auth (using `pyjwt`)
- [ ] Password hashing (`passlib`)

✅ Deliverable: Secure login system with JWT.

---

### **Phase 2 — Room Management**

Goal: Users can create and join chatrooms.

- [ ] Create `Room` model (id, name, created_by, created_at)
- [ ] Create `UserRoom` mapping table (many-to-many between users & rooms)
- [ ] Routes:

  - `POST /rooms/create` → create new room
  - `POST /rooms/join/{room_id}` → join a room
  - `GET /rooms/{room_id}` → get room details + participants

- [ ] Add **auth guard** (only logged-in users can join/create rooms)

✅ Deliverable: Users can create and join chatrooms.

---

### **Phase 3 — Chat Basics**

Goal: Store and retrieve messages in rooms.

- [ ] Create `Message` model (id, user_id, room_id, content, created_at)
- [ ] Routes:

  - `POST /messages/send` → send a message
  - `GET /messages/{room_id}` → fetch message history for a room

- [ ] Restrict messages to users **inside the room**

✅ Deliverable: Chatrooms work with message history.

---

### **Phase 4 — Realtime Chat (WebSockets)**

Goal: Users see messages in realtime.

- [ ] Add WebSocket endpoint (`/ws/{room_id}`)
- [ ] Broadcast messages to all connected users in a room
- [ ] Handle concurrent users safely

✅ Deliverable: Basic chat app with realtime updates.

---

### **Phase 5 — LLM Bot Integration**

Goal: Add an LLM bot as a participant in chatrooms.

- [ ] Treat the bot as a **special user** (`User` with role `bot`)
- [ ] When triggered, bot responds to messages
- [ ] Queue requests so only **one message is processed at a time** per room
- [ ] Store bot replies in `Message` table just like normal users

✅ Deliverable: Collaborative chat with a bot.

---

### **Phase 6 — Polish & Extras**

Goal: Improve quality, not just features.

- [ ] Dockerize app (optional)
- [ ] Replace SQLite with Postgres (production-ready)
- [ ] Add logging & monitoring
- [ ] Add simple rate limiting (avoid spam)
- [ ] Add tests (pytest)

---

## 🚀 How to Run

1. Clone repo

   ```bash
   git clone <repo-url>
   cd backend
   ```

2. Install dependencies

   ```bash
   pip install -r requirements.txt
   ```

3. Initialize Alembic migrations

   ```bash
   alembic init alembic
   alembic revision --autogenerate -m "init"
   alembic upgrade head
   ```

4. Start server

   ```bash
   uvicorn main:app --reload
   ```

5. API available at → `http://localhost:8000/docs`

---

🔥 That’s the full roadmap.
Phase 1 = authentication, Phase 2 = rooms, Phase 3 = chat, Phase 4 = realtime, Phase 5 = bot, Phase 6 = polish.
