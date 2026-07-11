# StudyAI

StudyAI is an intelligent, AI-powered Smart Study Companion designed to transform static study materials (PDFs, DOCX, TXT) into personalized, interactive learning experiences.

By leveraging cutting-edge LLMs (Groq) and modern web architectures, StudyAI automates the creation of summaries, adaptive flashcards, intelligent quizzes, and personalized study schedules.

---

## 🚀 Features

- **Document Processing**: Upload lecture notes or textbooks (up to 10MB) and extract structured insights instantly.
- **AI Summarization**: Generates highly accurate, section-by-section summaries.
- **Adaptive Flashcards**: Converts your material into interactive 3D flashcards. Uses a spaced-repetition UI allowing you to mark cards as "Known" or "Needs Revision".
- **Dynamic Quizzes**: Automatically constructs graded assessments featuring Multiple Choice, True/False, and Short Answer formats.
- **Smart Study Planner**: Generates a tailored 7-day study schedule based on your weak topics and historical performance.
- **Analytics Dashboard**: Visualizes your learning velocity, total study hours, and quiz mastery using `Recharts`, paired with actionable AI coaching insights.
- **Enterprise Security**: Production-ready implementation with strict HTTP headers, AI prompt limits, frontend code splitting, and file MIME validation.

---

## 🛠️ Architecture

The application follows a decoupled Client-Server architecture.

### Frontend
- **Framework**: React 18 + Vite (TypeScript)
- **Routing**: React Router DOM (with Lazy Loading / Suspense boundaries)
- **Styling**: Tailwind CSS & Lucide React Icons
- **Data Viz**: Recharts
- **Authentication**: Firebase Auth Context

### Backend
- **Framework**: Python 3 (Flask)
- **LLM Engine**: Groq API (`llama-3.3-70b-versatile`)
- **Database**: Local JSON Data Layer (extensible to Firestore/MongoDB)
- **Architecture**: Modular Blueprints (Auth, Materials, AI, Planner, Analytics)

---

## ⚙️ Environment Variables

Before starting, configure your environment variables. 
The system requires a `.env` in the `/backend` directory and a `.env.local` in the `/frontend` directory.

### Backend (`/backend/.env`)
```env
PORT=5000
GROQ_API_KEY=gsk_your_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
AI_MAX_RETRIES=2
FLASK_ENV=development
```

### Frontend (`/frontend/.env.local`)
```env
VITE_API_URL=http://127.0.0.1:5000/api/v1
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 💻 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/StudyAI.git
   cd StudyAI
   ```

2. **Install Root Dependencies**
   ```bash
   # Installs concurrently to run both servers simultaneously
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Install Backend Dependencies**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cd ..
   ```

5. **Start the Application**
   ```bash
   # From the root directory, this will boot both the Flask and Vite servers
   npm run dev
   ```

## 🛡️ Security & Performance Notes

- **Lazy Loading**: All core routes are chunked via `React.lazy()` resulting in sub-second initial load times.
- **Upload Limits**: Hardcoded 10MB limit and strict Document MIME checks prevent abuse.
- **AI Rate Limiting**: The `ai_service.py` features a strict `30s` timeout and `20,000` character input truncation to prevent prompt stuffing.
- **Security Headers**: Flask injects `X-Content-Type-Options` and `X-Frame-Options` on all outbound API requests.

---

Built with ❤️ for modern learners.
