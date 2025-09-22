# 🚀 Collaborative LLM Chat Backend

This project is a **FastAPI + SQLite** backend for a collaborative chat application.
Multiple users can join the same chatroom, interact with each other, and chat with an **AI bot (Gemini)** as if it's another participant.

The backend provides **authentication, room management, real-time messaging, and AI bot integration**.

---

## 📌 Tech Stack

- **FastAPI** (web framework)
- **SQLAlchemy + Alembic** (ORM + migrations)
- **SQLite** (database - easily portable to Postgres)
- **JWT (PyJWT)** for authentication
- **Passlib + bcrypt** for password hashing
- **WebSockets** for real-time messaging
- **OpenAI SDK** for Gemini API integration
- **Asyncio** for concurrent bot message processing

---

## 🗂 Current Project Structure

```
backend/
│── alembic.ini              # Alembic configuration
│── main.py                  # FastAPI app entrypoint
│── requirements.txt         # Python dependencies
│── create_bot_user.py       # Script to create system bot user
│── test_websocket_room.py   # WebSocket testing script
│── chatapp.db              # SQLite database
│
├── alembic/                # Database migrations
│   ├── versions/           # Migration files
│   └── env.py
│
├── app/                    # Main application code
│   │── db.py              # Database configuration
│   │
│   ├── models/            # SQLAlchemy models
│   │   ├── base.py        # Base model class
│   │   ├── user.py        # User model
│   │   ├── rooms.py       # Room model
│   │   ├── user_room.py   # User-Room relationship (many-to-many)
│   │   └── messages.py    # Message model
│   │
│   ├── routes/            # API endpoints
│   │   ├── auth.py        # Authentication (login/signup)
│   │   ├── room.py        # Room management
│   │   ├── messages.py    # Message sending/retrieving
│   │   └── msg_socket.py  # WebSocket connections
│   │
│   └── utils/             # Utility functions
│       ├── auth_utils.py  # JWT & password utilities
│       └── bot_utils.py   # Bot user management
│
└── llm/                   # AI Bot integration
    ├── llm_queue.py       # Worker queue for bot processing
    └── command_message_queue.py  # Gemini API integration
```

---

## ✅ Implemented Features

### **🔐 Authentication System**
- User registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Protected routes with Bearer token auth

**API Endpoints:**
- `POST /auth/signup` - Register new user
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user info

### **🏠 Room Management**
- Create and join chat rooms
- Room-based access control
- Unique room codes for easy sharing
- Per-room API key management for bot integration

**API Endpoints:**
- `POST /create_room` - Create new chat room
- `POST /rooms/{room_code}/join` - Join existing room
- `GET /rooms/{room_code}` - Get room details and members

### **💬 Real-time Messaging**
- Send and retrieve messages
- Message type classification (text, command, bot)
- Real-time WebSocket connections
- Message history with timestamps

**API Endpoints:**
- `POST /room/{room_code}/send_message` - Send message
- `GET /room/{room_code}/messages` - Get message history
- `WS /ws/room/{room_code}` - WebSocket for real-time updates

### **🤖 AI Bot Integration**
- Gemini AI bot responds to @bot commands
- Automatic bot user creation
- Bot automatically joins all rooms
- Concurrent message processing with room-level locking
- Streaming responses via WebSocket
- Per-room API key support

**Bot Features:**
- Command trigger: Send `@bot your question` 
- Automatic response generation via Gemini API
- Bot messages stored in database with `message_type="bot"`
- Real-time streaming of bot responses
- Queue-based processing to handle multiple users

### **📊 Database Models**
- **User**: Authentication and user info
- **Room**: Chat room with API key
- **UserRoom**: Many-to-many user-room membership with roles (owner, participant, bot)
- **Message**: All messages with type classification and processing status

---

## 🚀 How to Run

### **Prerequisites**
- Python 3.11+
- Virtual environment (recommended)

### **Setup Steps**

1. **Clone and navigate**
   ```bash
   git clone <repo-url>
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize database**
   ```bash
   alembic upgrade head
   ```

5. **Create bot user**
   ```bash
   python create_bot_user.py
   ```

6. **Start server**
   ```bash
   uvicorn main:app --reload
   ```

7. **Access API documentation**
   - FastAPI Docs: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

---

## 🧪 Testing

### **API Testing**
Use the FastAPI auto-generated docs at `http://localhost:8000/docs` or tools like Postman.

### **WebSocket Testing**
Run the included WebSocket test client:
```bash
python test_websocket_room.py
```

### **Bot Testing**
1. Create a room with a valid Gemini API key
2. Join the room
3. Send a message: `@bot Hello, how are you?`
4. Watch the real-time bot response

---

## 🔧 Configuration

### **Environment Variables**
- Update `SECRET_KEY` in `app/utils/auth_utils.py` for production
- Set Gemini API keys per room when creating rooms

### **Database Migration**
```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head
```

---

## 📋 API Reference

### **Authentication**
```bash
# Register
POST /auth/signup
{
  "username": "testuser",
  "password": "password123"
}

# Login
POST /auth/login
{
  "username": "testuser", 
  "password": "password123"
}
```

### **Room Management**
```bash
# Create room
POST /create_room
Headers: Authorization: Bearer <jwt_token>
{
  "name": "My Chat Room",
  "api_key": "your_gemini_api_key"
}

# Join room
POST /rooms/{room_code}/join
Headers: Authorization: Bearer <jwt_token>
```

### **Messaging**
```bash
# Send message
POST /room/{room_code}/send_message
Headers: Authorization: Bearer <jwt_token>
{
  "content": "Hello everyone!"
}

# Send bot command
POST /room/{room_code}/send_message
Headers: Authorization: Bearer <jwt_token>
{
  "content": "@bot What is the weather like today?"
}
```

---

## 🔮 Future Enhancements

- **File sharing** in chat rooms
- **Message reactions** and threading
- **User presence** indicators
- **Message search** functionality
- **Room moderation** features
- **PostgreSQL** migration for production
- **Docker** containerization
- **Rate limiting** and spam protection
- **Message encryption** for privacy

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

## 📄 License

This project is open source. See LICENSE file for details.

---

🎉 **Ready to chat with AI!** Create a room, invite friends, and start collaborative conversations with Gemini AI.